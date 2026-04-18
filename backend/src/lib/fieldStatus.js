export const computeFieldStatus = (field) => {
  const now = new Date()
  const plantingDate = new Date(field.plantingDate)
  const daysSincePlanting = Math.floor(
    (now - plantingDate) / (1000 * 60 * 60 * 24)
  )

  if (field.stage === 'HARVESTED') {
    return 'COMPLETED'
  }

  if (field.stage === 'READY') {
    if (daysSincePlanting > 180) {
      return 'AT_RISK'
    }
    return 'ACTIVE'
  }

  if (field.stage === 'GROWING' || field.stage === 'PLANTED') {
    if (daysSincePlanting > 120) {
      return 'AT_RISK'
    }
    return 'ACTIVE'
  }

  return 'ACTIVE'
}