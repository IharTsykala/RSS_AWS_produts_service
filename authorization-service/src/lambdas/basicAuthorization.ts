import { response } from '../utils/response'

import { config as dotenvConfig } from 'dotenv'
dotenvConfig()

const getBody = (effect: string, methodArn: string) => {
  return {
    principalId: 'user',
    policyDocument: {
      Version: '2012-10-17',
      Statement: [
        {
          Action: 'execute-api:Invoke',
          Effect: effect,
          Resource: methodArn,
        },
      ],
    },
  }
}

export const handler = async (event: any, _: any, callback: any): Promise<any> => {
  try {
    const { authorizationToken, methodArn } = event

    if (!authorizationToken) {
      callback('Unauthorized')
    }

    const encodedCredentials = authorizationToken.split(' ')[1]

    const [username, password] = Buffer.from(encodedCredentials, 'base64').toString('utf-8').split(':')

    console.log(`username ${username}, password ${password}`)

    // eslint-disable-next-line prettier/prettier
    const storedPassword = process.env["IharTsykala"]!
    const effect = !storedPassword || storedPassword !== password ? 'Deny' : 'Allow'

    return response(getBody(effect, methodArn))
  } catch (error) {
    if (error instanceof Error) {
      return response(getBody('Deny', event.methodArn))
    }
  }
}
