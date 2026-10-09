export const formatDateRange = (startStr: string, endStr: string): string => {
  if (!startStr || !endStr) return ''

  const start = new Date(startStr)
  const end = new Date(endStr)

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return `${startStr} - ${endStr}`
  }

  const startDay = start.getDate()
  const endDay = end.getDate()

  const startMonth = start.toLocaleString('en-US', { month: 'short' })
  const endMonth = end.toLocaleString('en-US', { month: 'short' })

  if (start.getTime() === end.getTime()) {
    return `${startDay} ${startMonth}`
  }

  if (startMonth === endMonth) {
    return `${startDay}–${endDay} ${startMonth}`
  }

  return `${startDay} ${startMonth} – ${endDay} ${endMonth}`
}

export const formatDate = (dateStr: string): string => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
}
