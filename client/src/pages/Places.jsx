import { useState, useEffect, useCallback, useRef } from "react"
import { useTranslation } from "react-i18next"
import { motion, AnimatePresence } from "framer-motion"
import { Search, MapPin, LocateFixed, RefreshCw, Loader2, AlertTriangle } from "lucide-react"
import Footer from "@/components/Footer"
import PlaceCard from "@/components/places/PlaceCard"
import PlacesMap from "@/components/places/PlacesMap"
import MapErrorBoundary from "@/components/places/MapErrorBoundary"
import { useGeolocation } from "@/hooks/useGeolocation"
import { searchPlaces, fetchDefaultPlaces } from "@/api/placesApi"
import PlacesProgressSteps from "@/components/places/PlacesProgressSteps"

const NUVEX_THEME = {
  "--nuvex-bg": "#FFFFFF",
  "--nuvex-border": "#E4E7EC",
  "--nuvex-ink": "#10131A",
  "--nuvex-slate": "#64707D",
  "--nuvex-signal": "#E8A33D",
  "--nuvex-accent": "#17B8C4",
  "--nuvex-accent-hover": "#149AA5",
  "--nuvex-display": "'Bricolage Grotesque', 'Segoe UI', sans-serif",
  "--nuvex-body": "'IBM Plex Sans', 'Segoe UI', sans-serif",
}

function useNuvexFonts() {
  useEffect(() => {
    if (document.getElementById("hero-fonts")) return
    const link = document.createElement("link")
    link.id = "hero-fonts"
    link.rel = "stylesheet"
    link.href =
      "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@400..800&family=IBM+Plex+Sans:wght@400;500;600&display=swap"
    document.head.appendChild(link)
  }, [])
}

const NAV_CONTAINER = "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
const DEFAULT_RADIUS_METERS = 15000 // was 3000 — "near me" now searches out to 15km

// Splits free text like "cafes near me" / "cafes in NIBM" / "restaurants"
// into a category to search for and (optionally) a place name to search
// around. This replaced the old separate "change location" field — the
// location now lives directly in the query.
function parseSearchQuery(raw) {
  const trimmed = raw.trim()
  if (!trimmed) return { category: null, locationText: null }

  let m = trimmed.match(/^(.+?)\s+(?:near me|nearby)$/i)
  if (m) return { category: m[1].trim(), locationText: null }

  m = trimmed.match(/^(.+?)\s+(?:in|near|around|at)\s+(.+)$/i)
  if (m) return { category: m[1].trim(), locationText: m[2].trim() }

  return { category: trimmed, locationText: null }
}

export default function Places({ onNavigate }) {
  useNuvexFonts()
  const { t } = useTranslation()
  const { location: geoLocation, source: geoSource, loading: geoLoading } = useGeolocation()

  const [queryInput, setQueryInput] = useState("")
  const [activeQuery, setActiveQuery] = useState(null) // { category, locationText } | null
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [activeCategory, setActiveCategory] = useState(null)
  const [hoveredId, setHoveredId] = useState(null)
  const [radius, setRadius] = useState(DEFAULT_RADIUS_METERS)

  const locationKey = geoLocation
    ? `geo:${geoSource}:${geoLocation.lat}:${geoLocation.lon}:${geoLocation.label ?? ""}`
    : null

const MIN_LOADING_MS = 400 // floor so the skeleton is always perceivable, even on a cache hit

const runSearch = useCallback(async (parsed, r) => {
    if (!geoLocation && !parsed?.locationText) return
    setLoading(true)
    setError(null)
    setResult(null)
    const startedAt = Date.now()
    try {
      const userCoords = parsed?.category && geoLocation
        ? { userLat: geoLocation.lat, userLon: geoLocation.lon }
        : {}

      const locationPayload =
        parsed?.locationText
          ? { location: parsed.locationText, ...userCoords }
          : geoSource === "fallback" && geoLocation?.label
          ? { location: geoLocation.label, ...userCoords }
          : { lat: geoLocation.lat, lon: geoLocation.lon, ...userCoords }

      const data = parsed?.category
        ? await searchPlaces(parsed.category, locationPayload, r)
        : await fetchDefaultPlaces(locationPayload, r)

      const elapsed = Date.now() - startedAt
      if (elapsed < MIN_LOADING_MS) {
        await new Promise((resolve) => setTimeout(resolve, MIN_LOADING_MS - elapsed))
      }

      if (data.error) {
        setError(data.error)
        setResult(null)
      } else {
        setResult(data)
        setActiveCategory(null)
      }
    } catch (err) {
      console.error("[Places] search failed:", err)
      setError(err.message)
      setResult(null)
    } finally {
      setLoading(false)
    }
  }, [geoLocation, geoSource])

  // Fires once per genuine location change, carrying the current query +
  // radius forward so a GPS update doesn't silently reset an active search
  // back to "nearby defaults".
  const lastSearchKeyRef = useRef(null)
  useEffect(() => {
    if (!locationKey) return
    if (geoLoading) return
    if (lastSearchKeyRef.current === locationKey) return
    lastSearchKeyRef.current = locationKey
    runSearch(activeQuery, radius)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locationKey, geoLoading, runSearch])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    const trimmed = queryInput.trim()
    const parsed = trimmed ? parseSearchQuery(trimmed) : null
    setActiveQuery(parsed)
    runSearch(parsed, radius)
  }

  const handleExpandRadius = () => {
    const nextRadius = Math.min(radius * 2, 50000)
    setRadius(nextRadius)
    runSearch(activeQuery, nextRadius)
  }

  const places = result?.places || []
  const filteredPlaces = activeCategory
    ? places.filter((p) => p.category === activeCategory)
    : places

  const shouldGroup = Boolean(result?.ambiguous) && !activeCategory && result.resolvedCategories.length > 1
  const groupedSections = shouldGroup
    ? result.resolvedCategories
        .map((cat) => ({ category: cat, items: filteredPlaces.filter((p) => p.category === cat) }))
        .filter((section) => section.items.length > 0)
    : null

  const mapCenter = result?.searchedLocation
    ? { lat: result.searchedLocation.lat, lon: result.searchedLocation.lon }
    : geoLocation
    ? { lat: geoLocation.lat, lon: geoLocation.lon }
    : null

  const isInitialLoading = geoLoading || (loading && !result)
  const showEmptyState = !loading && !error && result && filteredPlaces.length === 0

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ ...NUVEX_THEME, background: "var(--nuvex-bg)", color: "var(--nuvex-ink)", fontFamily: "var(--nuvex-body)" }}
    >
      {/* MainNav intentionally NOT rendered here — App.jsx already mounts
          it globally above every route. Rendering it again here was the
          cause of the duplicate header. */}

      <div className={`pt-6 ${NAV_CONTAINER}`}>
        <form onSubmit={handleSearchSubmit} className="flex gap-2 max-w-2xl">
          <div
            className="flex-1 flex items-center gap-2 rounded-full px-4 h-11 border"
            style={{ borderColor: "var(--nuvex-border)", background: "#F6F5FC" }}
          >
            <Search className="w-4 h-4 shrink-0" style={{ color: "var(--nuvex-slate)" }} />
            <input
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              placeholder="Try 'cafes near me' or 'cafes in NIBM'..."
              className="flex-1 bg-transparent text-sm outline-none"
              style={{ color: "var(--nuvex-ink)" }}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-5 rounded-full text-sm font-medium text-white shrink-0 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-70"
            style={{ background: "var(--nuvex-accent)" }}
            onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = "var(--nuvex-accent-hover)" }}
            onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = "var(--nuvex-accent)" }}
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
            Search
          </button>
        </form>

        <div className="flex items-center gap-1.5 mt-3 text-xs flex-wrap" style={{ color: "var(--nuvex-slate)" }}>
          <LocateFixed className="w-3.5 h-3.5" />
          {geoLoading ? (
            <span>Finding your location...</span>
          ) : (
            <span>
              Showing places near{" "}
              <strong style={{ color: "var(--nuvex-ink)" }}>
                {result?.searchedLocation?.formatted || geoLocation?.label || "your area"}
              </strong>
              {geoSource === "ip" && " (estimated from your network)"}
              {geoSource === "fallback" && " (default location)"}
              {" — distances shown are always measured from your real location"}
            </span>
          )}
        </div>

        {/* Photo disclaimer — Geoapify/OSM don't return real photos of the
            actual venue, so every image on a place card is a representative
            stock image, not a picture of that specific place. */}
        <div
          className="flex items-start gap-2 mt-4 rounded-xl px-3 py-2 text-xs max-w-2xl"
          style={{ background: "#FFF7E8", border: "1px solid #F3DCA8", color: "#8A5A0B" }}
        >
          <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <span>Photos on place cards are representative stock images, not real photos of the actual location.</span>
        </div>

        <AnimatePresence>
          {result?.ambiguous && result.resolvedCategories.length > 1 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex flex-wrap gap-2 mt-4 overflow-hidden"
            >
              <button
                onClick={() => setActiveCategory(null)}
                className="text-xs font-medium px-3 py-1.5 rounded-full transition-colors"
                style={
                  !activeCategory
                    ? { background: "var(--nuvex-accent)", color: "#FFFFFF" }
                    : { background: "var(--nuvex-border)", color: "var(--nuvex-slate)" }
                }
              >
                All ({places.length})
              </button>
              {result.resolvedCategories.map((cat) => {
                const count = places.filter((p) => p.category === cat).length
                const active = activeCategory === cat
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(active ? null : cat)}
                    className="text-xs font-medium px-3 py-1.5 rounded-full transition-colors"
                    style={
                      active
                        ? { background: "var(--nuvex-accent)", color: "#FFFFFF" }
                        : { background: "var(--nuvex-border)", color: "var(--nuvex-slate)" }
                    }
                  >
                    {cat} ({count})
                  </button>
                )
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className={`flex-1 mt-6 pb-16 ${NAV_CONTAINER}`}>
        <div className="grid lg:grid-cols-[1.2fr_1fr] gap-6 items-start">
          <div className="min-w-0">
            {isInitialLoading && (
              <PlacesProgressSteps active={isInitialLoading} cardCount={6} />
            )}

            {!isInitialLoading && error && (
              <div className="text-center text-red-500 bg-red-50 border border-red-100 rounded-xl py-6 px-4 text-sm">
                {error}
              </div>
            )}

            {!isInitialLoading && !error && showEmptyState && (
              <div
                className="text-center rounded-2xl py-12 px-6"
                style={{ background: "#F6F5FC", border: "1px solid var(--nuvex-border)" }}
              >
                <MapPin className="w-8 h-8 mx-auto mb-3" style={{ color: "var(--nuvex-slate)" }} />
                <p className="text-sm font-medium" style={{ color: "var(--nuvex-ink)" }}>
                  Nothing found within {radius >= 1000 ? `${radius / 1000}km` : `${radius}m`}
                </p>
                <p className="text-xs mt-1" style={{ color: "var(--nuvex-slate)" }}>
                  Try widening the search radius.
                </p>
                <button
                  onClick={handleExpandRadius}
                  className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium px-4 py-2 rounded-full text-white transition-colors"
                  style={{ background: "var(--nuvex-accent)" }}
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Expand search
                </button>
              </div>
            )}

            {!isInitialLoading && !error && groupedSections && groupedSections.length > 0 && (
              <div className="space-y-8">
                {groupedSections.map((section) => (
                  <div key={section.category}>
                    <div className="flex items-baseline justify-between mb-3">
                      <h2 className="text-sm font-semibold" style={{ color: "var(--nuvex-ink)" }}>
                        {section.category}
                      </h2>
                      <span className="text-xs" style={{ color: "var(--nuvex-slate)" }}>
                        {section.items.length} found
                      </span>
                    </div>
                    <motion.div layout className="grid sm:grid-cols-2 gap-4">
                      <AnimatePresence>
                        {section.items.map((place) => (
                          <PlaceCard
                            key={place.id}
                            place={place}
                            isActive={hoveredId === place.id}
                            onHover={setHoveredId}
                            onLeave={() => setHoveredId(null)}
                          />
                        ))}
                      </AnimatePresence>
                    </motion.div>
                  </div>
                ))}
              </div>
            )}

            {!isInitialLoading && !error && !groupedSections && filteredPlaces.length > 0 && (
              <motion.div layout className="grid sm:grid-cols-2 gap-4">
                <AnimatePresence>
                  {filteredPlaces.map((place) => (
                    <PlaceCard
                      key={place.id}
                      place={place}
                      isActive={hoveredId === place.id}
                      onHover={setHoveredId}
                      onLeave={() => setHoveredId(null)}
                    />
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </div>

          <div className="hidden lg:block sticky top-6 h-[600px] max-h-[calc(100vh-3rem)]">
            <MapErrorBoundary resetKey={mapCenter ? `${mapCenter.lat}:${mapCenter.lon}` : "none"}>
              <PlacesMap
                center={mapCenter}
                places={filteredPlaces}
                activeId={hoveredId}
                onMarkerHover={setHoveredId}
              />
            </MapErrorBoundary>
          </div>
        </div>
      </div>

      <Footer onNavigate={onNavigate} />
    </div>
  )
}