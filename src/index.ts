import express from 'express'
import usersRouter from './routes/users.routes'
import databaseService from './services/database.services'
import { defaultErrorHandler } from './middlewares/errors.middlewares'
import mediasRouter from './routes/medias.routes'
import { initFolder } from './utils/file'
import { config } from 'dotenv'
import staticRouter from './routes/static.routes'

const app = express()
const port = process.env.PORT || 4000
config()

initFolder()

app.use(express.json())
app.use('/users', usersRouter)
app.use('/medias', mediasRouter)
app.use('/static', staticRouter)
app.use(defaultErrorHandler)
databaseService.connect()
app.listen(port, () => {
  console.log(`App listening on port ${port}`)
})
