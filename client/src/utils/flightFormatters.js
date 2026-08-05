export function formatDateTime(value) {
  if (!value || value === "N/A") return ""
  const d = new Date(value.replace(" ", "T"))
  if (isNaN(d.getTime())) return value
  return d.toLocaleString(undefined, {
    weekday: "short", month: "short", day: "numeric",
    year: "numeric", hour: "numeric", minute: "2-digit",
  })
}

export function formatDateOnly(value) {
  if (!value || value === "N/A") return ""
  const d = new Date(value.replace(" ", "T"))
  if (isNaN(d.getTime())) return value
  return d.toLocaleDateString(undefined, {
    weekday: "short", month: "short", day: "numeric", year: "numeric",
  })
}

export function toDate(value) {
  if (!value || value === "N/A") return null
  const d = new Date(value.replace(" ", "T"))
  return isNaN(d.getTime()) ? null : d
}

export function getMinutesOfDay(value) {
  const d = toDate(value)
  if (!d) return null
  return d.getHours() * 60 + d.getMinutes()
}

export function formatMinutesLabel(min) {
  if (min == null) return ""
  const h24 = Math.floor(min / 60)
  const m = min % 60
  const period = h24 >= 12 ? "pm" : "am"
  let h12 = h24 % 12
  if (h12 === 0) h12 = 12
  return `${h12}${m ? ":" + String(m).padStart(2, "0") : ""}${period}`
}

export function getDurationMinutes(departValue, arriveValue) {
  const dep = toDate(departValue)
  const arr = toDate(arriveValue)
  if (!dep || !arr) return null
  const diff = Math.round((arr - dep) / 60000)
  return diff >= 0 ? diff : null
}

export function formatDurationLabel(min) {
  if (min == null) return ""
  const h = Math.floor(min / 60)
  const m = min % 60
  return `${h}h ${m}m`
}

export function getDepartDateLabel(value) {
  const d = toDate(value)
  if (!d) return "Unknown"
  const today = new Date()
  const tomorrow = new Date()
  tomorrow.setDate(today.getDate() + 1)
  const sameDay = (a, b) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
  if (sameDay(d, today)) return "Today"
  if (sameDay(d, tomorrow)) return "Tomorrow"
  return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })
}

export function getAirlineCode(ident) {
  if (!ident || ident === "N/A") return null
  const match = ident.match(/^([A-Z]{2,3})\d/)
  return match ? match[1] : null
}

export function getAirlineLogoUrl(iataCode, size = 70) {
  if (!iataCode) return null
  return `https://www.gstatic.com/flights/airline_logos/${size}px/${iataCode}.png`
}