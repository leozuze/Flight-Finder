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

export async function searchFlights(payload) {
  return postJSON("/search", payload)
}

export async function quickSearchFlights(origin, destination) {
  return postJSON("/flights", { origin, destination })
}

export async function checkFlightStatus(flightNumber, date) {
  return postJSON("/status", { flightNumber, date })
}

export async function fetchAirportBoard(airport) {
  return postJSON("/airport-board", { airport })
}

export async function fetchFlightDetail(ident) {
  return postJSON("/flight", { ident })
}