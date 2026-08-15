import { useEffect, useState } from "react"
import { ArrowRight } from "lucide-react"
import PlaceCard from "@/components/places/PlaceCard"
import { searchPlaces } from "@/api/placesApi"

const PLACES_RADIUS_METERS = 15000
const CATEGORY_QUERIES = ["hotels", "nature", "tourist attractions"]
const PER_CATEGORY_LIMIT = 4

export default function ExplorePlacesSection({ geoLocation, onViewAll }) {
  const lat = geoLocation?.lat
  const lon = geoLocation?.lon

  const [places, setPlaces] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (lat == null || lon == null) return
    let cancelled = false
    setLoading(true)
    setError(null)
    setPlaces([]) // clear stale cards immediately so a city/location change
                   // shows the loading skeleton instead of the previous
                   // city's places lingering until the new fetch resolves

    const location = { lat, lon }

    // Three parallel category searches instead of the generic "default
    // places" set — Explore is about where to go and stay, not where to
    // eat nearby, so hotels/nature/attractions fit this page specifically.
    Promise.all(CATEGORY_QUERIES.map((q) => searchPlaces(q, location, PLACES_RADIUS_METERS)))
      .then((results) => {
        if (cancelled) return
        const firstError = results.find((r) => r.error)
        if (firstError) {
          setError(firstError.error)
          return
        }
        const merged = results.flatMap((r) => (r.places || []).slice(0, PER_CATEGORY_LIMIT))
        setPlaces(merged)
      })
      .catch((err) => !cancelled && setError(err.message))
      .finally(() => !cancelled && setLoading(false))

    return () => { cancelled = true }
  }, [lat, lon])

  if (lat == null || lon == null || (loading && places.length === 0)) {
    return (
      <section className="mb-10 min-w-0">
        <h2 className="text-lg font-semibold mb-4" style={{ color: "var(--nuvex-ink, #10131A)" }}>Worth seeing nearby</h2>
        <div className="flex gap-4 overflow-x-auto pb-2 min-w-0">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="w-56 h-64 rounded-2xl shrink-0 animate-pulse" style={{ background: "#E4E7EC" }} />
          ))}
        </div>
      </section>
    )
  }

  if (error || places.length === 0) return null // fails quietly — this is a bonus section, not core to Explore

  return (
    <section className="mb-10 min-w-0">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold" style={{ color: "var(--nuvex-ink, #10131A)" }}>Worth seeing nearby</h2>
        <button
          onClick={onViewAll}
          className="flex items-center gap-1 text-xs font-medium"
          style={{ color: "var(--nuvex-accent, #17B8C4)" }}
        >
          View all <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div
    className="flex w-full max-w-full gap-4 overflow-x-auto pb-2 min-w-0 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    style={{
        overscrollBehaviorX: "contain",
        touchAction: "pan-x pan-y",
    }}
    >
       {places.map((place) => (
        <div key={place.id} className="w-56 max-w-56 shrink-0">
            <PlaceCard place={place} isActive={false} onHover={() => {}} onLeave={() => {}} />
          </div>
        ))}
      </div>
    </section>
  )
}