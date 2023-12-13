import middy from '@middy/core'
import cors from '@middy/http-cors'
import httpErrorHandler from '@middy/http-error-handler'
import { getUserId } from '../utils.mjs'
import { deleteTodoLogic } from '../../businessLogic/todos.mjs'
import { createLogger } from '../../utils/logger.mjs'

const logger = createLogger('todos deleteTodo')

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
    // todo Primary Key
    const todoId = event.pathParameters.todoId

    // TODO: Remove a TODO item by id
    // get userId from jwtoken for update todo
    const userId = getUserId(event)

    logger.info(`delete todo ${todoId} by ${userId} at lambda deleteTodo...`)
    // update todo entity by userId, todoId
    await deleteTodoLogic(userId, todoId)
    logger.info(
      `delete todo ${todoId} by ${userId} at lambda deleteTodo successfully`
    )
    return {
      statusCode: statusCodeEnum.OK,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({})
    }
  })
