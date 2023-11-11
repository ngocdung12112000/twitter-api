import { Router } from 'express'
import { bookmarkController, unbookmarkController } from '~/controllers/bookmarks.controller'
import { tweetIdValidator } from '~/middlewares/tweet.middlewares'
import { accessTokenValidator, verifiedUserValidator } from '~/middlewares/users.midderwares'
import { wrapRequestHandler } from '~/utils/handlers'

const bookmarkRouter = Router()

/**
 * Description: Create Tweet
 * Path: /
 * Method: POST
 * Body: TweetRequestBody
 */
bookmarkRouter.post(
  '/',
  accessTokenValidator,
  verifiedUserValidator as any,
  tweetIdValidator,
  wrapRequestHandler(bookmarkController)
)

/**
 * Description: Create Tweet
 * Path: /:tweet_id
 * Method: DELETE
 * Body: TweetRequestBody
 */
bookmarkRouter.delete(
  '/tweets/:tweet_id',
  accessTokenValidator,
  verifiedUserValidator as any,
  tweetIdValidator,
  wrapRequestHandler(unbookmarkController)
)

export default bookmarkRouter
