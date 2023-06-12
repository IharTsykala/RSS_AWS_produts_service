const { putProductsDB } = require('./src/services')

const Products = [
  {
    id: 'eefgh9d2-e552-4fgh-afg9-d401a1egjjf4',
    title: 'Product',
    description: 'Description',
    price: 1,
  },
  {
    id: '78ff7df2-ed62-ert3-afg9-34fga1edffg',
    title: 'Product 2',
    description: 'Description 2',
    price: 2,
  },
  {
    id: 'ee6579d2-ed62-4653-a209-d401a1e33b35',
    title: 'Product 3',
    description: 'Description 3',
    price: 3,
  },
  {
    id: '8b8affdc-f7bf-4366-baab-9bfc07e45678',
    title: 'Product 4',
    description: 'Description 4',
    price: 4,
  },
  {
    id: 'ee657df2-ed62-4563-afg9-d4dfa1edffg6',
    title: 'Product 5',
    description: 'Test description 5',
    price: 5,
  },
  {
    id: 'e5fgh9d2-e552-4fgh-afg9-d401a1e7jrf5',
    title: 'Product 6',
    description: 'Description 6',
    price: 6,
  },
  {
    id: 'ee4gh9d2-eg52-4fgh-a6g9-d401a1e6fd56',
    title: 'Product 7',
    description: 'Description 7',
    price: 7,
  },
]

const fillTableProducts = async () => {
  for (const item of Products) {
    try {
      await putProductsDB(item)
      console.log(`Filled ${item.id}`)
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Error ${item.id}:`, error.message)
      }
    }
  }
}

fillTableProducts().then()
