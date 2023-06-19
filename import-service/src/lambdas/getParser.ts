import csvParser from 'csv-parser'

import { S3, S3Client, CopyObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'

import { PassThrough, Readable } from 'stream'

const s3Client = new S3({})

const getObjectReadStream = async (bucket: string, key: any) => {
  const passThroughStream = new PassThrough()
  const params = { Bucket: bucket, Key: key }

  const { Body } = await s3Client.getObject(params)

  if (Body instanceof Readable) {
    Body.pipe(passThroughStream)
  }

  return passThroughStream
}

const client = new S3Client({ region: 'us-east-1' })

export const handler = async (event: any) => {
  for (const record of event.Records) {
    const { key } = record.s3.object

    if (!key.startsWith('uploaded/')) {
      continue
    }

    const readStream = await getObjectReadStream('import-service3', key)

    readStream
      .pipe(csvParser())
      .on('data', (data) => {
        console.log('CSV file was recorded', data)
      })
      .on('end', () => {
        console.log('CSV parsing was completed', key)
      })
      .on('error', (error) => {
        console.error('Error', error)
      })

    await client.send(
      new CopyObjectCommand({
        Bucket: 'import-service3',
        CopySource: `import-service3/${key}`,
        Key: key.replace('uploaded', 'parsed'),
      })
    )

    console.log('Copied ws finished to parsed')

    await client.send(new DeleteObjectCommand({ Bucket: 'import-service3', Key: key }))
    console.log('Source file was deleted')
  }
}
