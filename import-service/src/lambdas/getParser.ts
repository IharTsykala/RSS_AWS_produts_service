import csvParser from 'csv-parser'

import { S3 } from '@aws-sdk/client-s3'

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

export const handler = async (event: any) => {
  for (const record of event.Records) {
    const { key } = record.s3.object

    if (!key.startsWith('upload/')) {
      continue
    }

    const readStream = await getObjectReadStream('import-service', key)

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
  }
}
