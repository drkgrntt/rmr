import { Router } from 'https://deno.land/x/oak/mod.ts'
import {
  getRecruiters,
  getRecruiter,
  addRecruiter,
  updateRecruiter,
  deleteRecruiter
} from './controllers/recruiters.ts'
import {
  currentUser,
  loginUser,
  registerUser
} from './controllers/authentication.ts'

const router = new Router()

router.get('/api/v1/recruiters', getRecruiters)
  .get('/api/v1/recruiters/:id', getRecruiter)
  .post('/api/v1/recruiters', addRecruiter)
  .put('/api/v1/recruiters/:id', updateRecruiter)
  .delete('/api/v1/recruiters/:id', deleteRecruiter)

router.get('/api/v1/auth/currentUser', currentUser)
  .post('/api/v1/auth/login', loginUser)
  .post('/api/v1/auth/register', registerUser)

export default router
