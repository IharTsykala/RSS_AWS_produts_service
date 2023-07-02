import 'source-map-support/register'
import * as cdk from 'aws-cdk-lib'

import { AuthorizationService } from '../lib/authorizationService'

const app = new cdk.App()
new AuthorizationService(app, 'AuthorizationServiceStack')
app.synth()
