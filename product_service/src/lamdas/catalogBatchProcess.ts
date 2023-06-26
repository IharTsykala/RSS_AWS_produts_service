import { SNSClient, PublishCommand } from '@aws-sdk/client-sns'

import { handler as addProduct } from './addProduct'

const sns = new SNSClient({})

export const catalogBatchProcess = async (event: any) => {
  console.log('batch', JSON.stringify(event, null, 2))

  try {
    for (const record of event.Records) {
      const response = await addProduct(record)

      console.log('response', response)
      const { message } = JSON.parse(response.body)

      const snsParams = {
        Subject: 'Create product',
        Message: `Product was created ${JSON.stringify(message)}`,
        TopicArn: process.env.ARN_CREATE_PRODUCT_TOPIC,
        MessageAttributes: {
          count: {
            DataType: 'Number',
            StringValue: message.count,
          },
        },
      }

      await sns.send(new PublishCommand(snsParams))
      console.log('SNS was sent', snsParams)
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: event.Records }),
    }
  } catch (err: any) {
    console.error('Error', err)
    return {
      statusCode: 500,
      body: JSON.stringify({ message: `Error ${err.message}` }),
    }
  }
}
