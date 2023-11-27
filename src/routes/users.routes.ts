import { Router } from 'express'
import {
  verifyEmailController,
  loginController,
  logoutController,
  registerController,
  resendverifyEmailController,
  forgotPasswordController,
  verifyForgotPasswordController,
  resetPasswordController,
  getMeController,
  updateMeController,
  getProfleController,
  followController,
  unFollowController,
  changePasswordController,
  oauthController,
  refreshTokenController
} from '~/controllers/users.controllers'
import { filterMiddleware } from '~/middlewares/common.middlewares'
import {
  accessTokenValidator,
  changePasswordValidator,
  emailVerifyTokenValidator,
  followValidator,
  forgotPasswordValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator,
  resetPasswordValidator,
  unFollowValidator,
  updateMeValidator,
  verifiedUserValidator,
  verifyForgotPasswordTokenValidator
} from '~/middlewares/users.midderwares'
import { UpdateMeReqBody } from '~/models/requests/User.requests'
import { wrapRequestHandler } from '~/utils/handlers'
const usersRouter = Router()

usersRouter.use((req, res, next) => {
  console.log('Time: ', Date.now())
  next()
})

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
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @openapi
 * /users/login:
 *   post:
 *     tags: [Users]
 *     summary: Login
 *     description: Login to system
 *     operationId: login
 *     requestBody:
 *       description: Login information
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginBody'
 *     responses:
 *       '200':
 *         description: Login Successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Login successful
 *                 result:
 *                   $ref: '#/components/schemas/SuccessAuthentication'
 *       '422':
 *         description: Invalid input
 */
usersRouter.post('/login', loginValidator, wrapRequestHandler(loginController))

/**
 * Description: Register a new user
 * Path: /oauth/google
 * Method: GET
 * Body: { email: string, password: string}
 */
usersRouter.get('/oauth/google', wrapRequestHandler(oauthController))

/**
 * Description: Register a new user
 * Path: /register
 * Method: POST
 * Body: { name:string, email: string, password: string,
 * confirm_password: string, date_of_birth: ISO String }
 */
usersRouter.post('/register', registerValidator, wrapRequestHandler(registerController))

/**
 * Description: Logout a user
 * Path: /Logout
 * Method: POST
 * Header: { Authorization: Bearer <access_token> }
 * Body: { refresh_token: string}
 */
usersRouter.post('/logout', accessTokenValidator, refreshTokenValidator, wrapRequestHandler(logoutController))

/**
 * Description: Refresh token
 * Path: /refresh-token
 * Method: POST
 * Body: { refresh_token: string}
 */
usersRouter.post('/refresh-token', refreshTokenValidator, wrapRequestHandler(refreshTokenController))

/**
 * Description: Verify email when user click on the link email
 * Path: /verify-email
 * Method: POST
 * Header: { Authorization: Bearer <access_token> }
 * Body: { email_verify_token: string}
 */
usersRouter.post('/verify-email', emailVerifyTokenValidator, wrapRequestHandler(verifyEmailController))

/**
 * Description: Resend verify email when user click on the link email
 * Path: /resend-verify-email
 * Method: POST
 * Header: { Authorization: Bearer <access_token> }
 * Body: {}
 */
usersRouter.post('/resend-verify-email', accessTokenValidator, wrapRequestHandler(resendverifyEmailController))

/**
 * Description: submit email to reset password, send email to user
 * Path: /forgot-password
 * Method: POST
 * Body: {email: string}
 */
usersRouter.post('/forgot-password', forgotPasswordValidator, wrapRequestHandler(forgotPasswordController))

/**
 * Description: Verify link in email to reset password
 * Path: /verify-forgot-password
 * Method: POST
 * Body: {forgot_password_token: string}
 */
usersRouter.post(
  '/verify-forgot-password',
  verifyForgotPasswordTokenValidator,
  wrapRequestHandler(verifyForgotPasswordController)
)

/**
 * Description: Verify link in email to reset password
 * Path: /reset-password
 * Method: POST
 * Body: {
 *  forgot_password_token: string,
 *  password: string,
 *  confirm_password: string,
 * }
 */
usersRouter.post('/reset-password', resetPasswordValidator, wrapRequestHandler(resetPasswordController))

/**
 * Description: Get my profile
 * Path: /me
 * Method: POST
 * Header: { Authorization: Bearer <access_token> }
 */
usersRouter.get('/me', accessTokenValidator, wrapRequestHandler(getMeController))

/**
 * Description: Get my profile
 * Path: /me
 * Method: POST
 * Header: { Authorization: Bearer <access_token> },
 * Body: UserSchema
 */
usersRouter.patch(
  '/me',
  accessTokenValidator,
  verifiedUserValidator as any,
  updateMeValidator,
  filterMiddleware<UpdateMeReqBody>([
    'avatar',
    'bio',
    'cover_photo',
    'date_of_birth',
    'location',
    'name',
    'username',
    'website'
  ]),
  wrapRequestHandler(updateMeController)
)

/**
 * Description: Get user profile
 * Path: /:username
 * Method: POST
 * Header: { Authorization: Bearer <access_token> },
 * Body: UserSchema
 */
usersRouter.get('/:username', wrapRequestHandler(getProfleController))

/**
 * Description: Follow user
 * Path: /follow
 * Method: POST
 * Header: { Authorization: Bearer <access_token> },
 * Body: {user_id: string}
 */
usersRouter.post(
  '/follow',
  accessTokenValidator,
  verifiedUserValidator as any,
  followValidator,
  wrapRequestHandler(followController)
)

/**
 * Description: Follow user
 * Path: /follow/user_id
 * Method: POST
 * Header: { Authorization: Bearer <access_token> },
 * Body: {user_id: string}
 */
usersRouter.delete(
  '/follow/:user_id',
  accessTokenValidator,
  verifiedUserValidator as any,
  unFollowValidator,
  wrapRequestHandler(unFollowController)
)

/**
 * Description: Follow user
 * Path: /change-password
 * Method: POST
 * Header: { Authorization: Bearer <access_token> },
 * Body: {old_password: string, password: string, confirm_new_password: string}
 */
usersRouter.put(
  '/change-password',
  accessTokenValidator,
  verifiedUserValidator as any,
  changePasswordValidator,
  wrapRequestHandler(changePasswordController)
)

export default usersRouter
