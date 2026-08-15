import { useState, useEffect, useCallback, useRef, useMemo } from "react"
import { MapPin, Search, X, LocateFixed } from "lucide-react"
import Footer from "@/components/Footer"
import ExploreHero from "@/components/explore/ExploreHero"
import ExploreLoadingState from "@/components/explore/ExploreLoadingState"
import ExploreFlightsSection from "@/components/explore/ExploreFlightsSection"
import ExplorePlacesSection from "@/components/explore/ExplorePlacesSection"
import { useGeolocation } from "@/hooks/useGeolocation"
import { fetchExplore } from "@/api/exploreApi"

const NAV_CONTAINER = "w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
const CURRENCY = "INR"

export default function Explore({ onSearch, onNavigate }) {
  const { location: geoLocation, loading: geoLoading } = useGeolocation()

  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [flightsExpanded, setFlightsExpanded] = useState(false)

  // Manual city override — when set, geolocation is ignored entirely.
  // null means "use geolocation" (the original behavior).
  const [manualCity, setManualCity] = useState(null)
  const [cityInput, setCityInput] = useState("")

  const lastKeyRef = useRef(null)

  const runFetch = useCallback(async (location) => {
    setLoading(true)
    setError(null)
    setResult(null) // clear stale destinations immediately so the loading
                     // screen shows instead of the previous origin's cards
                     // flashing on screen while the new fetch is in flight
    try {
      const data = await fetchExplore(location, { currency: CURRENCY })
      if (data.error) {
        setError(data.error)
        setResult(null)
      } else {
        setResult(data)
      }
    } catch (err) {
      setError(err.message)
      setResult(null)
    } finally {
      setLoading(false)
    }
  }, [])

  // Geolocation-driven fetch — a no-op whenever a manual city is active, so
  // it never clobbers the user's explicit choice.
  useEffect(() => {
    if (manualCity) return
    if (!geoLocation || geoLoading) return
    const key = `geo:${geoLocation.lat}:${geoLocation.lon}`
    if (lastKeyRef.current === key) return
    lastKeyRef.current = key
    runFetch({ lat: geoLocation.lat, lon: geoLocation.lon })
  }, [geoLocation, geoLoading, manualCity, runFetch])

  const handleCitySubmit = (e) => {
    e.preventDefault()
    const city = cityInput.trim()
    if (!city) return
    setManualCity(city)
    lastKeyRef.current = `city:${city}`
    runFetch({ originCity: city })
  }

  const handleUseMyLocation = () => {
    setManualCity(null)
    setCityInput("")
    lastKeyRef.current = null // lets the geolocation effect above refire
  }

  const handleSelect = (destination) => {
    if (!result?.originCode) return
    onSearch?.({ type: "route", origin: result.originCode, destination: destination.code })
  }

  const isInitialLoading = geoLoading || (loading && !result)
  const destinations = result?.destinations || []
  
  // Origin coords for "Worth seeing nearby" — always prefer what /api/explore
  // resolved (correct for geolocation, typed city, AND the raw originCode
  // bypass — which returns null lat/lon by design, so this falls through to
  // geoLocation in that one case). Prevents the strip from silently showing
  // places around the user's real GPS position while flights are priced from
  // a city they typed in instead.
const placesLocation = useMemo(() => {
    if (result?.originLat != null && result?.originLon != null) {
      return { lat: result.originLat, lon: result.originLon }
   }
   return geoLocation
 }, [result?.originLat, result?.originLon, geoLocation])

  return (
    <div
        className="min-h-screen w-full min-w-0 flex flex-col"
        style={{ background: "var(--nuvex-bg, #FFFFFF)" }}
        >
      <div className={`w-full min-w-0 pt-6 ${NAV_CONTAINER}`}>
        {!flightsExpanded && <ExploreHero originLabel={result?.originLabel} originCode={result?.originCode} />}

        {!flightsExpanded && (
          <div className="mb-6 min-w-0">
            <form onSubmit={handleCitySubmit} className="relative">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                style={{ color: "var(--nuvex-slate, #64707D)" }}
              />
              <input
                value={cityInput}
                onChange={(e) => setCityInput(e.target.value)}
                placeholder={manualCity ? manualCity : "Flying from somewhere else? Search a city..."}
                className="w-full text-sm rounded-full border pl-11 pr-28 py-3.5 outline-none transition-colors"
                style={{
                  borderColor: "var(--nuvex-border, #E4E7EC)",
                  color: "var(--nuvex-ink, #10131A)",
                  background: "#FFFFFF",
                }}
                onFocus={(e) => (e.target.style.borderColor = "var(--nuvex-accent, #17B8C4)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--nuvex-border, #E4E7EC)")}
              />

              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                {cityInput && (
                  <button
                    type="button"
                    onClick={() => setCityInput("")}
                    className="p-1.5 rounded-full"
                    aria-label="Clear"
                  >
                    <X className="w-3.5 h-3.5" style={{ color: "var(--nuvex-slate, #64707D)" }} />
                  </button>
                )}
                {manualCity && (
                  <button
                    type="button"
                    onClick={handleUseMyLocation}
                    className="p-1.5 rounded-full"
                    title="Use my location instead"
                    aria-label="Use my location instead"
                  >
                    <LocateFixed className="w-3.5 h-3.5" style={{ color: "var(--nuvex-slate, #64707D)" }} />
                  </button>
                )}
                <button
                  type="submit"
                  disabled={!cityInput.trim()}
                  className="text-xs font-medium px-3.5 py-1.5 rounded-full disabled:opacity-40"
                  style={{ background: "var(--nuvex-accent, #17B8C4)", color: "#FFF" }}
                >
                  Go
                </button>
              </div>
            </form>

            {manualCity && (
              <div className="flex items-center gap-1 mt-2 ml-1 text-xs" style={{ color: "var(--nuvex-slate, #64707D)" }}>
                <MapPin className="w-3 h-3" />
                <span>Flying from {manualCity}</span>
              </div>
            )}
          </div>
        )}

        {isInitialLoading && <ExploreLoadingState />}

        {!isInitialLoading && error && (
          <div className="text-center text-red-500 bg-red-50 border border-red-100 rounded-xl py-6 px-4 text-sm mb-8">{error}</div>
        )}

        {!isInitialLoading && !error && destinations.length > 0 && (
          <ExploreFlightsSection
            destinations={destinations}
            currency={CURRENCY}
            onSelect={handleSelect}
            expanded={flightsExpanded}
            onExpandedChange={setFlightsExpanded}
          />
        )}

        {!flightsExpanded && (
          <ExplorePlacesSection
            geoLocation={placesLocation}
            onViewAll={() =>
              onNavigate?.("explore-places", {
                origin: result?.originLabel,
                originCode: result?.originCode,
                originLat: placesLocation?.lat,
                originLon: placesLocation?.lon,
                destinations,
              })
            }
          />
        )}
      </div>

      <Footer onNavigate={onNavigate} />
    </div>
  )
} 