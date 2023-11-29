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
// import YAML from 'yaml'
// import fs from 'fs'
// import path from 'path'
import swaggerUi from 'swagger-ui-express'
import swaggerJsdoc from 'swagger-jsdoc'
import { envConfig } from './constants/config'

// const file = fs.readFileSync(path.resolve('twitter-swagger.yaml'), 'utf8')
// const swaggerDocument = YAML.parse(file)

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'X clone (Twitter API)',
      version: '1.0.0'
    }
  },
  apis: ['./swagger/*.yaml'] // files containing annotations as above
}

const openapiSpecification = swaggerJsdoc(options)

const app = express()
const httpServer = createServer(app)
const port = envConfig.port
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
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapiSpecification))
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
