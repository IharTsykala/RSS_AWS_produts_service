import * as AWS from 'aws-sdk'

interface IProduct {
  id: string;
  title: string;
  description: string | undefined;
  price: number | undefined;
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

export const getStocksDB = async () => {
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
