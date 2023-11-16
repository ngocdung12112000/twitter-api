import { NextFunction, Request, Response } from 'express'
import { checkSchema } from 'express-validator'
import { isEmpty } from 'lodash'
import { ObjectId } from 'mongodb'
import { MediaType, TweetAudience, TweetType, UserVerifyStatus } from '~/constants/enums'
import HTTP_STATUS from '~/constants/httpStatus'
import { TWEETS_MESSAGES, USER_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import Tweet from '~/models/schemas/Tweet.schema'
import databaseService from '~/services/database.services'
import { numberEnumToArray } from '~/utils/common'
import { wrapRequestHandler } from '~/utils/handlers'
import { validate } from '~/utils/validations'

const tweetTypes = numberEnumToArray(TweetType)
const tweetAudiences = numberEnumToArray(TweetAudience)
const mediaTypes = numberEnumToArray(MediaType)

export const createTweetValidator = validate(
  checkSchema({
    type: {
      isIn: {
        options: [tweetTypes],
        errorMessage: TWEETS_MESSAGES.INVALID_TYPE
      }
    },
    audience: {
      isIn: {
        options: [tweetAudiences],
        errorMessage: TWEETS_MESSAGES.INVALID_AUDIENCE
      }
    },
    parent_id: {
      custom: {
        options: (value, { req }) => {
          const type = req.body.type as TweetType
          if ([TweetType.Retweet, TweetType.Comment, TweetType.QuoteTweet].includes(type) && !ObjectId.isValid(value)) {
            throw new Error(TWEETS_MESSAGES.PARENT_ID_MUST_BE_A_VALID_TWEET_ID)
          }

          if (type === TweetType.Tweet && value !== null) {
            throw new Error(TWEETS_MESSAGES.PARENT_ID_MUST_BE_NULL)
          }
          return true
        }
      }
    },
    content: {
      isString: true,
      custom: {
        options: (value, { req }) => {
          const type = req.body.type as TweetType
          const hashtags = req.body.hashtags as string[]
          const mentions = req.body.mentions as string[]

          if (
            [TweetType.Tweet, TweetType.Comment, TweetType.QuoteTweet].includes(type) &&
            isEmpty(hashtags) &&
            isEmpty(mentions) &&
            value === ''
          ) {
            throw new Error(TWEETS_MESSAGES.CONTENT_MUST_BE_A_NON_EMPTY_STRING)
          }

          if (type === TweetType.Retweet && value !== '') {
            throw new Error(TWEETS_MESSAGES.CONTENT_MUST_BE_AN_EMPTY_STRING)
          }
          return true
        }
      }
    },
    hashtags: {
      isArray: true,
      custom: {
        options: (value, { req }) => {
          if (value.some((item: any) => typeof item !== 'string')) {
            throw new Error(TWEETS_MESSAGES.HASHTAGS_MUST_BE_AN_ARRAY_OF_STRING)
          }
          return true
        }
      }
    },
    mentions: {
      isArray: true,
      custom: {
        options: (value, { req }) => {
          if (value.some((item: any) => !ObjectId.isValid(item))) {
            throw new Error(TWEETS_MESSAGES.MENTIONS_MUST_BE_AN_ARRAY_OF_USER_ID)
          }
          return true
        }
      }
    },
    medias: {
      isArray: true,
      custom: {
        options: (value, { req }) => {
          if (
            value.some((item: any) => {
              return typeof item.url !== 'string' || !mediaTypes.includes(item.type)
            })
          ) {
            throw new Error(TWEETS_MESSAGES.MEDIAS_MUST_BE_AN_ARRAY_OF_MEDIA_OBJECT)
          }
          return true
        }
      }
    }
  })
)

export const tweetIdValidator = validate(
  checkSchema(
    {
      tweet_id: {
        isMongoId: {
          errorMessage: TWEETS_MESSAGES.INVALID_TWEET_ID
        },
        custom: {
          options: async (value, { req }) => {
            const tweet = (
              await databaseService.tweets
                .aggregate<Tweet>([
                  {
                    $match: {
                      _id: new ObjectId(value)
                    }
                  },
                  {
                    $lookup: {
                      from: 'hashtags',
                      localField: 'hashtags',
                      foreignField: '_id',
                      as: 'hashtags'
                    }
                  },
                  {
                    $lookup: {
                      from: 'users',
                      localField: 'mentions',
                      foreignField: '_id',
                      as: 'mentions'
                    }
                  },
                  {
                    $addFields: {
                      mentions: {
                        $map: {
                          input: '$mentions',
                          as: 'mention',
                          in: {
                            _id: '$$mention._id',
                            name: '$$mention.name',
                            username: '$$mention.username',
                            email: '$$mention.email'
                          }
                        }
                      }
                    }
                  },
                  {
                    $lookup: {
                      from: 'bookmarks',
                      localField: '_id',
                      foreignField: 'tweet_id',
                      as: 'bookmarks'
                    }
                  },
                  {
                    $lookup: {
                      from: 'tweets',
                      localField: '_id',
                      foreignField: 'parent_id',
                      as: 'tweet_children'
                    }
                  },
                  {
                    $addFields: {
                      bookmarks: {
                        $size: '$bookmarks'
                      },
                      retweet_count: {
                        $size: {
                          $filter: {
                            input: '$tweet_children',
                            as: 'item',
                            cond: {
                              $eq: ['$$item.type', TweetType.Retweet]
                            }
                          }
                        }
                      },
                      comment_count: {
                        $size: {
                          $filter: {
                            input: '$tweet_children',
                            as: 'item',
                            cond: {
                              $eq: ['$$item.type', TweetType.Comment]
                            }
                          }
                        }
                      },
                      quotetweet_count: {
                        $size: {
                          $filter: {
                            input: '$tweet_children',
                            as: 'item',
                            cond: {
                              $eq: ['$$item.type', TweetType.QuoteTweet]
                            }
                          }
                        }
                      }
                    }
                  },
                  {
                    $project: {
                      tweet_children: 0
                    }
                  }
                ])
                .toArray()
            )[0]

            if (!tweet) {
              throw new ErrorWithStatus({
                status: HTTP_STATUS.NOT_FOUND,
                message: TWEETS_MESSAGES.TWEET_NOT_FOUND
              })
            }
            ;(req as Request).tweet = tweet
            return true
          }
        }
      }
    },
    ['params', 'body']
  )
)

export const audienceValidator = wrapRequestHandler(async (req: Request, res: Response, next: NextFunction) => {
  const tweet = req.tweet as Tweet
  if (tweet.audience === TweetAudience.TweetCircle) {
    // Check is this user logged in
    if (!req.decoded_authorization) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.UNAUTHORIZED,
        message: USER_MESSAGES.ACCESS_TOKEN_IS_REQUIRED
      })
    }

    // Check user that creat this tweet is locked or deleted
    const author = await databaseService.users.findOne({
      _id: new ObjectId(tweet.user_id)
    })

    if (!author || author.verify === UserVerifyStatus.Banned) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.NOT_FOUND,
        message: USER_MESSAGES.USER_NOT_FOUND
      })
    }

    // Check this user view this tweet that in Twiiter Circle of author
    const { user_id } = req.decoded_authorization
    const isInTwitterCircle = author.twitter_circle.some((user_circle_id) => user_circle_id.equals(user_id))

    if (!isInTwitterCircle && !author._id.equals(user_id)) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.FORBIDDEN,
        message: TWEETS_MESSAGES.TWEET_IS_NOT_PUBLIC
      })
    }
  }
  next()
})

export const getTweetChildrenValidator = validate(
  checkSchema(
    {
      tweet_type: {
        isIn: {
          options: [tweetTypes],
          errorMessage: TWEETS_MESSAGES.INVALID_TYPE
        }
      }
    },
    ['query']
  )
)

export const paginationValidator = validate(
  checkSchema(
    {
      limit: {
        isNumeric: true,
        custom: {
          options: (value, { req }) => {
            const num = Number(value)
            if (num > 100 || num < 1) {
              throw new Error('1 <= limit <= 100')
            }
            return true
          }
        }
      },
      page: {
        isNumeric: true,
        custom: {
          options: (value, { req }) => {
            const num = Number(value)
            if (num < 1) {
              throw new Error('page >= 1')
            }
            return true
          }
        }
      }
    },
    ['query']
  )
)
