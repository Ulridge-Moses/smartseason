import { Router } from 'express'
import {
  getAllFields,
  getAgentFields,
  getFieldById,
  createField,
  updateField,
  deleteField
} from '../controllers/fieldController.js'
import { authenticate, authorizeAdmin } from '../middleware/auth.js'

const router = Router()

router.get('/', authenticate, authorizeAdmin, getAllFields)
router.get('/my-fields', authenticate, getAgentFields)
router.get('/:id', authenticate, getFieldById)
router.post('/', authenticate, authorizeAdmin, createField)
router.put('/:id', authenticate, authorizeAdmin, updateField)
router.delete('/:id', authenticate, authorizeAdmin, deleteField)

export default router