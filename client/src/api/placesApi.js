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

// query: free text ("cafes", "mobile phone", "shop")
// location: either { lat, lon } (GPS/"near me" flow) or { location: "London" } (typed city/place flow)
// radius: optional, meters — server clamps to PLACES_MAX_RADIUS_METERS if omitted/too large
export async function searchPlaces(query, location, radius) {
  return postJSON("/places", { query, ...location, ...(radius ? { radius } : {}) })
}

// Same location shape as searchPlaces, but no query — server searches its
// fixed DEFAULT_CATEGORIES set. Used to populate the page before the user
// has typed anything.
export async function fetchDefaultPlaces(location, radius) {
  return postJSON("/places/default", { ...location, ...(radius ? { radius } : {}) })
}