import { Router } from 'https://deno.land/x/oak/mod.ts'
import { getRecruiters, getRecruiter, addRecruiter, updateRecruiter, deleteRecruiter } from './controllers/recruiters.ts'

const router = new Router()

router.get('/api/v1/recruiters', getRecruiters)
  .get('/api/v1/recruiters/:id', getRecruiter)
  .post('/api/v1/recruiters', addRecruiter)
  .put('/api/v1/recruiters/:id', updateRecruiter)
  .delete('/api/v1/recruiters/:id', deleteRecruiter)

export default router
