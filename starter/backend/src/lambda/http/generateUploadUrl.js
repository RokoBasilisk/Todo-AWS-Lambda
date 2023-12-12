import middy from '@middy/core'
import cors from '@middy/http-cors'
import httpErrorHandler from '@middy/http-error-handler'

import { createLogger } from '../../utils/logger.mjs'
import { getUserId } from '../utils.mjs'
import { saveImgUrl } from '../../dataLayer/todosAccess.mjs'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { statusCodeEnum } from '../../utils/resultStatus'
import { AWS_CONFIG } from '../../utils/constanst'

const bucketName = process.env.S3_BUCKET
const urlExpiration = Number(process.env.SIGNED_URL_EXPIRATION)
const logger = createLogger('generateUploadUrl')
const client = new S3Client({ region: AWS_CONFIG.REGION })

export const handler = middy()
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
  .handler(async (event) => {
    const todoId = event.pathParameters.todoId

    // TODO: Return a presigned URL to upload a file for a TODO item with the provided id
    logger.info('upload File url render... :', {
      todoId,
      bucketName
    })
    // get userId from jwtoken for update todo
    const userId = getUserId(event)

    // generate put object command to S3, get assign url
    const command = new PutObjectCommand({ Bucket: bucketName, Key: todoId })
    // get Assign url
    const uploadUrl = await getSignedUrl(client, command, {
      expiresIn: urlExpiration
    })

    logger.info('upload File url render finish:', {
      todoId,
      uploadUrl
    })

    await saveImgUrl(userId, todoId, bucketName)

    return {
      statusCode: statusCodeEnum.OK,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        uploadUrl: uploadUrl
      })
    }
  })
