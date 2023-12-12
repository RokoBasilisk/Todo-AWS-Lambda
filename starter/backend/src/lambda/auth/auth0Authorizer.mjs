import Axios from 'axios'
import jsonwebtoken from 'jsonwebtoken'
import { createLogger } from '../../utils/logger.mjs'
import axios from 'axios'

const logger = createLogger('auth')

const jwksUrl =
  'https://dev-itzxxlosh4orcepb.us.auth0.com/.well-known/jwks.json'

export const handler = async (event) => {
  try {
    const jwtToken = await verifyToken(event.authorizationToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

const generatePemCertificate = (pem) => {
  return `-----BEGIN CERTIFICATE-----\n${pem}\n-----END CERTIFICATE-----`
}

const verifyToken = async (authHeader) => {
  const token = getToken(authHeader)
  const jwt = jsonwebtoken.decode(token, { complete: true })

  const errorEnums = {
    KEYLIST_EMPTY: "KeyList doesn't exist",
    MAINKEY_EMPTY: "MainKey doesn't exist",
    INVALID_TOKEN: 'Invalid Token'
  }

  // TODO: Implement token verification
  try {
    const response = await axios.get(jwksUrl)
    const keyList = response?.data?.keys
    if (!keyList) {
      throw new Error(errorEnums.KEYLIST_EMPTY)
    }
    const mainKey = keyList.find((key) => key.kid === jwt.header.kid)
    if (!mainKey) {
      throw new Error(errorEnums.MAINKEY_EMPTY)
    }

    // generate certificate
    const pem = mainKey.x5c[0]
    const certificate = generatePemCertificate(pem)

    // verify token with certificate
    return jsonwebtoken.verify(token, certificate)
  } catch (error) {
    logger.error(errorEnums.INVALID_TOKEN, { error })
  }
}

const getToken = (authHeader) => {
  const errorEnums = {
    HEADER_AUTHENTICATION_FAIL: 'No authentication header',
    HEADER_AUTHENTICATION_INVALID: 'Invalid authentication header'
  }
  if (!authHeader) throw new Error(errorEnums.HEADER_AUTHENTICATION_FAIL)

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error(errorEnums.HEADER_AUTHENTICATION_INVALID)

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}
