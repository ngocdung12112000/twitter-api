import { Request, Response } from 'express'
import path from 'path'
import { UPLOAD_IMAGE_DIR, UPLOAD_VIDEO_DIR, UPLOAD_VIDEO_TEMP_DIR } from '~/constants/dir'
import HTTP_STATUS from '~/constants/httpStatus'
import { USER_MESSAGES } from '~/constants/messages'
import mediaService from '~/services/medias.services'
import fs from 'fs'
import mime from 'mime'

export const uploadImagesController = async (req: Request, res: Response) => {
  const url = await mediaService.uploadImages(req)
  return res.json({
    message: USER_MESSAGES.UPLOAD_SUCCESS,
    result: url
  })
}

export const uploadVideosController = async (req: Request, res: Response) => {
  const url = await mediaService.uploadVideos(req)
  return res.json({
    message: USER_MESSAGES.UPLOAD_SUCCESS,
    result: url
  })
}

export const serveImageController = (req: Request, res: Response) => {
  const { name } = req.params
  return res.sendFile(path.resolve(UPLOAD_IMAGE_DIR, name), (err) => {
    if (err) {
      res.status((err as any).status).send('Not found')
    }
  })
}

export const serveVideoStreamController = (req: Request, res: Response) => {
  const range = req.headers.range
  if (!range) {
    return res.status(HTTP_STATUS.BAD_REQUEST).send('Requires Range header')
  }

  const { name } = req.params
  // Đường dẫn video
  const videoPath = path.resolve(UPLOAD_VIDEO_DIR, name)
  // Dung lượng video (bytes)
  const videoSize = fs.statSync(videoPath).size
  // Dung lượng video cho mỗi phân đoạn stream
  const chunkSize = 10000 // 1MB
  // Lấy giá trị byte bắt đầu từ header Range
  const start = Number(range.replace(/\D/g, ''))
  // Lấy giá trị byte kết thúc
  const end = Math.min(start + chunkSize, videoSize - 1)

  // Dung lượng thực tế cho mỗi đoạn video stream
  const contentLength = end - start + 1
  const contentType = mime.getType(videoPath) || 'video/*'
  const headers = {
    'Content-Range': `bytes ${start}-${end}/${videoSize}`,
    'Accept-Ranges': 'bytes',
    'Content-Length': contentLength,
    'Content-Type': contentType
  }
  res.writeHead(HTTP_STATUS.PARTIAL_CONTENT, headers)
  const videoStream = fs.createReadStream(videoPath, { start, end })
  videoStream.pipe(res)
}
