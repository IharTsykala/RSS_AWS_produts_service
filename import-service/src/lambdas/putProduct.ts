import { APIGatewayEvent } from 'aws-lambda'

import { response } from '../utils/response'

export const handler = async (event: APIGatewayEvent): Promise<any> => {
  try {
  } catch (error) {
    if (error instanceof Error) {
      return response(500, {
        message: error.message,
      })
    }
  }
}
