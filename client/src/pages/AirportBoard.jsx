import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import ArrivalsDeparturesTable from "@/components/airport-board/ArrivalsDeparturesTable"
import { fetchAirportBoard } from "@/api/flightApi"

const CONTAINER = "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"

export default function AirportBoard({ query, onSearch, onBack, onNavigate, onSelectFlight }) {
  const { t } = useTranslation()
  const [tab, setTab] = useState("arrivals")
  const [board, setBoard] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

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
      .catch(() => {
        if (!cancelled) setError(t("airportBoard.error_generic"))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [query, t])

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900">
      <Navbar onSearch={onSearch} onNavigate={onNavigate} />

      <div className={`flex-1 pt-28 pb-16 ${CONTAINER}`}>
        <button type="button" onClick={onBack} className="text-sm text-cyan-600 underline mb-4">
          ← {t("common.back_to_search")}
        </button>

        <h1 className="text-2xl font-semibold tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
          {board?.airportName || query?.query || t("airportBoard.default_title")}
          {board?.airportCode ? ` (${board.airportCode})` : ""}
        </h1>
        {board?.city && <p className="mt-1 text-slate-500 text-sm">{board.city}</p>}

        <div className="mt-6 flex gap-2">
          {[
            { key: "arrivals", label: t("airportBoard.arrivals") },
            { key: "departures", label: t("airportBoard.departures") },
          ].map((tItem) => (
            <button
              key={tItem.key}
              type="button"
              onClick={() => setTab(tItem.key)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                tab === tItem.key ? "bg-cyan-500 text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
              }`}
            >
              {tItem.label}
            </button>
          ))}
        </div>

        <div className="mt-4">
          {loading && (
            <div className="text-center text-slate-400 py-10 animate-pulse">
              {t("airportBoard.loading")}
            </div>
          )}

          {!loading && error && (
            <div className="text-center text-red-500 bg-red-50 border border-red-100 rounded-xl py-4 px-4 text-sm">
              {error}
            </div>
          )}

          {!loading && !error && board && (
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