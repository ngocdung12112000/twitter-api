import { Request } from 'express'
import { getNameFromFullName, handleUploadImages, handleUploadVideos } from '~/utils/file'
import sharp from 'sharp'
import { UPLOAD_IMAGE_DIR, UPLOAD_VIDEO_DIR } from '~/constants/dir'
import path from 'path'
import fs from 'fs'
import { isProduction } from '~/constants/config'
import { config } from 'dotenv'
import { MediaType } from '~/constants/enums'
import { Media } from '~/models/Others'
config()

class MediaService {
  async uploadImages(req: Request) {
    const files = await handleUploadImages(req)

    const result: Media[] = await Promise.all(
      files.map(async (file) => {
        const newName = getNameFromFullName(file.newFilename)
        const newPath = path.resolve(UPLOAD_IMAGE_DIR, `${newName}.jpg`)
        await sharp(file.filepath).jpeg().toFile(newPath)
        fs.unlinkSync(file.filepath)

        return {
          type: MediaType.Image,
          url: isProduction
            ? `${process.env.HOST}/static/${newName}.jpg`
            : `http://localhost:${process.env.PORT}/static/images/${newName}.jpg`
        }
      })
    )

    return result
  }

  async uploadVideos(req: Request) {
    const files = await handleUploadVideos(req)
    const result: Media[] = files.map((file) => {
      return {
        type: MediaType.Video,
        url: isProduction
          ? `${process.env.HOST}/static/${file.newFilename}`
          : `http://localhost:${process.env.PORT}/static/videos/${file.newFilename}`
      }
    })
    return result
  }
}

const mediaService = new MediaService()

export default mediaService
