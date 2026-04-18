import prisma from '../lib/prisma.js'

export const getFieldUpdates = async (req, res) => {
  try {
    const field = await prisma.field.findUnique({
      where: { id: req.params.fieldId }
    })

    if (!field) {
      return res.status(404).json({ message: 'Field not found' })
    }

    if (req.user.role === 'AGENT' && field.agentId !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied' })
    }

    const updates = await prisma.fieldUpdate.findMany({
      where: { fieldId: req.params.fieldId },
      include: {
        agent: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return res.status(200).json({ updates })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Server error' })
  }
}

export const createFieldUpdate = async (req, res) => {
  const { note, stage } = req.body

  try {
    const field = await prisma.field.findUnique({
      where: { id: req.params.fieldId }
    })

    if (!field) {
      return res.status(404).json({ message: 'Field not found' })
    }

    if (req.user.role === 'AGENT' && field.agentId !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied' })
    }

    const update = await prisma.fieldUpdate.create({
      data: {
        note,
        stage,
        fieldId: req.params.fieldId,
        agentId: req.user.userId
      },
      include: {
        agent: {
          select: { id: true, name: true, email: true }
        }
      }
    })

    await prisma.field.update({
      where: { id: req.params.fieldId },
      data: { stage }
    })

    return res.status(201).json({ update })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Server error' })
  }
}