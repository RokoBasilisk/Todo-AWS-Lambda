import middy from '@middy/core'
import cors from '@middy/http-cors'
import httpErrorHandler from '@middy/http-error-handler'

import { getUserId } from '../utils.mjs'
import { getTodoListLogic } from '../../businessLogic/todos.mjs'

const statusCodeEnum = {
  OK: 200,
  CREATED_SUCCESS: 201
}

export const handler = middy()
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
  .handler(async (event) => {
    // TODO: Get all TODO items for a current user
    // get userId from jwtoken for update todo
    const userId = getUserId(event)

    // get all todo entity from user with userId
    const todos = await getTodoListLogic(userId)
    return {
      statusCode: statusCodeEnum.OK,
      body: JSON.stringify({ items: todos })
    }
  })
