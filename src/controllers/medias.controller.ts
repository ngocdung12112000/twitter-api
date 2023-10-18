import { Request, Response } from 'express'
import path from 'path'

export const uploadSingleImage = async (req: Request, res: Response) => {
  const formidable = (await import('formidable')).default

  const form = formidable({
    uploadDir: path.resolve('uploads'),
    maxFiles: 1,
    keepExtensions: true,
    maxFieldsSize: 300 * 1024 // 300 KB
  })

  form.parse(req, (err, fields, files) => {
    if (err) {
      throw err
    }

    res.json({
      message: 'upload successfully'
    })
  })
}
