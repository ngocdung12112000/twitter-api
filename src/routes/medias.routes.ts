import { Router } from 'express'
import { uploadImagesController, uploadVideosController } from '~/controllers/medias.controller'
import { accessTokenValidator, verifiedUserValidator } from '~/middlewares/users.midderwares'
import { wrapRequestHandler } from '~/utils/handlers'
const mediasRouter = Router()

mediasRouter.post(
  '/upload-image',
  accessTokenValidator,
  verifiedUserValidator as any,
  wrapRequestHandler(uploadImagesController)
)

mediasRouter.post(
  '/upload-video',
  accessTokenValidator,
  verifiedUserValidator as any,
  wrapRequestHandler(uploadVideosController)
)

export default mediasRouter
