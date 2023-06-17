import { Construct } from 'constructs'

import * as apiGateway from '@aws-cdk/aws-apigatewayv2-alpha'
import { HttpLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations-alpha'

import * as cdk from 'aws-cdk-lib'
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs'
import * as lambda from 'aws-cdk-lib/aws-lambda'
import * as s3n from "aws-cdk-lib/aws-s3-notifications";
import * as s3 from 'aws-cdk-lib/aws-s3';

import * as s3notificaitions from "aws-cdk-lib/aws-s3-notifications";

const routes = [
  {
    id: 'PutProduct',
    functionName: 'putProduct',
    entry: 'src/lambdas/putProduct.ts',
    path: '/import',
    methods: 'PUT',
  },
  {
    id: 'GetParser',
    functionName: 'getParser',
    entry: 'src/lambdas/getParser.ts',
    path: '/import',
    methods: '',
  },
]

export class ImportService extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    const sharedLambdaProps = {
      runtime: lambda.Runtime.NODEJS_18_X,
      environment: {
        PRODUCT_AWS_REGION: 'us-east-1',
        S3_BUCKET_NAME: 'import-service',
      },
    }

    // const bucket = s3.Bucket(this, 'ImportBucket', {
    //   bucketName: "import-service",
    //   blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
    //   removalPolicy: RemovalPolicy.DESTROY,
    //   autoDeleteObjects: true,
    // });

    const bucket = new s3.Bucket(this, 'ImportBucket', {
        bucketName: "import-service",
        blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
        encryption: s3.BucketEncryption.S3_MANAGED,
        enforceSSL: true,
        versioned: true,
        removalPolicy: cdk.RemovalPolicy.DESTROY,
        autoDeleteObjects: true,
      })

    const api = new apiGateway.HttpApi(this, 'ImportServiceApi', {
      corsPreflight: {
        allowHeaders: ['*'],
        allowOrigins: ['*'],
        allowMethods: [apiGateway.CorsHttpMethod.ANY],
      }
    })

    for (const route: any of routes) {
      const { id, functionName, entry, path, methods } = route

      const getRoutes = new NodejsFunction(this, id, {
        ...sharedLambdaProps,
        functionName,
        entry,
      })

      bucket.grantReadWrite(getRoutes);
      bucket.grantDelete(getRoutes);

      // if(!route.methods) {
      //   bucket.addEventNotification(
      //     s3.EventType.OBJECT_CREATED,
      //     new s3n.LambdaDestination(route),
      //     { prefix: 'upload/' }
      //   );
      // }
      bucket.addEventNotification(
        s3.EventType.OBJECT_CREATED,
        new s3notificaitions.LambdaDestination(getRoutes),
        { prefix: 'upload/' }
      );

      if(route.methods) {
        api.addRoutes({
          integration: new HttpLambdaIntegration('PutProduct', getRoutes),
          path,
          // eslint-disable-next-line prettier/prettier
          methods: [apiGateway.HttpMethod[methods as keyof typeof apiGateway.HttpMethod]],
        })
      }
    }
  }
}
