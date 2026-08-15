import { useState, useEffect, useCallback, useRef } from "react"
import { ArrowLeft } from "lucide-react"
import PlaceCard from "@/components/places/PlaceCard"
import Footer from "@/components/Footer"
import { fetchExplorePlaces } from "@/api/exploreApi"

const CATEGORY_LABELS = { hotels: "Hotels", nature: "Nature", attractions: "Attractions" }
const NAV_CONTAINER = "w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"

export default function ExplorePlacesPage({ origin, originCode, originLat, originLon, destinations = [], onNavigate }) {
  const tabs = [
    { code: originCode, city: origin, country: null, lat: originLat, lon: originLon, isOrigin: true },
    ...destinations,
  ].filter((t) => t.code)

  const [activeCode, setActiveCode] = useState(tabs[0]?.code)
  const [dataByCode, setDataByCode] = useState({})
  const [loadingCode, setLoadingCode] = useState(null)
  const [errorByCode, setErrorByCode] = useState({})
  const fetchedRef = useRef(new Set())

  const activeTab = tabs.find((t) => t.code === activeCode)

  const loadTab = useCallback(async (tab) => {
    if (!tab || fetchedRef.current.has(tab.code) || tab.lat == null || tab.lon == null) return
    fetchedRef.current.add(tab.code)
    setLoadingCode(tab.code)
    try {
      const res = await fetchExplorePlaces([
        { code: tab.code, city: tab.city, country: tab.country, lat: tab.lat, lon: tab.lon },
      ])
      if (res.error) {
        setErrorByCode((prev) => ({ ...prev, [tab.code]: res.error }))
      } else {
        setDataByCode((prev) => ({ ...prev, [tab.code]: res.locations?.[0]?.places || {} }))
      }
    } catch (err) {
      setErrorByCode((prev) => ({ ...prev, [tab.code]: err.message }))
    } finally {
      setLoadingCode(null)
    }
  }, [])

  useEffect(() => { loadTab(activeTab) }, [activeTab, loadTab])

  const places = dataByCode[activeCode]
  const isLoading = loadingCode === activeCode
  const error = errorByCode[activeCode]
  const missingCoords = activeTab && activeTab.lat == null
  
  return (
    <div
  className="min-h-screen w-full min-w-0 flex flex-col"
  style={{ background: "var(--nuvex-bg, #FFFFFF)" }}
>
      <div className={`w-full min-w-0 pt-6 ${NAV_CONTAINER}`}>
        <button
          onClick={() => onNavigate?.("explore")}
          className="flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-full border mb-5"
          style={{ borderColor: "var(--nuvex-border, #E4E7EC)", color: "var(--nuvex-slate, #64707D)" }}
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Explore
        </button>

        <h1 className="text-xl font-semibold mb-4" style={{ color: "var(--nuvex-ink, #10131A)" }}>
          Places worth seeing
        </h1>

        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 min-w-0 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {tabs.map((tab) => (
            <button
              key={tab.code}
              onClick={() => setActiveCode(tab.code)}
              className="shrink-0 text-xs font-medium px-3.5 py-1.5 rounded-full whitespace-nowrap"
              style={
                activeCode === tab.code
                  ? { background: "var(--nuvex-accent, #17B8C4)", color: "#FFF" }
                  : { background: "var(--nuvex-border, #E4E7EC)", color: "var(--nuvex-slate, #64707D)" }
              }
            >
              {tab.isOrigin ? `${tab.city} (from here)` : tab.city}
            </button>
          ))}
        </div>

        {missingCoords && (
          <div className="text-sm text-center py-10" style={{ color: "var(--nuvex-slate, #64707D)" }}>
            No location data for {activeTab?.city} yet.
          </div>
        )}

        {!missingCoords && isLoading && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-64 rounded-2xl animate-pulse" style={{ background: "#E4E7EC" }} />
            ))}
          </div>
        )}

        {!missingCoords && !isLoading && error && (
          <div className="text-center text-red-500 bg-red-50 border border-red-100 rounded-xl py-6 px-4 text-sm">{error}</div>
        )}

        {!missingCoords && !isLoading && !error && places && (
          <div className="flex flex-col gap-8">
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => {
              const items = places[key] || []
              if (items.length === 0) return null
              return (
                <section key={key} className="min-w-0">
                  <h2 className="text-sm font-semibold mb-3" style={{ color: "var(--nuvex-ink, #10131A)" }}>{label}</h2>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {items.map((place) => (
                      <PlaceCard key={place.id} place={place} isActive={false} onHover={() => {}} onLeave={() => {}} />
                    ))}
                  </div>
                </section>
              )
            })}
          </div>
        )}
      </div>

      <Footer onNavigate={onNavigate} />
    </div>
  )
}