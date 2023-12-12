import middy from '@middy/core'
import cors from '@middy/http-cors'
import httpErrorHandler from '@middy/http-error-handler'

import { getUserId } from '../utils.mjs'
import { updateTodoLogic } from '../../businessLogic/todos.mjs'
import { createLogger } from '../../utils/logger.mjs'

const logger = createLogger('Todos lambda updateTodo')

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
    logger.info(`Todo lambda ${todoId} going to updated at updateTodo`)
    // todo update object mapping
    const updatedTodo = JSON.parse(event.body)

    // TODO: Update a TODO item with the provided id using values in the "updatedTodo" object
    // get userId from jwtoken for update todo
    const userId = getUserId(event)
    logger.info(
      `Todo lambda ${todoId} going to updated at updateTodo after get token`
    )

    // update todo entity
    const todo = await updateTodoLogic(userId, todoId, updatedTodo)
    logger.info(`Todo lambda ${todoId} updated at updateTodo`)
    return {
      statusCode: statusCodeEnum.OK,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(todo)
    }
  })
