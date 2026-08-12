import { useState, useEffect } from "react"

// Last-resort fallback if both browser geolocation and IP lookup fail —
// pick whatever's sensible for your actual user base.
const FALLBACK_LOCATION = { lat: 51.5074, lon: -0.1278, label: "London" }

const GEO_TIMEOUT_MS = 8000

async function getIpLocation() {
  // ipapi.co's free tier: no key required, unauthenticated GET, fine for
  // low/moderate traffic. Swap providers here later if you outgrow it —
  // nothing else in this hook needs to change.
  try {
    const res = await fetch("https://ipapi.co/json/")
    if (!res.ok) throw new Error(`ipapi.co returned ${res.status}`)
    const data = await res.json()
    if (data.latitude == null || data.longitude == null) throw new Error("ipapi.co returned no coordinates")
    return { lat: data.latitude, lon: data.longitude, label: data.city || data.country_name || null }
  } catch (err) {
    console.warn("[useGeolocation] IP fallback failed:", err.message)
    return null
  }
}

function getBrowserLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation not supported by this browser"))
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude, label: null }),
      (err) => reject(err),
      { timeout: GEO_TIMEOUT_MS, maximumAge: 5 * 60 * 1000 }
    )
  })
}

/**
 * Resolves a best-guess location on mount, trying in order:
 *   1. Browser geolocation (if already granted or user accepts the prompt)
 *   2. IP-based geolocation (denied/unavailable — no prompt, best-effort city)
 *   3. Hardcoded fallback (both failed — page must never end up with nothing)
 *
 * `source` tells the caller which one won, useful for UI copy like
 * "Showing places near London (detected from your IP)".
 */
export function useGeolocation() {
  const [location, setLocation] = useState(null)
  const [source, setSource] = useState(null) // "gps" | "ip" | "fallback"
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function resolve() {
      try {
        const gps = await getBrowserLocation()
        if (!cancelled) {
          setLocation(gps)
          setSource("gps")
          setLoading(false)
        }
        return
      } catch (err) {
        console.warn("[useGeolocation] Browser geolocation unavailable:", err.message)
      }

      const ip = await getIpLocation()
      if (cancelled) return
      if (ip) {
        setLocation(ip)
        setSource("ip")
        setLoading(false)
        return
      }

      setLocation(FALLBACK_LOCATION)
      setSource("fallback")
      setLoading(false)
    }

    resolve()
    return () => { cancelled = true }
  }, [])

  return { location, source, loading }
}