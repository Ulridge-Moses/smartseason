import { Router } from 'express'
import { login, refresh, logout, me, getAgents } from '../controllers/authController.js'
import { authenticate, authorizeAdmin } from '../middleware/auth.js'

const router = Router()

router.post('/login', login)
router.post('/refresh', refresh)
router.post('/logout', logout)
router.get('/me', authenticate, me)
router.get('/agents', authenticate, authorizeAdmin, getAgents)

export default router