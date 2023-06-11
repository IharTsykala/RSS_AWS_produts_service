import { putStockDB } from '../product'

const Stocks = [
  {
    product_id: 'e5fgh9d2-e5g2-4fgh-afy9-d401a1e7jrf5',
    count: 10,
  },
  {
    product_id: 'ee4gh9d2-eg52-4fgh-a6g9-d401a166fd59',
    count: 11,
  },
]

const fillStocksTable = async () => {
  for (const item of Stocks) {
    try {
      await putStockDB(item)
      console.log(`Filled ${item.product_id}`)
    } catch (error) {
      console.log(`Error ${item.product_id}`, error.message)
    }
  }
}

fillStocksTable().then()
