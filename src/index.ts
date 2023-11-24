import express from 'express'
import usersRouter from './routes/users.routes'
import databaseService from './services/database.services'
import { defaultErrorHandler } from './middlewares/errors.middlewares'
import mediasRouter from './routes/medias.routes'
import { initFolder } from './utils/file'
import { config } from 'dotenv'
import staticRouter from './routes/static.routes'
import { UPLOAD_VIDEO_DIR } from './constants/dir'
import cors from 'cors'
import tweetRouter from './routes/tweet.routes'
import bookmarkRouter from './routes/bookmarks.routes'
import { createDataFake } from './utils/common'
import searchRouter from './routes/search.routes'
import './utils/s3'
import { createServer } from 'http'
import { Server, Socket } from 'socket.io'
import Conversation from './models/schemas/Conversations.schema'
import conversationRouter from './routes/conversations.routes'
import { ObjectId } from 'mongodb'

const app = express()
const httpServer = createServer(app)
const port = process.env.PORT || 4000
config()
//createDataFake()

initFolder()
app.use(cors())
app.use(express.json())
app.use('/users', usersRouter)
app.use('/medias', mediasRouter)
app.use('/static', staticRouter)
app.use('/search', searchRouter)
app.use('/static/videos', express.static(UPLOAD_VIDEO_DIR))
app.use('/tweet', tweetRouter)
app.use('/bookmarks', bookmarkRouter)
app.use('/conversations', conversationRouter)
app.use(defaultErrorHandler)
databaseService.connect().then(() => {
  databaseService.indexUsers()
  databaseService.indexRefreshTokens()
  databaseService.indexVideoStatus()
  databaseService.indexFollowers()
  databaseService.indexTweets()
})
// app.listen(port, () => {
//   console.log(`App listening on port ${port}`)
// })
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL
  }
})
const users: {
  [key: string]: {
    socket_id: string
  }
} = {}
io.on('connection', (socket: Socket) => {
  console.log(`user ${socket.id} connected`)
  const user_id = socket.handshake.auth._id
  users[user_id] = {
    socket_id: socket.id
  }

  socket.on('message', async (data) => {
    const receiver_socket_id = users[data.to]?.socket_id
    if (!receiver_socket_id) return
    await databaseService.conversations.insertOne(
      new Conversation({
        sender_id: new ObjectId(data.from),
        receiver_id: new ObjectId(data.to),
        content: data.content
      })
    )
    socket.to(receiver_socket_id).emit('responseMessage', {
      content: data.content,
      from: user_id
    })
  })

  socket.on('disconnect', () => {
    delete users[user_id]
    console.log(`user ${socket.id} disconnected`)
  })
})
httpServer.listen(port, () => {
  console.log(`Socket listening on port ${port}`)
})
