import { config } from 'dotenv'
import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { SearchQuery } from '~/models/requests/Search.requests'
import searchService from '~/services/search.services'
config()

export const searchController = async (req: Request<ParamsDictionary, any, any, SearchQuery>, res: Response) => {
  const limit = Number(req.query.limit)
  const page = Number(req.query.page)

  const result = await searchService.search({
    limit,
    page,
    content: req.query.content,
    user_id: req.decoded_authorization?.user_id as string,
    media_type: req.query.media_type
  })

  return res.json({
    message: 'Search success',
    result: { tweets: result.tweets, page, limit, total: result.total, total_page: Math.ceil(result.total / limit) }
  })
}
