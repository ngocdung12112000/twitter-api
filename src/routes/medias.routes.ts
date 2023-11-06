import { Router } from 'express'
import {
  uploadImagesController,
  uploadVideosController,
  uploadVideosHLSController,
  videoStatusController
} from '~/controllers/medias.controller'
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

mediasRouter.post(
  '/upload-video-hls',
  accessTokenValidator,
  verifiedUserValidator as any,
  wrapRequestHandler(uploadVideosHLSController)
)

mediasRouter.get(
  '/video-status/:id',
  accessTokenValidator,
  verifiedUserValidator as any,
  wrapRequestHandler(videoStatusController)
)
export default mediasRouter
