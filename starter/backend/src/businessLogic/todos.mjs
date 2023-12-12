import * as uuid from 'uuid'
import {
  getTodoList,
  createTodo,
  updateTodo,
  deleteTodo
} from '../dataLayer/todosAccess.mjs'
import { createLogger } from '../utils/logger.mjs'
const logger = createLogger('todos')

export const getTodoListLogic = async (userId) => {
  logger.info(`Get Todo List from ${userId} at ${getTodoListLogic.name}`)
  return getTodoList(userId)
}

export const createTodoLogic = async (userId, todo) => {
  // generate uuid
  const todoId = uuid.v4()
  logger.info(`Todo entity ${todoId} created at ${createTodoLogic.name}`)

  return createTodo({
    userId,
    todoId,
    createdAt: new Date().toISOString(),
    done: false,
    ...todo
  })
}

export const updateTodoLogic = async (userId, todoId, todo) => {
  logger.info(`Todo entity ${todoId} updated at ${updateTodoLogic.name}`)
  return updateTodo(userId, todoId, todo)
}

export const deleteTodoLogic = async (userId, todoId) => {
  logger.info(`Todo entity ${todoId} deleted at ${deleteTodoLogic.name}`)
  return deleteTodo(userId, todoId)
}
