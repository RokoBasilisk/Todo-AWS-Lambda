import middy from '@middy/core'
import cors from '@middy/http-cors'
import httpErrorHandler from '@middy/http-error-handler'

import { getUserId } from '../utils.mjs'
import { updateTodoLogic } from '../../businessLogic/todos.mjs'
import { statusCodeEnum } from '../../utils/resultStatus'

export const handler = middy()
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
  .handler(async (event) => {
    // todo Primary Key
    const todoId = event.pathParameters.todoId
    // todo update object mapping
    const updatedTodo = JSON.parse(event.body)

    // TODO: Update a TODO item with the provided id using values in the "updatedTodo" object
    // get userId from jwtoken for update todo
    const userId = getUserId(event)

    // update todo entity
    const todo = await updateTodoLogic(userId, todoId, updatedTodo)

    return {
      statusCode: statusCodeEnum.OK,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(todo)
    }
  })
