
const parseDate = (dateStr: string): Date | null => {
  if (!dateStr) return null

  // Parse date-only values as calendar dates, not UTC timestamps.
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr)

  if (match) {
    const year = Number(match[1])
    const month = Number(match[2])
    const day = Number(match[3])
    const date = new Date(year, month - 1, day)

    // Reject invalid dates such as 2026-02-30.
    if (
      date.getFullYear() !== year ||
      date.getMonth() !== month - 1 ||
      date.getDate() !== day
    ) {
      return null
    }

    return date
  }

  const date = new Date(dateStr)
  return Number.isNaN(date.getTime()) ? null : date
}

export const formatDateRange = (
  startStr: string,
  endStr: string
): string => {
  if (!startStr || !endStr) return ''

  const start = parseDate(startStr)
  const end = parseDate(endStr)

  if (!start || !end) return `${startStr} - ${endStr}`

  const startDay = start.getDate()
  const endDay = end.getDate()

  const startMonth = start.toLocaleString('en-US', { month: 'short' })
  const endMonth = end.toLocaleString('en-US', { month: 'short' })

  if (
    start.getFullYear() === end.getFullYear() &&
    startMonth === endMonth &&
    startDay === endDay
  ) {
    return `${startDay} ${startMonth}`
  }

  if (
    start.getFullYear() === end.getFullYear() &&
    startMonth === endMonth
  ) {
    return `${startDay}–${endDay} ${startMonth}`
  }

  if (start.getFullYear() === end.getFullYear()) {
    return `${startDay} ${startMonth} – ${endDay} ${endMonth}`
  }

  return `${startDay} ${startMonth} ${start.getFullYear()} – ${endDay} ${endMonth} ${end.getFullYear()}`
}

export const formatDate = (dateStr: string): string => {
  if (!dateStr) return ''

  const date = parseDate(dateStr)
  if (!date) return dateStr

  return date.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}
