import * as cdk from "aws-cdk-lib";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import * as apiGateway from "@aws-cdk/aws-apigatewayv2-alpha";
import { HttpLambdaIntegration } from "@aws-cdk/aws-apigatewayv2-integrations-alpha";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";

export class ProductService extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const sharedLambdaProps = {
      runtime: lambda.Runtime.NODEJS_18_X,
      environment: {
        PRODUCT_AWS_REGION: "us-east-1",
      },
    };

    const getProducts = new NodejsFunction(this, "GetProducts", {
      ...sharedLambdaProps,
      functionName: "getProducts",
      entry: "src/lamdas/getProducts.ts",
    });

    const getProduct = new NodejsFunction(this, "GetProduct", {
      ...sharedLambdaProps,
      functionName: "getProduct",
      entry: "src/lamdas/getProduct.ts",
    });

    const api = new apiGateway.HttpApi(this, "ProductApi", {
      corsPreflight: {
        allowHeaders: ["*"],
        allowOrigins: ["*"],
        allowMethods: [apiGateway.CorsHttpMethod.ANY],
      },
    });

    api.addRoutes({
      integration: new HttpLambdaIntegration(
        "GetProductsListIntegration",
        getProducts
      ),
      path: "/products",
      methods: [apiGateway.HttpMethod.GET],
    });

    api.addRoutes({
      integration: new HttpLambdaIntegration(
        "GetProductsListIntegration",
        getProduct
      ),
      path: "/products/{idProduct}",
      methods: [apiGateway.HttpMethod.GET],
    });
  }
}
