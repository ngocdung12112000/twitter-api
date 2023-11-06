import { Router } from 'express'
import { createTweetController } from '~/controllers/tweet.controllers'
import { createTweetValidator } from '~/middlewares/tweet.middlewares'
import { accessTokenValidator, verifiedUserValidator } from '~/middlewares/users.midderwares'
import { wrapRequestHandler } from '~/utils/handlers'

const tweetRouter = Router()

/**
 * Description: Create Tweet
 * Path: /
 * Method: POST
 * Body: TweetRequestBody
 */
tweetRouter.post(
  '/',
  accessTokenValidator,
  verifiedUserValidator as any,
  createTweetValidator,
  wrapRequestHandler(createTweetController)
)

export default tweetRouter
