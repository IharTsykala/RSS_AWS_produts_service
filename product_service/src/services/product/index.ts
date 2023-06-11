import * as AWS from 'aws-sdk'

interface IProduct {
  id: string;
  title: string;
  description: string | undefined;
  price: number | undefined;
}

interface ProductWithCount extends IProduct {
  count: number;
}

interface IStock {
  product_id: string;
  count: number;
}

AWS.config.update({ region: 'us-east-1' })
const dynamoDB = new AWS.DynamoDB.DocumentClient()

export const getProductsDB = async () => {
  const result = await dynamoDB
    .scan({
      TableName: 'Products',
    })
    .promise()

  return result.Items
}

export const getProductDB = async (id: string) => {
  const result = await dynamoDB
    .get({
      TableName: 'Products',
      Key: {
        id: id,
      },
    })
    .promise()

  return result.Item
}

export const putProductsDB = async (newProduct: IProduct) => {
  const body = {
    TableName: 'Products',
    Item: newProduct,
  }
  //@ts-ignore
  return await dynamoDB.put(body).promise()
}

export const getStockDB = async () => {
  const result = await dynamoDB
    .scan({
      TableName: 'Stocks',
    })
    .promise()

  return result.Items
}

export const putStockDB = async (newStockItem: IStock) => {
  const body = {
    TableName: 'Stocks',
    Item: newStockItem,
  }
  //@ts-ignore
  return await dynamoDB.put(body).promise()
}

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

const fillTableWithTestProducts = async () => {
  for (const item of Products) {
    try {
      await putProductsDB(item)
      console.log(`Filled ${item.id}`)
    } catch (error) {
      console.error(`Error ${item.id}:`, error)
    }
  }
}

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

const fillTableWithTestStockItems = async () => {
  for (const item of Stocks) {
    try {
      await putStockDB(item)
      console.log(`Filled ${item.product_id}`)
    } catch (error) {
      console.log(`Error ${item.product_id}`)
    }
  }
}

fillTableWithTestProducts().then()
fillTableWithTestStockItems().then()
