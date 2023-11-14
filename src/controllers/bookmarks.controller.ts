import { config } from 'dotenv'
import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { BOOKMARKS_MESSAGES } from '~/constants/messages'
import { BookmarkTweetReqBody } from '~/models/requests/Bookmark.requests'
import { TokenPayload } from '~/models/requests/User.requests'
import bookmarkService from '~/services/bookmarks.services'

config()

export const bookmarkController = async (req: Request<ParamsDictionary, any, BookmarkTweetReqBody>, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const result = await bookmarkService.bookmarkTweet(user_id, req.body.tweet_id)
  return res.json({
    message: BOOKMARKS_MESSAGES.BOOKMARKS_SUCCESS,
    result
  })
}

export const unbookmarkController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const result = await bookmarkService.unbookmarkTweet(req.params.tweet_id, user_id)
  return res.json({
    message: BOOKMARKS_MESSAGES.UNBOOKMARKS_SUCCESS,
    result
  })
}
