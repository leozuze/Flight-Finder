const API_BASE = "http://localhost:8000/api"

export async function searchFlights(payload) {
  const res = await fetch(`${API_BASE}/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
  return res.json()
}

export async function quickSearchFlights(origin, destination) {
  const res = await fetch(`${API_BASE}/flights`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ origin, destination }),
  })
  return res.json()
}

export async function checkFlightStatus(flightNumber, date) {
  const res = await fetch(`${API_BASE}/status`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ flightNumber, date }),
  })
  return res.json()
}

// FIXED — backend's AirportBoardRequest expects `airport`, not `query`
export async function fetchAirportBoard(airport) {
  const res = await fetch(`${API_BASE}/airport-board`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ airport }),
  })
  return res.json()
}
export async function fetchFlightDetail(ident) {
  const res = await fetch(`${API_BASE}/flight`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ident }),
  })
  return res.json()
}