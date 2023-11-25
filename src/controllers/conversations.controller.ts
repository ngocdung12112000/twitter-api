import { config } from 'dotenv'
import { Request, Response } from 'express'
import { GetConversationParam } from '~/models/requests/Conversation.requests'
import conversationService from '~/services/conversations.services'

config()

export const getConversationsController = async (req: Request<GetConversationParam>, res: Response) => {
  const { receiver_id } = req.params
  const page = Number(req.query.page)
  const limit = Number(req.query.limit)
  const sender_id = req.decoded_authorization?.user_id as string
  const result = await conversationService.getConversations({
    sender_id,
    receiver_id,
    limit,
    page
  })
  return res.json({
    message: 'get Conversations success',
    result: {
      limit,
      page,
      total_page: Math.ceil(result.total / limit),
      conversations: result.conversations
    }
  })
}
