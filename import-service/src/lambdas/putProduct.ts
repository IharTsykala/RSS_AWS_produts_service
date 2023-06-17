import { APIGatewayEvent } from 'aws-lambda'

import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { S3Client, PutObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3'

import { response } from '../utils/response'

const s3Client = new S3Client({ region: 'us-east-1' })

const isFileExist = async (s3Client: { send: any }, bucket: any, key: any) => {
  try {
    await s3Client.send(new HeadObjectCommand({ Bucket: bucket, Key: key }))
    return true
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'NotFound') {
        return false
      } else {
        throw error
      }
    }
  }
}

export const handler = async (event: APIGatewayEvent): Promise<any> => {
  try {
    const fileName = event.queryStringParameters?.name
    console.log('filename: ', event)

    if (!fileName) {
      return response(400, 'Query parameter is required.')
    }

    const putObjectParams = {
      Bucket: 'import-service',
      Key: `uploaded/${fileName}`,
      ContentType: 'text/csv',
    }

    const putObjectCommandInstance = new PutObjectCommand(putObjectParams)

    console.log('putObjectCommandInstance', putObjectCommandInstance)

    const fileNotExistsInS3 = await isFileExist(s3Client, 'us-east-1', putObjectParams.Key)

    if (!fileNotExistsInS3) {
      return response(400, 'There is not this file in s3')
    }

    const signedUrl = await getSignedUrl(s3Client, putObjectCommandInstance, {
      expiresIn: 30,
    })

    console.log('signedUrl', signedUrl)

    return response(200, JSON.stringify({ url: signedUrl }))
  } catch (error) {
    if (error instanceof Error) {
      return response(500, {
        message: error.message,
      })
    }
  }
}
