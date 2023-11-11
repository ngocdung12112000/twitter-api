import { Router } from 'express'
import { createTweetController, getTweetController } from '~/controllers/tweet.controllers'
import { createTweetValidator, tweetIdValidator } from '~/middlewares/tweet.middlewares'
import { accessTokenValidator, isUserLoggedInValidator, verifiedUserValidator } from '~/middlewares/users.midderwares'
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

/**
 * Description: Create Tweet
 * Path: /:tweet_id
 * Method: GET
 * Header: {Authorization?: Bearer <access_token>}
 */
tweetRouter.get(
  '/:tweet_id',
  tweetIdValidator,
  isUserLoggedInValidator(accessTokenValidator),
  isUserLoggedInValidator(verifiedUserValidator),
  wrapRequestHandler(getTweetController)
)

export default tweetRouter
