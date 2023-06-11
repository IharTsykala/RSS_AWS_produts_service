import { putProductsDB } from '../product'

const Products = [
  {
    id: 'e5fgh9d2-e552-4fgh-afg9-d401a1e7jrf5',
    title: 'Product',
    description: 'Description',
    price: 4,
  },
  {
    id: 'ee4gh9d2-eg52-4fgh-a6g9-d401a1e6fd56',
    title: 'Product 2',
    description: 'Description 2',
    price: 5,
  },
]

const fillTableProducts = async () => {
  for (const item of Products) {
    try {
      await putProductsDB(item)
      console.log(`Filled ${item.id}`)
    } catch (error) {
      console.error(`Error ${item.id}:`, error.message)
    }
  }
}

fillTableProducts().then()
