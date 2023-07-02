import * as cdk from 'aws-cdk-lib'
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs'
import { Construct } from 'constructs'
import * as lambda from 'aws-cdk-lib/aws-lambda'
import { config as dotenvConfig } from 'dotenv'
dotenvConfig()

const routes = [
  {
    id: 'basicAuthorization',
    functionName: 'basicAuthorization',
    entry: 'src/lambdas/basicAuthorization.ts',
    handler: 'basicAuthorization',
    userName: 'IharTsykala',
  },
]

export class AuthorizationService extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    const sharedLambdaProps = {
      runtime: lambda.Runtime.NODEJS_18_X,
      environment: {
        PRODUCT_AWS_REGION: 'us-east-1',
      },
    }

    for (const route of routes) {
      const { id, functionName, entry, handler, userName } = route

      new NodejsFunction(this, id, {
        ...sharedLambdaProps,
        functionName,
        entry,
        handler,
        environment: {
          ...sharedLambdaProps.environment,
          // eslint-disable-next-line prettier/prettier
          [userName]: process.env[userName]!,
        },
      })
    }
  }
}
