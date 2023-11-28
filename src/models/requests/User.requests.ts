import { JwtPayload } from 'jsonwebtoken'
import { TokenType, UserVerifyStatus } from '~/constants/enums'
import { ParamsDictionary } from 'express-serve-static-core'

/**
 * @swagger
 * components:
 *   schemas:
 *     LoginBody:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *           example: dung20@gmail.com
 *         password:
 *           type: string
 *           example: 12345678@Abc
 *     SuccessAuthentication:
 *       type: object
 *       properties:
 *         access_token:
 *           type: string
 *           example: JWT token
 *         refresh_token:
 *           type: string
 *           example: JWT token
 *     User:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           format: MongoId
 *           example: '654f95e0bd83f0bc306bb2b4'
 *         name:
 *           type: string
 *           example: 'Ngọc Dũng 2005'
 *         email:
 *           type: string
 *           format: email
 *           example: 'dung2005@gmail.com'
 *         date_of_birth:
 *           type: string
 *           format: ISO8601
 *           example: '2003-09-21T15:18:47.987Z'
 *         created_at:
 *           type: string
 *           format: ISO8601
 *           example: '2023-11-11T14:55:28.100Z'
 *         updated_at:
 *           type: string
 *           format: ISO8601
 *           example: '2023-11-11T14:56:42.724Z'
 *         verify:
 *           $ref: '#/components/schemas/UserVerifyStatus'
 *         twitter_circle:
 *           type: array
 *           items:
 *             type: string
 *             format: MongoId
 *             example: ['654f95e0bd83f0bc306bb2b4']
 *         bio:
 *           type: string
 *           example: ''
 *         location:
 *           type: string
 *           example: ''
 *         website:
 *           type: string
 *           format: uri
 *           example: ''
 *         username:
 *           type: string
 *           example: 'Ngọc Dũng'
 *         avatar:
 *           type: string
 *           example: ''
 *         cover_photo:
 *           type: string
 *           example: ''
 *     UserVerifyStatus:
 *       type: number
 *       enum: [0, 1, 2]
 *       example: 1
 */

export interface LoginReqBody {
  email: string
  password: string
}

export interface RegisterReqBody {
  name: string
  email: string
  password: string
  confirm_password: string
  date_of_birth: string
}

export interface TokenPayload extends JwtPayload {
  user_id: string
  token_type: TokenType
  verify: UserVerifyStatus
  exp: number
  iat: number
}

export interface LogoutReqBody {
  refresh_token: string
}

export interface RefreshTokenReqBody {
  refresh_token: string
}

export interface VerifyEmailReqBody {
  email_verify_token: string
}

export interface ForgetPasswordReqBody {
  email: string
}

export interface VerifyForgotPasswordReqBody {
  forgot_password_token: string
}

export interface ResetPasswordReqBody {
  password: string
}

export interface UpdateMeReqBody {
  name?: string
  date_of_birth?: string
  bio?: string
  location?: string
  website?: string
  username?: string
  avatar?: string
  cover_photo?: string
}

export interface GetProfileReqParams extends ParamsDictionary {
  username: string
}

export interface FollowReqBody {
  followed_user_id: string
}

export interface UnFollowReqParams extends ParamsDictionary {
  user_id: string
}

export interface ChangePasswordReqBody {
  old_password: string
  password: string
  confirm_new_password: string
}
