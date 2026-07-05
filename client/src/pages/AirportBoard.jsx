import { useState, useEffect } from "react"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import ArrivalsDeparturesTable from "@/components/airport-board/ArrivalsDeparturesTable"
import { fetchAirportBoard } from "@/api/flightApi"

const CONTAINER = "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"

export default function AirportBoard({ query, onSearch, onBack, onNavigate, onSelectFlight }) {
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
        if (!cancelled) setError("Something went wrong reaching the airport service. Please try again.")
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [query])

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900">
      <Navbar onSearch={onSearch} onNavigate={onNavigate} />

      <div className={`flex-1 pt-28 pb-16 ${CONTAINER}`}>
        <button type="button" onClick={onBack} className="text-sm text-cyan-600 underline mb-4">
          ← Back to search
        </button>

        <h1 className="text-2xl font-semibold tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
          {board?.airportName || query?.query || "Airport"}
          {board?.airportCode ? ` (${board.airportCode})` : ""}
        </h1>
        {board?.city && <p className="mt-1 text-slate-500 text-sm">{board.city}</p>}

        <div className="mt-6 flex gap-2">
          {[
            { key: "arrivals", label: "Arrivals" },
            { key: "departures", label: "Departures" },
          ].map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                tab === t.key ? "bg-cyan-500 text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="mt-4">
          {loading && (
            <div className="text-center text-slate-400 py-10 animate-pulse">
              Loading the flight board...
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