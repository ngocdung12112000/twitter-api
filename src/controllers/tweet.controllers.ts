import { config } from 'dotenv'
import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { TweetType } from '~/constants/enums'
import { TWEETS_MESSAGES } from '~/constants/messages'
import { Pagination, TweetParam, TweetQuery, TweetRequestBody } from '~/models/requests/Tweet.requests'
import { TokenPayload } from '~/models/requests/User.requests'
import tweetsService from '~/services/tweets.services'

config()

export const createTweetController = async (req: Request<ParamsDictionary, any, TweetRequestBody>, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const result = await tweetsService.createTweet(req.body, user_id)
  return res.json({
    message: TWEETS_MESSAGES.CREATE_TWEET_SUCCESS,
    result
  })
}

export const getTweetController = async (req: Request, res: Response) => {
  const result = await tweetsService.increseView(req.params.tweet_id, req.decoded_authorization?.user_id)

  const tweet = {
    ...req.tweet,
    guest_views: result.guest_views,
    user_views: result.user_views,
    updated_at: result.updated_at
  }

  return res.json({
    message: TWEETS_MESSAGES.GET_TWEET_SUCCESS,
    result: tweet
  })
}

export const getTweetChildrenController = async (req: Request<TweetParam, any, any, TweetQuery>, res: Response) => {
  const tweet_id = req.params.tweet_id
  const tweet_type = Number(req.query.tweet_type)
  const page = Number(req.query.page)
  const limit = Number(req.query.limit)
  const user_id = req.decoded_authorization?.user_id
  const { tweets, total } = await tweetsService.getTweetChilren({
    tweet_id,
    tweet_type,
    page,
    limit,
    user_id
  })

  return res.json({
    message: TWEETS_MESSAGES.GET_TWEET_SUCCESS,
    result: {
      tweets,
      tweet_type,
      page,
      limit,
      total,
      total_page: Math.ceil(total / limit)
    }
  })
}

export const getNewFeedsController = async (req: Request<ParamsDictionary, any, any, Pagination>, res: Response) => {
  const user_id = req.decoded_authorization?.user_id as string
  const page = Number(req.query.page)
  const limit = Number(req.query.limit)
  const result = await tweetsService.getNewFeeds({
    user_id,
    page,
    limit
  })

  return res.json({
    message: 'Get new feeds success',
    result: { tweets: result.tweets, page, limit, total: result.total, total_page: Math.ceil(result.total / limit) }
  })
}
