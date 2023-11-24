import { ObjectId } from 'mongodb'

interface ConversationType {
  _id?: ObjectId
  sender_id: ObjectId
  receiver_id: ObjectId
  content: string
  create_at?: Date
}

export default class Conversation {
  _id?: ObjectId
  sender_id: ObjectId
  receiver_id: ObjectId
  content: string
  create_at?: Date

  constructor({ _id, sender_id, receiver_id, content, create_at }: ConversationType) {
    this._id = _id || new ObjectId()
    this.sender_id = sender_id
    this.receiver_id = receiver_id
    this.content = content
    this.create_at = create_at || new Date()
  }
}
