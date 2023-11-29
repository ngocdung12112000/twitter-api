import argv from 'minimist'
import { config } from 'dotenv'
const options = argv(process.argv.slice(2))
config()
export const isProduction = Boolean(options.production)

export const envConfig = {
  port: (process.env.PORT as string) || 4000,
  host: process.env.HOST as string,
  dbName: process.env.DB_NAME as string,
  dbUsername: process.env.DB_USERNAME as string,
  dbPassword: process.env.DB_PASSWORD as string,
  dbRefreshTokenCollection: process.env.DB_REFRESH_TOKEN_COLLECTION as string,
  userCollection: process.env.USER_COLLECTION as string,
  tweetCollection: process.env.TWEET_COLLECTION as string,
  dbFollowerCollection: process.env.DB_FOLLOWER_COLLECTION as string,
  dbVideoStatusCollection: process.env.DB_VIDEO_STATUS_COLLECTION as string,
  dbHashtagCollection: process.env.DB_HASHTAG_COLLECTION as string,
  dbBookmarkCollection: process.env.DB_BOOKMARK_COLLECTION as string,
  dbConversationCollection: process.env.DB_CONVERSATION_COLLECTION as string,
  passwordSecret: process.env.PASSWORD_SECRE as string,
  jwtSecretAccessToken: process.env.JWT_SECRET_ACCESS_TOKEN as string,
  jwtSecretRefreshToken: process.env.JWT_SECRET_REFRESH_TOKEN as string,
  jwtSecretEmailVerifyToken: process.env.JWT_SECRET_EMAIL_VERIFY_TOKEN as string,
  jwtSecretForgotPasswordToken: process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN as string,
  accessExpiresIn: process.env.ACCESS_EXPIRES_IN as string,
  refreshExpiresIn: process.env.REFRESH_EXPIRES_IN as string,
  emailVerifyExpiresIn: process.env.EMAIL_VERIFY_EXPIRES_IN as string,
  forgotPasswordTokenExpiresIn: process.env.FORGOT_PASSWORD_TOKEN_EXPIRES_IN as string,
  googleClientId: process.env.GOOGLE_CLIENT_ID as string,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
  googleRedirectUri: process.env.GOOGLE_REDIRECT_URI as string,
  clientRedicrectCallback: process.env.CLIENT_REDICRECT_CALLBACK as string,
  clientUrl: process.env.CLIENT_URL as string,
  awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
  awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
  awsRegion: process.env.AWS_REGION as string,
  sesFromAddress: process.env.SES_FROM_ADDRESS as string,
  s3BucketName: process.env.S3_BUCKET_NAME as string
}
