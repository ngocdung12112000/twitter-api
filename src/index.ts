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
import { createDataFake, verifyAccessToken } from './utils/common'
import searchRouter from './routes/search.routes'
import './utils/s3'
import { createServer } from 'http'
import conversationRouter from './routes/conversations.routes'
import initSocket from './utils/socket'

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

initSocket(httpServer)

httpServer.listen(port, () => {
  console.log(`Socket listening on port ${port}`)
})
