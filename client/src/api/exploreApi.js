const API_BASE = `${import.meta.env.VITE_API_URL || "http://localhost:8000"}/api`

async function postJSON(path, body) {
  let res
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
  } catch (err) {
    throw new Error(`Network error calling ${path}: ${err.message}`)
  }

  let data
  try {
    data = await res.json()
  } catch {
    throw new Error(`${path} returned a non-JSON response (status ${res.status})`)
  }

  if (!res.ok) {
    throw new Error(data?.error || data?.detail || `${path} failed with status ${res.status}`)
  }

  return data
}

// location: either { lat, lon } (geolocation flow) or { originCode } (manual
// override, bypasses geolocation — same escape-hatch pattern as Places)
// filters: { budgetMax, category, currency } — all optional
export async function fetchExplore(location, filters = {}) {
  const { budgetMax, category, currency } = filters
  return postJSON("/explore", {
    ...location,
    ...(budgetMax ? { budgetMax } : {}),
    ...(category ? { category } : {}),
    ...(currency ? { currency } : {}),
  })
}

export async function fetchExplorePlaces(locations) {
  return postJSON("/explore/places", { locations })
}