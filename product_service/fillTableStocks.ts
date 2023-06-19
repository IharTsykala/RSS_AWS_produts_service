const { putStockDB } = require('./src/services')

const Stocks = [
  {
    product_id: 'eefgh9d2-e552-4fgh-afg9-d401a1egjjf4',
    count: 10,
  },
  {
    product_id: 'eefgh9d2-e552-4fgh-afg9-d401a1egjjf4',
    count: 11,
  },
  {
    product_id: 'ee6579d2-ed62-4653-a209-d401a1e33b35',
    count: 12,
  },
  {
    product_id: '8b8affdc-f7bf-4366-baab-9bfc07e45678',
    count: 14,
  },
  {
    product_id: 'ee657df2-ed62-4563-afg9-d4dfa1edffg6',
    count: 15,
  },
  {
    product_id: 'e5fgh9d2-e552-4fgh-afg9-d401a1e7jrf5',
    count: 2,
  },
  {
    product_id: 'ee4gh9d2-eg52-4fgh-a6g9-d401a1e6fd56',
    count: 1,
  },
]

const fillStocksTable = async () => {
  for (const item of Stocks) {
    try {
      await putStockDB(item)
      console.log(`Filled ${item.product_id}`)
    } catch (error) {
      if (error instanceof Error) {
        console.log(`Error ${item.product_id}`, error.message)
      }
    }
  }
}

fillStocksTable().then()
