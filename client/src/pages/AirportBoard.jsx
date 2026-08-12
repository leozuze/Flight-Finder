import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import ArrivalsDeparturesTable from "@/components/airport-board/ArrivalsDeparturesTable"
import SearchProgressSteps from "@/components/flight-search/SearchProgressSteps"
import { useDelayedLoading } from "@/hooks/useDelayedLoading"
import { fetchAirportBoard } from "@/api/flightApi"

const CONTAINER = "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"

const NUVEX_THEME = {
  "--nuvex-bg": "#FFFFFF",
  "--nuvex-border": "#E4E7EC",
  "--nuvex-ink": "#10131A",
  "--nuvex-slate": "#64707D",
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

export default function AirportBoard({ query, onSearch, onBack, onNavigate, onSelectFlight }) {
  useNuvexFonts()
  const { t } = useTranslation()
  const [tab, setTab] = useState("arrivals")
  const [board, setBoard] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const showLoading = useDelayedLoading(loading)

  // Fetch effect — unchanged.
  useEffect(() => {
    if (!query?.query) return
    let cancelled = false

    setLoading(true)
    setError(null)
    setBoard(null)

    fetchAirportBoard(query.query)
      .then((data) => {
        if (cancelled) return
        if (data.error) setError(data.error)
        else setBoard(data)
      })
      .catch((err) => {
        if (cancelled) return
        console.error("[Nuvex] airport board fetch failed:", err)
        setError(t("airportBoard.error_generic"))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [query, t])

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ ...NUVEX_THEME, background: "var(--nuvex-bg)", color: "var(--nuvex-ink)", fontFamily: "var(--nuvex-body)" }}
    >
      {/* PERF/UX: search bar moved into its own mt-6 wrapper, same as
          Home.jsx, instead of sharing the pt-28 block with page content.
          Purely layout — onSearch wiring and everything below is
          untouched. */}
      <div className={`mt-6 ${CONTAINER}`}>
        <Navbar onSearch={onSearch} />
      </div>

      <div className={`flex-1 pt-10 pb-16 ${CONTAINER}`}>
        <button
          type="button"
          onClick={onBack}
          className="text-sm underline mb-4"
          style={{ color: "var(--nuvex-accent)" }}
        >
          ← {t("common.back_to_search")}
        </button>

        <h1 className="text-2xl font-semibold tracking-tight" style={{ fontFamily: "var(--nuvex-display)", color: "var(--nuvex-ink)" }}>
          {board?.airportName || query?.query || t("airportBoard.default_title")}
          {board?.airportCode ? ` (${board.airportCode})` : ""}
        </h1>
        {board?.city && (
          <p className="mt-1 text-sm" style={{ color: "var(--nuvex-slate)" }}>
            {board.city}
          </p>
        )}

        <div className="mt-6 flex gap-2">
          {[
            { key: "arrivals", label: t("airportBoard.arrivals") },
            { key: "departures", label: t("airportBoard.departures") },
          ].map((tItem) => {
            const active = tab === tItem.key
            return (
              <button
                key={tItem.key}
                type="button"
                onClick={() => setTab(tItem.key)}
                className="px-4 py-1.5 rounded-full text-sm font-medium transition-colors"
                style={
                  active
                    ? { background: "var(--nuvex-accent)", color: "#FFFFFF" }
                    : { background: "var(--nuvex-border)", color: "var(--nuvex-slate)" }
                }
              >
                {tItem.label}
              </button>
            )
          })}
        </div>

        <div className="mt-4">
          {showLoading && <SearchProgressSteps active={loading} variant="airport" />}

          {!showLoading && error && (
            <div className="text-center text-red-500 bg-red-50 border border-red-100 rounded-xl py-4 px-4 text-sm">
              {error}
            </div>
          )}

          {!showLoading && !error && board && (
            <ArrivalsDeparturesTable
              flights={tab === "arrivals" ? board.arrivals : board.departures}
              mode={tab}
              onSelectFlight={onSelectFlight}
            />
          )}
        </div>
      </div>

      <Footer onNavigate={onNavigate} />
    </div>
  )
}