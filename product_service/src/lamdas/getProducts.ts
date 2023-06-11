import { response } from '../utils/response'
import { getProductsDB, getStocksDB } from '../services'

export const handler = async (): Promise<any> => {
  try {
    const products = (await getProductsDB()) ?? []

    if (!products.length) {
      return []
    }

    const stocks = (await getStocksDB()) ?? []

    if (!stocks.length) {
      return products
    }

    const productWithStock = products.map((product) => {
      return {
        ...product,
        count: stocks.find((stock) => stock.product_id === product.id)?.count ?? 0,
      }
    })

    return response(200, productWithStock)
  } catch (error) {
    if (error instanceof Error) {
      return response(500, {
        message: error.message,
      })
    }
  }
}
