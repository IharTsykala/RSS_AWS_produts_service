import * as cdk from 'aws-cdk-lib'
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs'
import * as apiGateway from '@aws-cdk/aws-apigatewayv2-alpha'
import { HttpLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations-alpha'
import { Construct } from 'constructs'
import * as lambda from 'aws-cdk-lib/aws-lambda'

const routes = [
  {
    id: 'BasicAuthorization',
    functionName: 'basicAuthorization',
    entry: 'src/lambdas/basicAuthorization.ts',
    path: '',
    methods: '',
    handler: "basicAuthorizationHandler",
    userName: "IharTsykala",
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

    const api = new apiGateway.HttpApi(this, 'AuthorizationApi', {
      corsPreflight: {
        allowHeaders: ['*'],
        allowOrigins: ['*'],
        allowMethods: [apiGateway.CorsHttpMethod.ANY],
      },
    })

    for (const route of routes) {

      const { id, functionName, entry, path, methods, handler, userName } = route

      const getRoutes = new NodejsFunction(this, id, {
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

      api.addRoutes({
        integration: new HttpLambdaIntegration('AuthorizationService', getRoutes),
        path,
        // eslint-disable-next-line prettier/prettier
        methods: [apiGateway.HttpMethod[methods as keyof typeof apiGateway.HttpMethod]],
      })
    }
  }
}
