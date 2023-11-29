/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-undef */
const { SendEmailCommand, SESClient } = require('@aws-sdk/client-ses')
const { config } = require('dotenv')
import fs from 'fs'
import path from 'path'
import { envConfig } from '~/constants/config'

config()

const verifyEmailTemplate = fs.readFileSync(path.resolve('src/templates/verify-email.html'), 'utf-8')

// Create SES service object.
const sesClient = new SESClient({
  region: envConfig.awsRegion,
  credentials: {
    secretAccessKey: envConfig.awsSecretAccessKey,
    accessKeyId: envConfig.awsAccessKeyId
  }
})

const createSendEmailCommand = ({
  fromAddress,
  toAddresses,
  ccAddresses = [],
  body,
  subject,
  replyToAddresses = []
}: {
  fromAddress: string
  toAddresses: string | string[]
  ccAddresses?: string | string[]
  body: string
  subject: string
  replyToAddresses?: string | string[]
}) => {
  return new SendEmailCommand({
    Destination: {
      /* required */
      CcAddresses: ccAddresses instanceof Array ? ccAddresses : [ccAddresses],
      ToAddresses: toAddresses instanceof Array ? toAddresses : [toAddresses]
    },
    Message: {
      /* required */
      Body: {
        /* required */
        Html: {
          Charset: 'UTF-8',
          Data: body
        }
      },
      Subject: {
        Charset: 'UTF-8',
        Data: subject
      }
    },
    Source: fromAddress,
    ReplyToAddresses: replyToAddresses instanceof Array ? replyToAddresses : [replyToAddresses]
  })
}

export const sendVerifyEmail = (toAddress: string, subject: string, body: string) => {
  const sendEmailCommand = createSendEmailCommand({
    fromAddress: envConfig.sesFromAddress,
    toAddresses: toAddress,
    body,
    subject
  })

  return sesClient.send(sendEmailCommand)
}

export const sendVerifyEmailTemplate = (
  toAddress: string,
  email_verify_token: string,
  template: string = verifyEmailTemplate
) => {
  template = template
    .replace('{{title}}', 'Please verify your email')
    .replace('{{content}}', 'Click button below to verify your email')
    .replace('{{textLink}}', 'Verify')
    .replace('{{link}}', `${envConfig.clientUrl}/verify-email?token=${email_verify_token}`)
  return sendVerifyEmail(toAddress, 'Verify your email', template)
}

export const sendForgotPasswordTemplate = (
  toAddress: string,
  forgot_password_token: string,
  template: string = verifyEmailTemplate
) => {
  template = template
    .replace('{{title}}', 'This email for your reset password request')
    .replace('{{content}}', 'Click button below to reset your password')
    .replace('{{textLink}}', 'Reset Password')
    .replace('{{link}}', `${envConfig.clientUrl}/forgot-password?token=${forgot_password_token}`)
  return sendVerifyEmail(toAddress, 'Forgot password', template)
}
