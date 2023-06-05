import "source-map-support/register";
import * as cdk from "aws-cdk-lib";

import { ProductService } from "../lib/productService";

const app = new cdk.App();
new ProductService(app, "ProductServiceStack");
app.synth();
