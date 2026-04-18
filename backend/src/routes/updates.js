import { Router } from 'express'
import {
  getFieldUpdates,
  createFieldUpdate
} from '../controllers/updateController.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()

router.get('/:fieldId/updates', authenticate, getFieldUpdates)
router.post('/:fieldId/updates', authenticate, createFieldUpdate)

export default router