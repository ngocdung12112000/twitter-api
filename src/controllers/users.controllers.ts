import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { RegisterReqBody } from '~/models/requests/User.requests'
import User from '~/models/schemas/User.schema'
import databaseService from '~/services/database.services'
import userServices from '~/services/users.services'

export const loginController = (req: Request, res: Response) => {
  const { email, password } = req.body
  if (email === 'dung@gmail.com' && password === '123') {
    return res.json({
      message: 'Success'
    })
  }

  return res.status(400).json({
    message: 'Failed'
  })
}

export const registerController = (
  req: Request<ParamsDictionary, any, RegisterReqBody>,
  res: Response,
  next: NextFunction
) => {
  throw new Error(`Hey it's error`)
  // const result = await userServices.register(req.body)

  // return res.json({
  //   message: 'Register Success',
  //   result
  // })
}
