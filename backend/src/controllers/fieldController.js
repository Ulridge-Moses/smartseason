import prisma from '../lib/prisma.js'
import { computeFieldStatus } from '../lib/fieldStatus.js'

export const getAllFields = async (req, res) => {
  try {
    const fields = await prisma.field.findMany({
      include: {
        agent: {
          select: { id: true, name: true, email: true }
        },
        updates: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    const fieldsWithStatus = fields.map(field => ({
      ...field,
      status: computeFieldStatus(field)
    }))

    return res.status(200).json({ fields: fieldsWithStatus })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Server error' })
  }
}

export const getAgentFields = async (req, res) => {
  try {
    const fields = await prisma.field.findMany({
      where: { agentId: req.user.userId },
      include: {
        agent: {
          select: { id: true, name: true, email: true }
        },
        updates: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    const fieldsWithStatus = fields.map(field => ({
      ...field,
      status: computeFieldStatus(field)
    }))

    return res.status(200).json({ fields: fieldsWithStatus })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Server error' })
  }
}

export const getFieldById = async (req, res) => {
  try {
    const field = await prisma.field.findUnique({
      where: { id: req.params.id },
      include: {
        agent: {
          select: { id: true, name: true, email: true }
        },
        updates: {
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!field) {
      return res.status(404).json({ message: 'Field not found' })
    }

    if (req.user.role === 'AGENT' && field.agentId !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied' })
    }

    return res.status(200).json({
      field: { ...field, status: computeFieldStatus(field) }
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Server error' })
  }
}

export const createField = async (req, res) => {
  const { name, cropType, plantingDate, agentId, stage } = req.body

  try {
    const field = await prisma.field.create({
      data: {
        name,
        cropType,
        plantingDate: new Date(plantingDate),
        agentId,
        stage: stage || 'PLANTED'
      },
      include: {
        agent: {
          select: { id: true, name: true, email: true }
        }
      }
    })

    return res.status(201).json({
      field: { ...field, status: computeFieldStatus(field) }
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Server error' })
  }
}

export const updateField = async (req, res) => {
  const { name, cropType, plantingDate, agentId, stage } = req.body

  try {
    const existing = await prisma.field.findUnique({
      where: { id: req.params.id }
    })

    if (!existing) {
      return res.status(404).json({ message: 'Field not found' })
    }

    const field = await prisma.field.update({
      where: { id: req.params.id },
      data: {
        ...(name && { name }),
        ...(cropType && { cropType }),
        ...(plantingDate && { plantingDate: new Date(plantingDate) }),
        ...(agentId && { agentId }),
        ...(stage && { stage })
      },
      include: {
        agent: {
          select: { id: true, name: true, email: true }
        }
      }
    })

    return res.status(200).json({
      field: { ...field, status: computeFieldStatus(field) }
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Server error' })
  }
}

export const deleteField = async (req, res) => {
  try {
    const existing = await prisma.field.findUnique({
      where: { id: req.params.id }
    })

    if (!existing) {
      return res.status(404).json({ message: 'Field not found' })
    }

    await prisma.fieldUpdate.deleteMany({
      where: { fieldId: req.params.id }
    })

    await prisma.field.delete({
      where: { id: req.params.id }
    })

    return res.status(200).json({ message: 'Field deleted successfully' })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Server error' })
  }
}