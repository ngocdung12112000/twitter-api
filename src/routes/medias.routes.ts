import { Router } from 'express'
import { uploadSingleImage } from '~/controllers/medias.controller'
const mediasRouter = Router()

mediasRouter.post('/upload-image', uploadSingleImage)

export default mediasRouter
