import { Router } from 'express'
import { getConversationsController } from '~/controllers/conversations.controller'
import { accessTokenValidator, verifiedUserValidator } from '~/middlewares/users.midderwares'
import { wrapRequestHandler } from '~/utils/handlers'

const conversationRouter = Router()
/**
 * Description: get Conversations By ReceiverId
 * Path: /:receiver_id
 * Method: GET
 */
conversationRouter.get(
  '/receivers/:receiver_id',
  accessTokenValidator,
  verifiedUserValidator as any,
  getConversationsController
)

export default conversationRouter
