import { response } from '../utils/response'

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

export const handler = async (event: any): Promise<any> => {
  console.log('basicAuthorizationHandler', JSON.stringify(event, null, 2))

  try {
    const { authorizationToken, methodArn } = event

    if (!authorizationToken) {
      return response(400, getBody('Deny', methodArn))
    }

    const encodedCredentials = authorizationToken.split(' ')[1]

    const [username, password] = Buffer.from(encodedCredentials, 'base64').toString().split(':')

    console.log(`username: ${username}, password ${password}`)

    const storedPassword = process.env[username]
    const effect = !storedPassword || storedPassword !== password ? 'Deny' : 'Allow'

    return response(200, getBody(effect, methodArn))
  } catch (error) {
    if (error instanceof Error) {
      return response(500, {
        message: error.message,
      })
    }
  }
}
