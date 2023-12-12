import Axios from 'axios'
import jsonwebtoken from 'jsonwebtoken'
import { createLogger } from '../../utils/logger.mjs'
import axios from 'axios'

const logger = createLogger('auth')

const jwksUrl = 'https://test-endpoint.auth0.com/.well-known/jwks.json'

const cer = `-----BEGIN CERTIFICATE-----
MIIDHTCCAgWgAwIBAgIJbgZIeR7nj0+nMA0GCSqGSIb3DQEBCwUAMCwxKjAoBgNV
BAMTIWRldi1pdHp4eGxvc2g0b3JjZXBiLnVzLmF1dGgwLmNvbTAeFw0yMzEyMTIx
NzAyMjVaFw0zNzA4MjAxNzAyMjVaMCwxKjAoBgNVBAMTIWRldi1pdHp4eGxvc2g0
b3JjZXBiLnVzLmF1dGgwLmNvbTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoC
ggEBANDVho32r8MQ13zuNnVi/W+1fPWoWiAJj2lA85zYsCaCEzpPlISQgVLOh3oS
L0+JQGkdfqHKDtMMZ3znPLDNHFWprlKl6yv9Dphm2m2cp/tIUZY4KF2E3twQV2jU
8iZnudYb8r/ztl0a8ZqP1NxyvAu4gTqxq6qpgPWJlcHjYA0ML98ZOSKEGMgVAaeR
1GJWTmy00FFwnJlKf9xjv4gmndyHzAwDV40K+aZ3/IGrJQ5Si4F4gFVtG6PdptlU
1cGkMwDc/+3wwTWn+xWE79q5yV6ZBxKlfzHGZspBmrgw5mUVuw5Ok8kAyZre/oEg
+gq2+smHYRGuTQC+bJrjcbHX0V8CAwEAAaNCMEAwDwYDVR0TAQH/BAUwAwEB/zAd
BgNVHQ4EFgQUyX1So5IlpBr6gH6O8lvQBGeEQLUwDgYDVR0PAQH/BAQDAgKEMA0G
CSqGSIb3DQEBCwUAA4IBAQCOSTT/HsY2ZVQhBeTAT0Ozw0lxIakqBx04RXtud6da
4Gv8LV2QZvWAe1CSl178GZll7LFRpBkL+NDNVlRzU1C/dxzN2VecEljbFVXBJRBJ
lUlEx+GqbbF+apQ/Cp2iHFSyI+jD00xZLqvZHDQlk4GDIKAwkI7+gJGZ37WvPfrG
jwsrugeYp+Z+s4CXJH7G/7ROUlwbxB2jVT1REkwU0e4MWKtKmX3GMl6XxU1Amdro
vLXIdi8EIUYbCHN+/DsQTte9Eag6HdwfqFg/jgl3kVisULEjxWgwsDg/ihQXhTa8
qhjhmuxm/2fYMQ3YvC6kTOtvtwJz1c7exzAq/cdkEUBO
-----END CERTIFICATE-----`

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
