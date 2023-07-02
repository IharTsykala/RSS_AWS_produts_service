import { Construct } from 'constructs'
import * as dotenv from 'dotenv'

import * as apiGateway from '@aws-cdk/aws-apigatewayv2-alpha'
import { HttpLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations-alpha'
import { HttpLambdaAuthorizer, HttpLambdaResponseType } from '@aws-cdk/aws-apigatewayv2-authorizers-alpha';

import * as cdk from 'aws-cdk-lib'
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs'
import * as lambda from 'aws-cdk-lib/aws-lambda'
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as sqs from 'aws-cdk-lib/aws-sqs';

import * as s3notificaitions from "aws-cdk-lib/aws-s3-notifications";

dotenv.config()

// const basicAuthorizerLambda = lambda.Function.fromFunctionArn(this, 'basicAuthorizer', `arn:aws:lambda:us-east-1:536622564201:function:basicAuthorizer`);

const routes = [
  {
    id: 'ImportProductsFile',
    functionName: 'importProductsFile',
    entry: 'src/lambdas/importProductsFile.ts',
    path: '/import',
    methods: 'GET',
  },
  {
    id: 'GetParser',
    functionName: 'getParser',
    entry: 'src/lambdas/getParser.ts',
    path: '',
    methods: '',
  },
]

export class ImportService extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    const basicAuthorizerLambda = lambda.Function.fromFunctionArn(this, 'basicAuthorizer', `arn:aws:lambda:us-east-1:536622564201:function:basicAuthorization`);

    const authorization =  new HttpLambdaAuthorizer('basicAuthorizer', basicAuthorizerLambda, {
      responseTypes: [HttpLambdaResponseType.IAM]
    })


    // eslint-disable-next-line prettier/prettier
    const queue = sqs.Queue.fromQueueArn(this, 'catalogItemsQueue', process.env.QUEUE_ARN!);

    const sharedLambdaProps = {
      runtime: lambda.Runtime.NODEJS_18_X,
      environment: {
        PRODUCT_AWS_REGION: 'us-east-1',
        S3_BUCKET_NAME: 'import-service3',
        IMPORT_QUEUE_URL: queue.queueUrl,
      },
    }

    const bucket = new s3.Bucket(this, 'ImportBucket', {
        bucketName: "import-service3",
        blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
        removalPolicy: cdk.RemovalPolicy.DESTROY,
        autoDeleteObjects: true,
        cors: [
          {
            allowedOrigins: ["*"],
            allowedMethods: [s3.HttpMethods.GET, s3.HttpMethods.PUT],
            allowedHeaders: ["*"],
            exposedHeaders: [],
          },
      ],
      })

    const api = new apiGateway.HttpApi(this, 'ImportServiceApi', {
      corsPreflight: {
        allowHeaders: ['*'],
        allowOrigins: ['*'],
        allowMethods: [apiGateway.CorsHttpMethod.ANY],
      }
    })

    for (const route of routes) {
      const { id, functionName, entry, path, methods } = route

      const getRoutes = new NodejsFunction(this, id, {
        ...sharedLambdaProps,
        functionName,
        entry,
      })

      queue.grantSendMessages(getRoutes);

      bucket.grantReadWrite(getRoutes);
      bucket.grantDelete(getRoutes);


      if(!methods) {
      queue.grantSendMessages(getRoutes);

      bucket.addEventNotification(
        s3.EventType.OBJECT_CREATED,
        new s3notificaitions.LambdaDestination(getRoutes),
        { prefix: 'uploaded/' }
      )}

      if(methods) {
        api.addRoutes({
          integration: new HttpLambdaIntegration('ImportProductsFile', getRoutes),
          path,
          authorizer: authorization,
          // eslint-disable-next-line prettier/prettier
          methods: [apiGateway.HttpMethod[methods as keyof typeof apiGateway.HttpMethod]],
        })
      }
    }
  }
}
