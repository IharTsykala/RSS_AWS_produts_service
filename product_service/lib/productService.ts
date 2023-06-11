import * as cdk from 'aws-cdk-lib'
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs'
import * as apiGateway from '@aws-cdk/aws-apigatewayv2-alpha'
import { HttpLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations-alpha'
import { Construct } from 'constructs'
import * as lambda from 'aws-cdk-lib/aws-lambda'
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb'

const routes = [
  {
    id: 'GetProducts',
    functionName: 'getProducts',
    entry: 'src/lamdas/getProducts.ts',
    path: '/products',
  },
  {
    id: 'GetProduct',
    functionName: 'getProduct',
    entry: 'src/lamdas/getProduct.ts',
    path: '/products/{idProduct}',
  },
  {
    id: 'AddProduct',
    functionName: 'addProduct',
    entry: 'src/lamdas/addProduct.ts',
    path: '/products',
  },
]

export class ProductService extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    const productsTable = dynamodb.Table.fromTableName(this, 'Products', `Products`)

    const sharedLambdaProps = {
      runtime: lambda.Runtime.NODEJS_18_X,
      environment: {
        PRODUCT_AWS_REGION: 'us-east-1',
      },
    }

    const api = new apiGateway.HttpApi(this, 'ProductApi', {
      corsPreflight: {
        allowHeaders: ['*'],
        allowOrigins: ['*'],
        allowMethods: [apiGateway.CorsHttpMethod.ANY],
      },
    })

    for (const route of routes) {
      const { id, functionName, entry, path } = route

      const getRoutes = new NodejsFunction(this, id, {
        ...sharedLambdaProps,
        functionName,
        entry,
        environment: {
          TABLE_NAME: productsTable.tableName,
        },
      })

      api.addRoutes({
        integration: new HttpLambdaIntegration('GetProducts', getRoutes),
        path,
        methods: [apiGateway.HttpMethod.GET],
      })
    }
  }
}
