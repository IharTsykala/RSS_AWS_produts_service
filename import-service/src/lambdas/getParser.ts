import csvParser from 'csv-parser'
import { PassThrough, Readable } from 'stream'

import { SQSClient } from '@aws-sdk/client-sqs'
import { S3, S3Client, CopyObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { SendMessageCommand } from '@aws-sdk/client-sqs'

const s3Client = new S3({})
const sqsClient = new SQSClient({ region: 'us-east-1' })

const getObjectReadStream = async (bucket: string, key: any) => {
  const passThroughStream = new PassThrough()
  const params = { Bucket: bucket, Key: key }

  const { Body } = await s3Client.getObject(params)

  if (Body instanceof Readable) {
    Body.pipe(passThroughStream)
  }

  return passThroughStream
}

const csvRecords = (stream: Readable, onRecordHandler: any) => {
  return new Promise((resolve, reject) => {
    stream
      .pipe(csvParser())
      .on('data', async (data: any) => {
        stream.pause()

        await onRecordHandler(data)

        stream.resume()
      })
      .on('end', resolve)
      .on('error', reject)
  })
}

const client = new S3Client({ region: 'us-east-1' })

export const handler = async (event: any) => {
  for (const record of event.Records) {
    const { key } = record.s3.object

    if (!key.startsWith('uploaded/')) {
      continue
    }

    const readStream = await getObjectReadStream('import-service3', key)

    await csvRecords(readStream, async (data: any) => {
      console.log('CSV record:', data)

      const sendMessageCommand = new SendMessageCommand({
        QueueUrl: process.env.QUEUE_URL,
        MessageBody: JSON.stringify(data),
      })

      try {
        await sqsClient.send(sendMessageCommand)
        console.log('Message was sentSQS:', data)
      } catch (error) {
        console.error('Error sending message:', error)
      }
    })

    await client.send(
      new CopyObjectCommand({
        Bucket: 'import-service3',
        CopySource: `import-service3/${key}`,
        Key: key?.replace('uploaded', 'parsed'),
      })
    )

    console.log('Copied ws finished to parsed')

    await client.send(new DeleteObjectCommand({ Bucket: 'import-service3', Key: key }))
    console.log('Source file was deleted')
  }
}
