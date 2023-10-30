import { Request } from 'express'
import { getNameFromFullName, handleUploadImages, handleUploadVideos } from '~/utils/file'
import sharp from 'sharp'
import { UPLOAD_IMAGE_DIR, UPLOAD_VIDEO_DIR } from '~/constants/dir'
import path from 'path'
import fs from 'fs'
import fsPromise from 'fs/promises'
import { isProduction } from '~/constants/config'
import { config } from 'dotenv'
import { MediaType } from '~/constants/enums'
import { Media } from '~/models/Others'
import { encodeHLSWithMultipleVideoStreams } from '~/utils/video'
config()

class Queue {
  items: string[]
  encoding: boolean

  constructor() {
    this.items = []
    this.encoding = false
  }

  enqueue(item: string) {
    this.items.push(item)
    this.processEncode()
  }

  async processEncode() {
    if (this.encoding) return
    if (this.items.length > 0) {
      this.encoding = true
      const videoPath = this.items[0]

      try {
        await encodeHLSWithMultipleVideoStreams(videoPath)
        this.items.shift()
        await fsPromise.unlink(videoPath)
        console.log(`Encode video ${videoPath} success`)
      } catch (error) {
        console.error(`Encode video ${videoPath} fail`)
        console.error(error)
      }
      this.encoding = false
      this.processEncode()
    } else {
      console.log('Encode video queue is empty')
    }
  }
}

const queue = new Queue()

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

  async uploadVideosHLS(req: Request) {
    const files = await handleUploadVideos(req)
    const result: Media[] = await Promise.all(
      files.map(async (file) => {
        // await encodeHLSWithMultipleVideoStreams(file.filepath)
        const newName = getNameFromFullName(file.newFilename)
        queue.enqueue(file.filepath)
        // await fsPromise.unlink(file.filepath)
        return {
          type: MediaType.HLS,
          url: isProduction
            ? `${process.env.HOST}/static/video-hls/${newName}.m3u8`
            : `http://localhost:${process.env.PORT}/static/video-hls/${newName}.m3u8`
        }
      })
    )
    return result
  }
}

const mediaService = new MediaService()

export default mediaService
