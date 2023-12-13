import AWS from 'aws-sdk'
import AWSXRay from 'aws-xray-sdk'

AWS.config.update({ region: 'us-east-1' })

import { QueryCommand } from '@aws-sdk/lib-dynamodb'
import { createLogger } from '../utils/logger.mjs'

const logger = createLogger('todo Access')

const awsService = new AWSXRay.captureAWS(AWS)
const docClient = new awsService.DynamoDB.DocumentClient()
const todosTable = process.env.TODOS_TABLE

export const getTodoList = async (userId) => {
  // get all todo that was create by userId
  logger.info(`get todo List by ${userId} at data Layer getTodoList...`)
  const responseData = await docClient
    .query({
      TableName: todosTable,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      }
    })
    .promise()
  logger.info(`get dotoList executed`, responseData.Items)
  return responseData.Items
}

export const createTodo = async (newTodo) => {
  // create a todo
  logger.info(`create todo at data Layer createTodo...`)
  const responseData = await docClient
    .put({
      TableName: todosTable,
      Item: newTodo
    })
    .promise()
  // execute command to create todo
  logger.info(`create todo executed`, responseData)
  return newTodo
}

export const updateTodo = async (userId, todoId, updateData) => {
  // generate todo command to update todo from todosTable
  logger.info(`update todo ${todoId} at data Layer updateTodo...`)

  // update name, dueDate, done
  await docClient
    .update({
      TableName: todosTable,
      Key: {
        todoId,
        userId
      },
      ConditionExpression: 'attribute_exists(todoId)',
      UpdateExpression: 'set #name = :n, dueDate = :due, done = :dn',
      ExpressionAttributeValues: {
        ':n': updateData.name,
        ':due': updateData.dueDate,
        ':dn': updateData.done
      },
      ExpressionAttributeNames: {
        '#name': 'name'
      }
    })
    .promise()
  // execute command to update todo
  logger.info(`update todo executed`, updateData)
}

export const deleteTodo = async (userId, todoId) => {
  // generate todo command to delete todo from todosTable
  logger.info(`delete todo ${todoId} at data Layer deleteTodo...`)
  // execute command to delete todo
  const responseData = await docClient
    .delete({
      TableName: todosTable,
      Key: {
        todoId,
        userId
      }
    })
    .promise()
  logger.info(`delete todo executed`, {
    responseData
  })
}

export const saveImgUrl = async (userId, todoId, bucketName) => {
  try {
    // generate todo command to update todo from todosTable
    // update attachmentUrl
    logger.info(`Update attachmentUrl for todo ${todoId}: `, {
      attachmentUrl: `https://${bucketName}.s3.amazonaws.com/${todoId}`
    })
    await docClient
      .update({
        TableName: todosTable,
        Key: {
          todoId,
          userId
        },
        ConditionExpression: 'attribute_exists(todoId)',
        UpdateExpression: 'set attachmentUrl = :attachmentUrl',
        ExpressionAttributeValues: {
          ':attachmentUrl': `https://${bucketName}.s3.amazonaws.com/${todoId}`
        }
      })
      .promise()
    // execute command to update todo attachmentUrl
    logger.info(`update todo attachmentUrl executed`, {
      attachmentUrl: `https://${bucketName}.s3.amazonaws.com/${todoId}`
    })
  } catch (error) {
    logger.error(error)
  }
}
