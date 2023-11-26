import { faker } from '@faker-js/faker'
import { TweetAudience, TweetType, UserVerifyStatus } from '~/constants/enums'
import User from '~/models/schemas/User.schema'
import { hashPassword } from './crypto'
import { ObjectId } from 'mongodb'
import Tweet from '~/models/schemas/Tweet.schema'
import Follower from '~/models/schemas/Follower.schema'
import databaseService from '~/services/database.services'
import { Request } from 'express'
import { ErrorWithStatus } from '~/models/Errors'
import { USER_MESSAGES } from '~/constants/messages'
import HTTP_STATUS from '~/constants/httpStatus'
import { verifyToken } from './jwt'

export const numberEnumToArray = (numberEnum: { [key: string]: string | number }) => {
  return Object.values(numberEnum).filter((value) => typeof value === 'number') as number[]
}

export const createDataFake = async () => {
  const dataUser = []
  const tweetData = []
  const followData = []
  const MY_ID = '654f95e0bd83f0bc306bb2b4'

  for (let index = 0; index < 100; index++) {
    const newUser = new User({
      _id: new ObjectId(),
      name: faker.person.fullName(),
      email: `${faker.person.lastName()}${index + 3}@gmail.com`,
      username: `${faker.person.lastName()}${index + 3}`,
      date_of_birth: faker.date.birthdate(),
      password: hashPassword('12345678@Abc'),
      verify: UserVerifyStatus.Verified
    })

    const newTweet = new Tweet({
      _id: new ObjectId(),
      audience: TweetAudience.EveryOne,
      content: `Tweet${index + 1} ${newUser.name}`,
      parent_id: null,
      hashtags: [],
      mentions: [],
      medias: [],
      user_id: newUser._id as ObjectId,
      type: TweetType.Tweet
    })

    const newCommentTweet = new Tweet({
      _id: new ObjectId(),
      audience: TweetAudience.EveryOne,
      content: `Comment Tweet${index + 1} ${newUser.name}`,
      parent_id: newTweet._id?.toString() as string,
      hashtags: [],
      mentions: [],
      medias: [],
      user_id: newUser._id as ObjectId,
      type: TweetType.Comment
    })

    const newFollow = new Follower({
      user_id: new ObjectId(MY_ID),
      followed_user_id: newUser._id as ObjectId
    })

    followData.push(newFollow)
    tweetData.push(newTweet)
    tweetData.push(newCommentTweet)
    dataUser.push(newUser)
  }
  console.log('Insert data')
  await databaseService.users.insertMany(dataUser)
  await databaseService.tweets.insertMany(tweetData)
  await databaseService.followers.insertMany(followData)
}

export const verifyAccessToken = async (access_token: string, req?: Request) => {
  if (!access_token) {
    throw new ErrorWithStatus({
      message: USER_MESSAGES.ACCESS_TOKEN_IS_REQUIRED,
      status: HTTP_STATUS.UNAUTHORIZED
    })
  }
  try {
    const decoded_authorization = await verifyToken({
      token: access_token,
      secretOrPublicKey: process.env.JWT_SECRET_ACCESS_TOKEN as string
    })
    if (req) {
      ;(req as Request).decoded_authorization = decoded_authorization
      return true
    }
    return decoded_authorization
  } catch (error) {
    throw new ErrorWithStatus({
      message: 'Error in verifyToken',
      status: HTTP_STATUS.UNAUTHORIZED
    })
  }
}
