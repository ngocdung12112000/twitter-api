import { Router } from 'express'
import { serveImageController } from '~/controllers/medias.controller'

const staticRouter = Router()

staticRouter.get('/images/:name', serveImageController)

export default staticRouter
