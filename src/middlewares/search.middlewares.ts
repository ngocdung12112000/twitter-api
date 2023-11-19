import { checkSchema } from 'express-validator'
import { MediaTypeQuery, PeopleFollow } from '~/constants/enums'
import { validate } from '~/utils/validations'

export const searchValidator = validate(
  checkSchema(
    {
      content: {
        isString: true
      },
      media_type: {
        optional: true,
        isIn: {
          options: [Object.values(MediaTypeQuery)]
        }
      },
      people_follow: {
        optional: true,
        isIn: {
          options: [Object.values(PeopleFollow)]
        }
      }
    },
    ['query']
  )
)
