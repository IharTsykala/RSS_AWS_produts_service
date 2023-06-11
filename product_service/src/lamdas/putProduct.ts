import { v4 as uuid } from 'uuid'

import { response } from '../utils/response'
import { putProductsDB } from '../services'

export const handler = async (event) => {
  try {
    const { title, description, price } = JSON.parse(event.body)

    if (!title) {
      return response(400, 'Title is required field')
    }

    const product = {
      id: uuid(),
      title,
      description,
      price,
    }

    await putProductsDB(product)

    return response(200, 'Product was added')
  } catch (error) {
    if (error instanceof Error) {
      return response(500, {
        message: error.message,
      })
    }
  }
}
