import 'source-map-support/register'
import * as cdk from 'aws-cdk-lib'

import { ImportService } from '../lib/importService'

const app = new cdk.App()
new ImportService(app, 'ProductServiceStack')
app.synth()
