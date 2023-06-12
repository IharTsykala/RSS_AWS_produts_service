import { APIGatewayEvent } from 'aws-lambda'
import { response } from '../utils/response'

import { getProductDB } from '../services'

export const handler = async (event: APIGatewayEvent): Promise<any> => {
  try {
    const idProduct = event.pathParameters?.idProduct

    if (!idProduct) {
      return response(500, {
        message: 'Error Id',
      })
    }

    const product = await getProductDB('id', idProduct)
    if (!product) {
      return response(500, {
        message: 'Error Id',
      })
    }

    return response(200, product)
  } catch (error) {
    if (error instanceof Error) {
      return response(500, {
        message: error.message,
      })
    }
  }
}
