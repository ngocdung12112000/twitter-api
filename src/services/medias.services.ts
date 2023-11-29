import { Request } from 'express'
import { getFiles, getNameFromFullName, handleUploadImages, handleUploadVideos } from '~/utils/file'
import sharp from 'sharp'
import { UPLOAD_IMAGE_DIR, UPLOAD_VIDEO_DIR } from '~/constants/dir'
import path from 'path'
import fs from 'fs'
import fsPromise from 'fs/promises'
import { envConfig, isProduction } from '~/constants/config'
import { config } from 'dotenv'
import { EncodingStatus, MediaType } from '~/constants/enums'
import { Media } from '~/models/Others'
import { encodeHLSWithMultipleVideoStreams } from '~/utils/video'
import databaseService from './database.services'
import VideoStatus from '~/models/schemas/VideoStatus.schema'
import { uploadFleToS3 } from '~/utils/s3'
import mime from 'mime'
import { CompleteMultipartUploadCommandOutput } from '@aws-sdk/client-s3'
import { rimrafSync } from 'rimraf'
config()

class Queue {
  items: string[]
  encoding: boolean

  constructor() {
    this.items = []
    this.encoding = false
  }

  async enqueue(item: string) {
    this.items.push(item)
    const idName = getNameFromFullName(item.split('\\').pop() as string)
    await databaseService.videoStatus.insertOne(
      new VideoStatus({
        name: idName,
        status: EncodingStatus.Pending
      })
    )
    this.processEncode()
  }

  async processEncode() {
    if (this.encoding) return
    if (this.items.length > 0) {
      this.encoding = true
      const videoPath = this.items[0]
      const idName = getNameFromFullName(videoPath.split('\\').pop() as string)
      await databaseService.videoStatus.updateOne(
        { name: idName },
        {
          $set: {
            status: EncodingStatus.Processing
          },
          $currentDate: {
            updated_at: true
          }
        }
      )
      try {
        await encodeHLSWithMultipleVideoStreams(videoPath)
        this.items.shift()
        //await fsPromise.unlink(videoPath)
        const files = getFiles(path.resolve(UPLOAD_VIDEO_DIR, idName))
        await Promise.all(
          files.map((filepath) => {
            const filename = 'videos-hls/' + filepath.replace(path.resolve(UPLOAD_VIDEO_DIR), '').slice(1)
            return uploadFleToS3({
              fileName: filename,
              filePath: filepath,
              contentType: mime.getType(filepath) as string
            })
          })
        )
        rimrafSync(path.resolve(UPLOAD_VIDEO_DIR, idName))
        //await Promise.all([fsPromise.unlink(videoPath), fsPromise.unlink(path.resolve(UPLOAD_VIDEO_DIR, idName))])
        await databaseService.videoStatus
          .updateOne(
            { name: idName },
            {
              $set: {
                status: EncodingStatus.Success
              },
              $currentDate: {
                updated_at: true
              }
            }
          )
          .catch((err) => {
            console.error(err)
          })
        console.log(`Encode video ${videoPath} success`)
      } catch (error) {
        await databaseService.videoStatus
          .updateOne(
            { name: idName },
            {
              $set: {
                status: EncodingStatus.Fail
              },
              $currentDate: {
                updated_at: true
              }
            }
          )
          .catch((err) => {
            console.error(err)
          })
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
        const newFileName = `${newName}.jpg`
        const newPath = path.resolve(UPLOAD_IMAGE_DIR, newFileName)
        await sharp(file.filepath).jpeg().toFile(newPath)
        const s3result = await uploadFleToS3({
          fileName: 'images/' + newFileName,
          filePath: newPath,
          contentType: mime.getType(newPath) as string
        })
        await Promise.all([fsPromise.unlink(file.filepath), fsPromise.unlink(newPath)])
        return {
          url: (s3result as CompleteMultipartUploadCommandOutput).Location as string,
          type: MediaType.Image
        }
      })
    )

    return result
  }

  async uploadVideos(req: Request) {
    const files = await handleUploadVideos(req)

    const result: Media[] = await Promise.all(
      files.map(async (file) => {
        const s3Result = await uploadFleToS3({
          fileName: 'videos/' + file.newFilename,
          filePath: file.filepath,
          contentType: mime.getType(file.filepath) as string
        })
        fsPromise.unlink(file.filepath)
        return {
          url: (s3Result as CompleteMultipartUploadCommandOutput).Location as string,
          type: MediaType.Video
        }
      })
    )
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
            ? `${envConfig.host}/static/video-hls/${newName}/master.m3u8`
            : `http://localhost:${envConfig.port}/static/video-hls/${newName}/master.m3u8`
        }
      })
    )
    return result
  }

  async getVideoStatus(id: string) {
    const data = await databaseService.videoStatus.findOne({
      name: id
    })

    return data
  }
}

const mediaService = new MediaService()

export default mediaService
