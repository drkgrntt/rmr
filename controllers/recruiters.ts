import { v4 } from 'https://deno.land/std@0.63.0/uuid/mod.ts'
import { Recruiter } from '../types.ts'
import { findOne, findAll, create, update, destroy } from '../database/index.ts'


/**
 * @desc    Get all recruiters
 * @route   GET /api/v1/recruiters
 */
const getRecruiters = async ({ response }: { response: any }) => {

  try {

    const recruiters: Recruiter[] = await findAll('recruiters')

    response.status = 201
    response.body = {
      success: true,
      data: recruiters
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
 * 
 * @desc    Get single recruiter
 * @route   GET /api/v1/recruiter/:id
 */
const getRecruiter = async ({ params, response }: { params: { id: string }, response: any }) => {

  try {

    const conditions = { id: params.id }
    const recruiters: Recruiter = await findOne('recruiters', conditions)

    response.status = 200
    response.body = {
      success: true,
      data: recruiters
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
 * @desc    Add recruiter
 * @route   POST /api/v1/recruiters
 */
const addRecruiter = async ({ request, response }: { request: any, response: any }) => {

  const body = await request.body()

  if (!request.hasBody) {
    response.status = 400
    response.body = {
      success: false,
      message: 'No data'
    }
    return
  }

  try {
    const recruiter: Recruiter = await body.value
    recruiter.id = v4.generate()

    await create('recruiters', recruiter)

    response.status = 201
    response.body = {
      success: true,
      data: recruiter
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
 * @desc    Update recruiter
 * @route   PUT /api/v1/recruiters/:id
 */
const updateRecruiter = async ({ params, request, response }: { params: { id: string }, request: any, response: any }) => {

  const body = await request.body()

  if (!request.hasBody) {
    response.status = 400
    response.body = {
      success: false,
      message: 'No data'
    }
    return
  }

  try {
    const conditions = { id: params.id }
    const recruiter: Recruiter = await body.value

    await update('recruiters', conditions, recruiter)

    response.status = 200
    response.body = {
      success: true,
      data: recruiter
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
 * @desc    Delete recruiter
 * @route   DELETE /api/v1/recruiters/:id
 */
const deleteRecruiter = async ({ params, response }: { params: { id: string }, response: any }) => {

  try {

    const conditions = { id: params.id }
    await destroy('recruiters', conditions)

    response.status = 200
    response.body = {
      success: true,
      data: {
        message: 'Recruiter deleted'
      }
    }

  } catch (err) {
    response.status = 500
    response.body = {
      success: false,
      message: err.toString()
    }
  }
}

export { getRecruiters, getRecruiter, addRecruiter, updateRecruiter, deleteRecruiter }
