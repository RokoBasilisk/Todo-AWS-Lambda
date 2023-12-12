import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import {
  DynamoDBDocumentClient,
  QueryCommand,
  PutCommand,
  DeleteCommand,
  UpdateCommand
} from '@aws-sdk/lib-dynamodb'
import { createLogger } from '../utils/logger.mjs'
import { AWS_CONFIG } from '../utils/constanst'

const logger = createLogger('todoAccess')
const docClient = DynamoDBDocumentClient.from(
  new DynamoDBClient({ region: AWS_CONFIG.REGION })
)
const todosTable = process.env.TODOS_TABLE

export const getTodoList = async (userId) => {
  // get all todo that was create by userId
  const command = new QueryCommand({
    TableName: todosTable,
    KeyConditionExpression: 'userId = :userId',
    ExpressionAttributeValues: {
      ':userId': userId
    }
  })
  const result = await docClient.send(command)
  return result.Items
}

export const createTodo = async (newTodo) => {
  // create a todo
  const command = new PutCommand({
    TableName: todosTable,
    Item: newTodo
  })
  // execute command to create todo
  await docClient.send(command)
  return newTodo
}

export const updateTodo = async (userId, todoId, updateData) => {
  // generate todo command to update todo from todosTable
  // update name, dueDate, done
  const command = new UpdateCommand({
    TableName: todosTable,
    Key: { userId, todoId },
    ConditionExpression: 'attribute_exists(todoId)',
    UpdateExpression: 'set name = :n, dueDate = :due, done = :dn',
    ExpressionAttributeValues: {
      ':n': updateData.name,
      ':due': updateData.dueDate,
      ':dn': updateData.done
    }
  })
  // execute command to update todo
  await docClient.send(command)
}

export const deleteTodo = async (userId, todoId) => {
  // generate todo command to delete todo from todosTable
  const command = new DeleteCommand({
    TableName: todosTable,
    Key: { userId, todoId }
  })
  // execute command to delete todo
  await docClient.send(command)
}

export const saveImgUrl = async (userId, todoId, bucketName) => {
  try {
    // generate todo command to update todo from todosTable
    // update attachmentUrl
    const command = new UpdateCommand({
      TableName: todosTable,
      Key: { userId, todoId },
      ConditionExpression: 'attribute_exists(todoId)',
      UpdateExpression: 'set attachmentUrl = :attachmentUrl',
      ExpressionAttributeValues: {
        ':attachmentUrl': `https://${bucketName}.s3.amazonaws.com/${todoId}`
      }
    })
    logger.info(`Update attachmentUrl for todo ${todoId}: `, {
      attachmentUrl: 'https://${bucketName}.s3.amazonaws.com/${todoId}'
    })
    // execute command to update todo attachmentUrl
    await docClient.send(command)
  } catch (error) {
    logger.error(error)
  }
}
