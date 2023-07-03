import { APIGatewayEvent } from 'aws-lambda'

import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

import { response } from '../utils/response'

const s3 = new S3Client({ region: 'us-east-1' })

export const handler = async (event: APIGatewayEvent): Promise<any> => {
  try {
    const fileName = event.queryStringParameters?.name
    console.log('filename', fileName)

    if (!fileName) {
      return response(400, 'Query parameter is required.')
    }

    const putObjectParams = {
      Bucket: 'import-service3',
      Key: `uploaded/${fileName}`,
    }

    const putObjectCommandInstance = new PutObjectCommand(putObjectParams)

    console.log('putObjectCommandInstance', putObjectCommandInstance)

    const signedUrl = await getSignedUrl(s3, putObjectCommandInstance, {
      expiresIn: 120,
    })

    console.log('signedUrl', signedUrl)

    return response(200, { message: signedUrl })
  } catch (error) {
    if (error instanceof Error) {
      return response(500, {
        message: error.message,
      })
    }
  }
}
