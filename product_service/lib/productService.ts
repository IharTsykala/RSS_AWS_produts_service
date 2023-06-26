import * as cdk from 'aws-cdk-lib'
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs'
import * as apiGateway from '@aws-cdk/aws-apigatewayv2-alpha'
import { HttpLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations-alpha'
import { Construct } from 'constructs'
import * as lambda from 'aws-cdk-lib/aws-lambda'
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb'
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as sns from 'aws-cdk-lib/aws-sns';
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
import * as subscriptions from 'aws-cdk-lib/aws-sns-subscriptions';

const routes = [
  {
    id: 'GetProducts',
    functionName: 'getProducts',
    entry: 'src/lamdas/getProducts.ts',
    path: '/products',
    methods: 'GET',
  },
  {
    id: 'GetProduct',
    functionName: 'getProduct',
    entry: 'src/lamdas/getProduct.ts',
    path: '/products/{idProduct}',
    methods: 'GET',
  },
  {
    id: 'AddProduct',
    functionName: 'addProduct',
    entry: 'src/lamdas/addProduct.ts',
    path: '/products',
    methods: 'POST',
  },
  {
    id: 'CatalogBatchProcess',
    functionName: 'catalogBatchProcess',
    entry: 'src/lambdas/catalogBatchProcess.ts',
    path: '',
    methods: '',
    // handler: "catalogBatchProcessHandler",
    timeout: cdk.Duration.seconds(20)
  },
]

export class ProductService extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    const productsTable = dynamodb.Table.fromTableName(this, 'Products', `products`)
    const stocksTable = dynamodb.Table.fromTableName(this, 'Stocks', 'stocks');

    // const createProductTopic = new sns.Topic(this, 'CreateProductTopic', {
    //   topicName: 'create-product-topic',
    // });

    const sharedLambdaProps = {
      runtime: lambda.Runtime.NODEJS_18_X,
      environment: {
        PRODUCT_AWS_REGION: 'us-east-1',
        TABLE_NAME_PRODUCT: "products",
        TABLE_NAME_STOCK: "stocks",
      },
    }

    const api = new apiGateway.HttpApi(this, 'ProductApi', {
      corsPreflight: {
        allowHeaders: ['*'],
        allowOrigins: ['*'],
        allowMethods: [apiGateway.CorsHttpMethod.ANY],
      },
    })

    const createProductTopic = new sns.Topic(this, 'CreateProductTopic', {
      topicName: 'createProductTopic',
    });

    const firstFilterPolicy = {
      count: sns.SubscriptionFilter.numericFilter({
        lessThanOrEqualTo: 12,
      }),
    };

    createProductTopic.addSubscription(new subscriptions.EmailSubscription('tsykalaihar@gmail.com', {
      filterPolicy: firstFilterPolicy
    }));

    const secondFilterPolicy = {
      count: sns.SubscriptionFilter.numericFilter({
        greaterThan: 12,
      }),
    };

    createProductTopic.addSubscription(
      new subscriptions.EmailSubscription('tsykalaihar23@gmail.com', {
        filterPolicy: secondFilterPolicy
      })
    );

    for (const route of routes) {
      const { id, functionName, entry, path, methods, handler, timeout } = route

      const getRoutes = new NodejsFunction(this, id, {
        ...{...sharedLambdaProps,
        environment: {...sharedLambdaProps.environment,
        CREATE_PRODUCT_TOPIC_ARN: createProductTopic.topicArn}},
        functionName,
        entry,
        handler,
        timeout,
      })

      if(timeout) {
        createProductTopic.grantPublish(getRoutes);

        const catalogItemsQueue = new sqs.Queue(this, 'catalogQueue', {
          queueName: 'catalogQueue',
          visibilityTimeout: timeout
        });

        getRoutes.addEventSource(new SqsEventSource(catalogItemsQueue, {
          batchSize: 5,
        }));
      }

      productsTable.grantReadWriteData(getRoutes);
      stocksTable.grantReadWriteData(getRoutes);

      api.addRoutes({
        integration: new HttpLambdaIntegration('GetProducts', getRoutes),
        path,
        // eslint-disable-next-line prettier/prettier
        methods: [apiGateway.HttpMethod[methods as keyof typeof apiGateway.HttpMethod]],
      })
    }
  }
}
