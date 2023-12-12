import middy from '@middy/core'
import cors from '@middy/http-cors'
import httpErrorHandler from '@middy/http-error-handler'

import { getUserId } from '../utils.mjs'
import { createTodoLogic } from '../../businessLogic/todos.mjs'

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
    // mapping form-data to newTodo
    const newTodo = JSON.parse(event.body)

    // TODO: Implement creating a new TODO item
    // get UserId from jwtoken
    const userId = getUserId(event)
    // create Todo Entity
    const todo = await createTodoLogic(userId, newTodo)

    return {
      statusCode: statusCodeEnum.CREATED_SUCCESS,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ item: todo })
    }
  })
