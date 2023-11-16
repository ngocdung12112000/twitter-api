import { Router } from 'express'
import {
  createTweetController,
  getNewFeedsController,
  getTweetChildrenController,
  getTweetController
} from '~/controllers/tweet.controllers'
import {
  audienceValidator,
  createTweetValidator,
  getTweetChildrenValidator,
  paginationValidator,
  tweetIdValidator
} from '~/middlewares/tweet.middlewares'
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
 * Description: Get tweet detail
 * Path: /:tweet_id
 * Method: GET
 * Header: {Authorization?: Bearer <access_token>}
 */
tweetRouter.get(
  '/:tweet_id',
  tweetIdValidator,
  isUserLoggedInValidator(accessTokenValidator),
  isUserLoggedInValidator(verifiedUserValidator),
  audienceValidator,
  wrapRequestHandler(getTweetController)
)

/**
 * Description: Get tweet children
 * Path: /:tweet_id
 * Method: GET
 * Header: {Authorization?: Bearer <access_token>}
 * Query: {limit: number, page: number, tweet_type: TweetType}
 */
tweetRouter.get(
  '/:tweet_id/children',
  tweetIdValidator,
  paginationValidator,
  getTweetChildrenValidator,
  isUserLoggedInValidator(accessTokenValidator),
  isUserLoggedInValidator(verifiedUserValidator),
  audienceValidator,
  wrapRequestHandler(getTweetChildrenController)
)

/**
 * Description: Get new-feeds
 * Path: /:tweet_id
 * Method: GET
 * Header: {Authorization: Bearer <access_token>}
 * Query: {limit: number, page: number}
 */
tweetRouter.get(
  '/',
  paginationValidator,
  accessTokenValidator,
  verifiedUserValidator,
  wrapRequestHandler(getNewFeedsController)
)

export default tweetRouter
