import { response } from '../utils/response'

export const handler = async (): Promise<any> => {
  try {
    return response(200, {})
  } catch (error) {
    if (error instanceof Error) {
      return response(500, {
        message: error.message,
      })
    }
  }
}
