import { v4 } from 'https://deno.land/std@0.63.0/uuid/mod.ts'
import { hash, compare, genSalt } from "https://deno.land/x/bcrypt/mod.ts"
import { validateJwt } from "https://deno.land/x/djwt/validate.ts"
import { makeJwt, setExpiration, Jose, Payload } from "https://deno.land/x/djwt/create.ts"
import { findOne, create } from '../database/index.ts'
import { jwtKey } from '../config.ts'
import { User } from '../types.ts'

/**
 * @desc    Get the current user
 * @route   GET /api/v1/auth/currentUser
 */
const currentUser = async ({ request, response }: { request: any, response: any }) => {

  try {
    const authHeader = request.headers.get('Authorization')
    if (!authHeader) {
      response.status = 200
      response.body = {
        success: true,
        data: null
      }
      return
    }

    const [bearer, token] = authHeader.split(' ')
    if (!token) {
      response.status = 400
      response.body = {
        success: false,
        message: 'Please provide a bearer token.'
      }
      return
    }

    if (!jwtKey) {
      throw new Error('No provided JWT_KEY')
    }

    const validation: any = await validateJwt({ jwt: token, key: jwtKey, algorithm: "HS256" })
    if (!validation.isValid) {
      response.status = 400
      response.body = {
        success: false,
        message: 'Invalid token.'
      }
      return
    }

    const user: User = await findOne('users', { id: validation.payload.uid })

    response.status = 200
    response.body = {
      success: true,
      data: user
    }
  } catch (err) {
    response.status = 500
    response.body = {
      success: false,
      message: err.toString()
    }
  }
}


/**
 * @desc    Login a user
 * @route   POST /api/v1/auth/login
 */
const loginUser = async ({ request, response }: { request: any, response: any }) => {

  const body = await request.body()

  if (!request.hasBody) {
    response.status = 400
    response.body = {
      success: false,
      message: 'No data'
    }
    return
  }

  const { email, password } = await body.value

  if (!email || !password) {
    response.status = 400
    response.body = {
      success: false,
      message: 'Please enter an email and password.'
    }
    return
  }

  try {

    const user: User = await findOne('users', { email })
    if (!user) {
      response.status = 400
      response.body = {
        success: false,
        message: 'Invalid email or password.'
      }
      return
    }
  
    const correctPassword = await compare(password, user.password)
    if (!correctPassword) {
      response.status = 400
      response.body = {
        success: false,
        message: 'Invalid email or password.'
      }
      return
    }

    const header: Jose = {
      alg: "HS256",
      typ: "JWT"
    }
    const payload: Payload = {
      exp: setExpiration(60*60*24*7),
      uid: user.id
    }
    if (!jwtKey) {
      throw new Error('No provided JWT_KEY')
    }
    const token = await makeJwt({ header, payload, key: jwtKey })

    response.status = 200
    response.body = {
      success: true,
      data: { user, token }
    }

  } catch (err) {
    response.status = 500
    response.body = {
      success: false,
      message: err.toString()
    }
  }
}


/**
 * @desc    Register a user
 * @route   POST /api/v1/auth/register
 */
const registerUser = async ({ request, response }: { request: any, response: any }) => {

  const body = await request.body()

  if (!request.hasBody) {
    response.status = 400
    response.body = {
      success: false,
      message: 'No data'
    }
    return
  }

  const { email, password } = await body.value

  if (!email || !password) {
    response.status = 400
    response.body = {
      success: false,
      message: 'Please enter an email and password.'
    }
    return
  }

  const regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  if (!regex.test(String(email).toLowerCase())) {
    response.status = 400
    response.body = {
      success: false,
      message: 'Please enter a valid email.'
    }
    return
  }

  const userExists = await findOne('users', { email }, { fields: ['id'] })
  if (userExists) {
    response.status = 400
    response.body = {
      success: false,
      message: 'User with this email already exists.'
    }
    return
  }

  try {

    const salt = await genSalt(12)
    const passwordHash = await hash(password, salt)
    
    const id = v4.generate()

    const user: User = {
      id,
      email,
      password: passwordHash,
      alias: 'Anonymous'
    }

    await create('users', user)

    const header: Jose = {
      alg: "HS256",
      typ: "JWT"
    }
    const payload: Payload = {
      exp: setExpiration(60*60*24*7),
      uid: id
    }
    if (!jwtKey) {
      throw new Error('No provided jwtKey')
    }
    const token = await makeJwt({ header, payload, key: jwtKey })

    response.status = 200
    response.body = {
      success: true,
      data: { user, token }
    }

  } catch (err) {
    response.status = 500
    response.body = {
      success: false,
      message: err.toString()
    }
  }
}


export { currentUser, loginUser, registerUser }
