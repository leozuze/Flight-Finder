import { useState, useMemo, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeftRight, Search, ChevronDown, Play, SlidersHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Range, getTrackBackground } from "react-range"

const currencies = ["GBP", "USD", "EUR", "INR", "AUD", "CAD"]

function formatDateTime(value) {
  if (!value || value === "N/A") return ""
  const d = new Date(value.replace(" ", "T"))
  if (isNaN(d.getTime())) return value
  return d.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

function toDate(value) {
  if (!value || value === "N/A") return null
  const d = new Date(value.replace(" ", "T"))
  return isNaN(d.getTime()) ? null : d
}

function getMinutesOfDay(value) {
  const d = toDate(value)
  if (!d) return null
  return d.getHours() * 60 + d.getMinutes()
}

function formatMinutesLabel(min) {
  if (min == null) return ""
  const h24 = Math.floor(min / 60)
  const m = min % 60
  const period = h24 >= 12 ? "pm" : "am"
  let h12 = h24 % 12
  if (h12 === 0) h12 = 12
  return `${h12}${m ? ":" + String(m).padStart(2, "0") : ""}${period}`
}

function getDurationMinutes(departValue, arriveValue) {
  const dep = toDate(departValue)
  const arr = toDate(arriveValue)
  if (!dep || !arr) return null
  const diff = Math.round((arr - dep) / 60000)
  return diff >= 0 ? diff : null
}

function formatDurationLabel(min) {
  if (min == null) return ""
  const h = Math.floor(min / 60)
  const m = min % 60
  return `${h}h ${m}m`
}

function getDepartDateLabel(value) {
  const d = toDate(value)
  if (!d) return "Unknown"
  const today = new Date()
  const tomorrow = new Date()
  tomorrow.setDate(today.getDate() + 1)
  const sameDay = (a, b) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
  if (sameDay(d, today)) return "Today"
  if (sameDay(d, tomorrow)) return "Tomorrow"
  return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })
}

export default function FlightSearchSection({ externalQuery }) {
  const [origin, setOrigin] = useState("")
  const [destination, setDestination] = useState("")
  const [tripType, setTripType] = useState("round")
  const [budget, setBudget] = useState("")
  const [currency, setCurrency] = useState("GBP")
  const [email, setEmail] = useState("")
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const [adults, setAdults] = useState(1)
  const [travelClass, setTravelClass] = useState("economy")

  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState(null)
  const [error, setError] = useState(null)

  const [status, setStatus] = useState(null)
  const [statusLoading, setStatusLoading] = useState(false)

  const [quickResults, setQuickResults] = useState(null)
  const [quickLoading, setQuickLoading] = useState(false)
  const [quickError, setQuickError] = useState(null)

  const swap = () => {
    setOrigin(destination)
    setDestination(origin)
  }

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!origin || !destination || !budget || !email) return

    setLoading(true)
    setResults(null)
    setError(null)
    setStatus(null)
    setQuickResults(null)

    try {
      const res = await fetch("http://localhost:8000/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          origin,
          destination,
          tripType,
          budget: Number(budget),
          currency,
          email,
          adults: Number(adults),
          travelClass,
        }),
      })
      const data = await res.json()

      if (data.error) {
        setError(data.error)
      } else {
        setResults(data)
      }
    } catch (err) {
      setError("Something went wrong reaching the search service. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const checkStatus = async (flightNumber, date) => {
    if (!flightNumber || !date) return
    setStatusLoading(true)
    try {
      const res = await fetch("http://localhost:8000/api/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ flightNumber, date }),
      })
      const data = await res.json()
      setStatus(data.status || "Unavailable")
    } catch {
      setStatus("Unavailable")
    } finally {
      setStatusLoading(false)
    }
  }

  useEffect(() => {
    if (!externalQuery) return
    setOrigin(externalQuery.origin)
    setDestination(externalQuery.destination)
    runQuickSearch(externalQuery.origin, externalQuery.destination)
  }, [externalQuery])

  const runQuickSearch = async (o, d) => {
    setQuickLoading(true)
    setQuickResults(null)
    setQuickError(null)
    setResults(null)
    setError(null)
    try {
      const res = await fetch("http://localhost:8000/api/flights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ origin: o, destination: d }),
      })
      const data = await res.json()
      if (data.error) {
        setQuickError(data.error)
      } else {
        setQuickResults(data)
      }
    } catch {
      setQuickError("Something went wrong reaching the search service. Please try again.")
    } finally {
      setQuickLoading(false)
    }
  }

  return (
    <section id="search" className="py-20">
      {/* Search card */}
      <form
        onSubmit={handleSearch}
        className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 sm:p-8 space-y-5"
      >
        {/* Trip type toggle */}
        <div className="flex gap-2">
          {[
            { key: "round", label: "Round Trip" },
            { key: "oneway", label: "One Way" },
          ].map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTripType(t.key)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                tripType === t.key
                  ? "bg-cyan-500 text-white"
                  : "bg-slate-100 text-slate-500 hover:bg-slate-200"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Origin / swap / destination */}
        <div className="flex flex-col sm:flex-row items-stretch gap-3">
          <div className="flex-1">
            <label className="text-xs font-semibold text-slate-400 tracking-wide">ORIGIN</label>
            <input
              type="text"
              placeholder="e.g. KJFK or New York"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          <button
            type="button"
            onClick={swap}
            className="self-center sm:self-end mb-0 sm:mb-0.5 shrink-0 w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center hover:bg-slate-200 transition-colors"
            aria-label="Swap origin and destination"
          >
            <ArrowLeftRight className="w-4 h-4 text-slate-500" />
          </button>

          <div className="flex-1">
            <label className="text-xs font-semibold text-slate-400 tracking-wide">DESTINATION</label>
            <input
              type="text"
              placeholder="e.g. KLAX or Los Angeles"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-cyan-500 transition-colors"
            />
          </div>
        </div>

        {/* Budget + Email */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <label className="text-xs font-semibold text-slate-400 tracking-wide">BUDGET</label>
            <div className="flex mt-1 rounded-lg border border-slate-200 overflow-hidden">
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="bg-slate-100 text-sm px-2 outline-none border-r border-slate-200"
              >
                {currencies.map((c) => (
                  <option key={c} value={c} style={{ color: "#000" }}>{c}</option>
                ))}
              </select>
              <input
                type="number"
                min="1"
                placeholder="Max price"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="flex-1 bg-slate-50 px-3 py-2.5 text-sm outline-none"
              />
            </div>
          </div>

          <div className="flex-1">
            <label className="text-xs font-semibold text-slate-400 tracking-wide">EMAIL</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-cyan-500 transition-colors"
            />
          </div>
        </div>

        {/* Advanced options */}
        <div>
          <button
            type="button"
            onClick={() => setAdvancedOpen(!advancedOpen)}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors"
          >
            Advanced options
            <ChevronDown
              className="w-3.5 h-3.5 transition-transform duration-200"
              style={{ transform: advancedOpen ? "rotate(180deg)" : "rotate(0deg)" }}
            />
          </button>

          <AnimatePresence>
            {advancedOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-400 tracking-wide">ADULTS</label>
                    <input
                      type="number"
                      min="1"
                      value={adults}
                      onChange={(e) => setAdults(e.target.value)}
                      className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-400 tracking-wide">CABIN CLASS</label>
                    <select
                      value={travelClass}
                      onChange={(e) => setTravelClass(e.target.value)}
                      className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none"
                    >
                      <option value="economy" style={{ color: "#000" }}>Economy</option>
                      <option value="premium" style={{ color: "#000" }}>Premium Economy</option>
                      <option value="business" style={{ color: "#000" }}>Business</option>
                      <option value="first" style={{ color: "#000" }}>First</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-cyan-500 hover:bg-cyan-600 text-white rounded-full py-6 text-base font-medium gap-2"
        >
          <Search className="w-4 h-4" />
          {loading ? "Searching..." : "Search Flights"}
        </Button>
      </form>

      {/* Results */}
<div className="mt-8">
        {quickLoading && (
          <div className="text-center text-slate-400 py-10 animate-pulse">
            Scanning routes for the cheapest fares...
          </div>
        )}

        {!quickLoading && quickError && (
          <div className="text-center text-red-500 bg-red-50 border border-red-100 rounded-xl py-4 px-4 text-sm">
            {quickError}
          </div>
        )}

        {!quickLoading && quickResults?.flights?.length > 0 && (
          <OtherFlightsSection
            flights={quickResults.flights}
            origin={origin}
            destination={destination}
            originCode={quickResults.originCode}
            destinationCode={quickResults.destinationCode}
            title="Flight Results"
          />
        )}

        {!quickResults && !quickLoading && (
          <>
            {loading && (
              <div className="text-center text-slate-400 py-10 animate-pulse">
                Scanning routes for the cheapest fares...
              </div>
            )}

            {!loading && error && (
              <div className="text-center text-red-500 bg-red-50 border border-red-100 rounded-xl py-4 px-4 text-sm">
                {error}
              </div>
            )}

            {!loading && results?.bestDeal && (
              <FlightResultsTable
                flight={results.bestDeal}
                origin={origin}
                destination={destination}
                status={status}
                statusLoading={statusLoading}
                onCheckStatus={checkStatus}
              />
            )}

            {!loading && results?.otherFlights?.length > 0 && (
              <div className="mt-6">
                <OtherFlightsSection
                  flights={results.otherFlights}
                  origin={origin}
                  destination={destination}
                  originCode={results.bestDeal.originCode}
                  destinationCode={results.bestDeal.destinationCode}
                />
              </div>
            )}
          </> 
        )}
      </div>
    </section>
  )
}

function FlightResultsTable({ flight, origin, destination, status, statusLoading, onCheckStatus }) {
  const originLabel = flight.originCode
    ? `(${flight.originCode}) ${origin}`
    : origin

  const destinationLabel = flight.destinationCode
    ? `(${flight.destinationCode}) ${destination}`
    : destination

  return (
    <div className="border border-cyan-500 rounded-lg overflow-hidden">
      <div className="bg-cyan-600 text-white px-4 py-3 font-semibold text-base flex items-center gap-2 flex-wrap">
        <span>Cheapest Flight Results: {originLabel}</span>
        <Play className="w-4 h-4 shrink-0" fill="currentColor" />
        <span>{destinationLabel}</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-orange-500 border-b border-slate-200">
              <th className="px-4 py-2.5 font-medium">Airline</th>
              <th className="px-4 py-2.5 font-medium">Ident</th>
              <th className="px-4 py-2.5 font-medium">Aircraft</th>
              <th className="px-4 py-2.5 font-medium">Connections</th>
              <th className="px-4 py-2.5 font-medium">Status</th>
              <th className="px-4 py-2.5 font-medium">Departure</th>
              <th className="px-4 py-2.5 font-medium">Arrival</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-slate-100">
              <td className="px-4 py-3 text-slate-700">
                <div className="flex items-center gap-2">
                  {flight.airlineLogo && (
                    <img src={flight.airlineLogo} alt={flight.airline || "airline logo"} className="w-5 h-5 object-contain" />
                  )}
                  <span>{flight.airline || ""}</span>
                </div>
              </td>
              <td className="px-4 py-3 text-cyan-600 underline">{flight.flightNumber || ""}</td>
              <td className="px-4 py-3 text-slate-700">{flight.aircraft || ""}</td>
              <td className="px-4 py-3 text-slate-700">
                {flight.stops === 0
                  ? "Direct"
                  : `${flight.stops} stop${flight.stops > 1 ? "s" : ""}${
                      flight.stopAirports?.length ? ` via ${flight.stopAirports.join(", ")}` : ""
                    }`}
              </td>
              <td className="px-4 py-3 text-slate-700">
                {status ? (
                  <span>{status}</span>
                ) : (
                  <button
                    type="button"
                    onClick={() => onCheckStatus(flight.flightNumber, flight.departDate)}
                    disabled={statusLoading || !flight.flightNumber}
                    className="text-cyan-600 underline text-xs disabled:text-slate-300 disabled:no-underline"
                  >
                    {statusLoading ? "Checking..." : "Check status"}
                  </button>
                )}
              </td>
              <td className="px-4 py-3 text-slate-700">{formatDateTime(flight.departDate)}</td>
              <td className="px-4 py-3 text-slate-700">{formatDateTime(flight.returnDate)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-end text-sm">
        <span className="text-lg font-bold text-cyan-600">
          {flight.currency} {flight.price}
        </span>
      </div>
    </div>
  )
}

/* ---------- Filter panel + Other Flights ---------- */

function OtherFlightsSection({ flights, origin, destination, originCode, destinationCode, title = "Other Flights" }) {
  const [panelOpen, setPanelOpen] = useState(true)

  const meta = useMemo(() => {
    const airlines = new Set()
    const aircraft = new Set()
    const connections = new Set()
    const departLabels = new Set()
    let minDepartMin = 1440, maxDepartMin = 0
    let minDuration = Infinity, maxDuration = 0

    flights.forEach((f) => {
      if (f.airline) airlines.add(f.airline)
      if (f.aircraft) aircraft.add(f.aircraft)
      ;(f.stopAirports || []).forEach((a) => connections.add(a))
      if (f.stops === 0) connections.add("Direct")
      departLabels.add(getDepartDateLabel(f.departDate))

      const dMin = getMinutesOfDay(f.departDate)
      const dur = getDurationMinutes(f.departDate, f.returnDate)

      if (dMin != null) {
        minDepartMin = Math.min(minDepartMin, dMin)
        maxDepartMin = Math.max(maxDepartMin, dMin)
      }
      if (dur != null) {
        minDuration = Math.min(minDuration, dur)
        maxDuration = Math.max(maxDuration, dur)
      }
    })

    if (minDuration === Infinity) { minDuration = 0; maxDuration = 60 }

    return {
      airlines: Array.from(airlines).sort(),
      aircraft: Array.from(aircraft).sort(),
      connections: Array.from(connections).sort(),
      departLabels: Array.from(departLabels),
      durationRange: [minDuration, maxDuration],
    }
  }, [flights])

  const [selectedAirlines, setSelectedAirlines] = useState([])
  const [selectedAircraft, setSelectedAircraft] = useState([])
  const [selectedConnections, setSelectedConnections] = useState([])
  const [selectedDepart, setSelectedDepart] = useState([])
  const [departTime, setDepartTime] = useState([0, 1439])
  const [arriveTime, setArriveTime] = useState([0, 1439])
  const [duration, setDuration] = useState([0, 1439])

  // Reset filters to "all selected" whenever a new search loads
  useEffect(() => {
    setSelectedAirlines(meta.airlines)
    setSelectedAircraft(meta.aircraft)
    setSelectedConnections(meta.connections)
    setSelectedDepart(meta.departLabels)
    setDepartTime([0, 1439])
    setArriveTime([0, 1439])
    setDuration(meta.durationRange)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flights])

  const filteredFlights = useMemo(() => {
    return flights.filter((f) => {
      if (f.airline && !selectedAirlines.includes(f.airline)) return false
      if (f.aircraft && !selectedAircraft.includes(f.aircraft)) return false

      const flightConnections = f.stops === 0 ? ["Direct"] : (f.stopAirports || [])
      if (flightConnections.length && !flightConnections.some((c) => selectedConnections.includes(c))) return false

      const departLabel = getDepartDateLabel(f.departDate)
      if (!selectedDepart.includes(departLabel)) return false

      const dMin = getMinutesOfDay(f.departDate)
      if (dMin != null && (dMin < departTime[0] || dMin > departTime[1])) return false

      const aMin = getMinutesOfDay(f.returnDate)
      if (aMin != null && (aMin < arriveTime[0] || aMin > arriveTime[1])) return false

      const dur = getDurationMinutes(f.departDate, f.returnDate)
      if (dur != null && (dur < duration[0] || dur > duration[1])) return false

      return true
    })
  }, [flights, selectedAirlines, selectedAircraft, selectedConnections, selectedDepart, departTime, arriveTime, duration])

  const filterProps = {
    meta,
    selectedAirlines, setSelectedAirlines,
    selectedAircraft, setSelectedAircraft,
    selectedConnections, setSelectedConnections,
    selectedDepart, setSelectedDepart,
    departTime, setDepartTime,
    arriveTime, setArriveTime,
    duration, setDuration,
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4 items-start">
      {/* Mobile / tablet: collapsible filter bar */}
      <div className="lg:hidden">
        <button
          type="button"
          onClick={() => setPanelOpen(!panelOpen)}
          className="w-full flex items-center justify-between bg-cyan-50 border border-cyan-200 rounded-t-lg px-4 py-2.5 text-sm font-medium text-cyan-700"
        >
          <span className="flex items-center gap-2">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Filter Flights
          </span>
          <ChevronDown
            className="w-3.5 h-3.5 transition-transform duration-200"
            style={{ transform: panelOpen ? "rotate(180deg)" : "rotate(0deg)" }}
          />
        </button>

        <AnimatePresence initial={false}>
          {panelOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden border border-t-0 border-slate-200 rounded-b-lg"
            >
              <div className="p-4 bg-white">
                <FilterPanelContent {...filterProps} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Desktop: static sidebar */}
      <div className="hidden lg:block border border-slate-200 rounded-lg overflow-hidden">
        <div className="bg-slate-50 px-4 py-2.5 text-sm text-slate-500 border-b border-slate-200">
          Refine Flight Results
        </div>
        <div className="p-4">
          <FilterPanelContent {...filterProps} />
        </div>
      </div>

      <OtherFlightsTable
        flights={filteredFlights}
        totalCount={flights.length}
        origin={origin}
        destination={destination}
        originCode={originCode}
        destinationCode={destinationCode}
        title={title}
      />
    </div>
  )
}

function FilterPanelContent({
  meta,
  selectedAirlines, setSelectedAirlines,
  selectedAircraft, setSelectedAircraft,
  selectedConnections, setSelectedConnections,
  selectedDepart, setSelectedDepart,
  departTime, setDepartTime,
  arriveTime, setArriveTime,
  duration, setDuration,
}) {
  return (
    <div className="space-y-5">
      <CheckboxFilterGroup label="Airline" options={meta.airlines} selected={selectedAirlines} setSelected={setSelectedAirlines} />
      <CheckboxFilterGroup label="Depart" options={meta.departLabels} selected={selectedDepart} setSelected={setSelectedDepart} hideShowAll />
      <RangeFilterGroup label="Departure Time" min={0} max={1439} value={departTime} onChange={setDepartTime} formatLabel={formatMinutesLabel} />
      <RangeFilterGroup label="Arrival Time" min={0} max={1439} value={arriveTime} onChange={setArriveTime} formatLabel={formatMinutesLabel} />
      <RangeFilterGroup label="Duration" min={meta.durationRange[0]} max={meta.durationRange[1]} value={duration} onChange={setDuration} formatLabel={formatDurationLabel} />
      <CheckboxFilterGroup label="Connection" options={meta.connections} selected={selectedConnections} setSelected={setSelectedConnections} />
      <CheckboxFilterGroup label="Aircraft" options={meta.aircraft} selected={selectedAircraft} setSelected={setSelectedAircraft} />
    </div>
  )
}

function CheckboxFilterGroup({ label, options, selected, setSelected, hideShowAll }) {
  if (!options.length) return null
  const allSelected = selected.length === options.length

  const toggleOption = (opt) => {
    setSelected(selected.includes(opt) ? selected.filter((v) => v !== opt) : [...selected, opt])
  }

  return (
    <div>
      <div className="text-xs font-semibold text-orange-500 tracking-wide mb-2">{label}</div>
      <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
        {!hideShowAll && (
          <label className="flex items-center gap-2 text-sm text-slate-700 font-medium">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={() => setSelected(allSelected ? [] : options)}
              className="accent-cyan-500"
            />
            show all
          </label>
        )}
        {options.map((opt) => (
          <div key={opt} className="flex items-center justify-between gap-2">
            <label className="flex items-center gap-2 text-sm text-slate-700 min-w-0">
              <input
                type="checkbox"
                checked={selected.includes(opt)}
                onChange={() => toggleOption(opt)}
                className="accent-cyan-500 shrink-0"
              />
              <span className="truncate">{opt}</span>
            </label>
            <button
              type="button"
              onClick={() => setSelected([opt])}
              className="text-xs text-cyan-600 underline shrink-0"
            >
              only
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

function RangeFilterGroup({ label, min, max, value, onChange, formatLabel }) {
  if (min === max) return null

  // Clamp incoming values to the current min/max — protects against the
  // parent's state briefly being out of range during the first render
  // (e.g. before its useEffect has synced to the computed meta bounds).
  const clamped = [
    Math.min(Math.max(value[0], min), max),
    Math.min(Math.max(value[1], min), max),
  ]
  const safeValues = clamped[0] <= clamped[1] ? clamped : [min, max]

  return (
    <div>
      <div className="text-xs font-semibold text-orange-500 tracking-wide mb-1">{label}</div>
      <div className="text-sm text-slate-600 mb-3">
        {formatLabel(safeValues[0])} - {formatLabel(safeValues[1])}
      </div>
      <div className="px-1">
        <Range
          step={Math.max(1, Math.round((max - min) / 200))}
          min={min}
          max={max}
          values={safeValues}
          onChange={(vals) => onChange(vals)}
          renderTrack={({ props, children }) => (
            <div
              {...props}
              className="h-1.5 w-full rounded-full"
              style={{
                ...props.style,
                background: getTrackBackground({
                  values: safeValues,
                  colors: ["#e2e8f0", "#06b6d4", "#e2e8f0"],
                  min,
                  max,
                }),
              }}
            >
              {children}
            </div>
          )}
          renderThumb={({ props }) => (
            <div
              {...props}
              className="w-4 h-4 rounded-full bg-white border-2 border-cyan-500 shadow focus:outline-none focus:ring-2 focus:ring-cyan-300"
            />
          )}
        />
      </div>
    </div>
  )
}
function OtherFlightsTable({ flights, totalCount, origin, destination, originCode, destinationCode, title = "Other Flights" }) {
  const originLabel = originCode ? `(${originCode}) ${origin}` : origin
  const destinationLabel = destinationCode ? `(${destinationCode}) ${destination}` : destination

  return (
    <div className="border border-slate-300 rounded-lg overflow-hidden">
      <div className="bg-slate-700 text-white px-4 py-3 font-semibold text-base flex items-center gap-2 flex-wrap">
        <span>{title}: {originLabel}</span>
        <Play className="w-4 h-4 shrink-0" fill="currentColor" />
        <span>{destinationLabel}</span>
      </div>

      <div className="bg-slate-50 px-4 py-2.5 text-sm text-slate-600 border-b border-slate-200">
        Showing {flights.length} of {totalCount} flight{totalCount > 1 ? "s" : ""}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-orange-500 border-b border-slate-200">
              <th className="px-4 py-2.5 font-medium">Airline</th>
              <th className="px-4 py-2.5 font-medium">Ident</th>
              <th className="px-4 py-2.5 font-medium">Aircraft</th>
              <th className="px-4 py-2.5 font-medium">Connections</th>
              <th className="px-4 py-2.5 font-medium">Departure</th>
              <th className="px-4 py-2.5 font-medium">Arrival</th>
              <th className="px-4 py-2.5 font-medium text-right">Price</th>
            </tr>
          </thead>
          <tbody>
            {flights.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-slate-400">
                  No flights match the selected filters.
                </td>
              </tr>
            )}
            {flights.map((flight, i) => (
              <tr key={i} className="border-b border-slate-100">
                <td className="px-4 py-3 text-slate-700">
                  <div className="flex items-center gap-2">
                    {flight.airlineLogo && (
                      <img src={flight.airlineLogo} alt={flight.airline || "airline logo"} className="w-5 h-5 object-contain" />
                    )}
                    <span>{flight.airline || ""}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-cyan-600 underline">{flight.flightNumber || ""}</td>
                <td className="px-4 py-3 text-slate-700">{flight.aircraft || ""}</td>
                <td className="px-4 py-3 text-slate-700">
                  {flight.stops === 0
                    ? "Direct"
                    : `${flight.stops} stop${flight.stops > 1 ? "s" : ""}${
                        flight.stopAirports?.length ? ` via ${flight.stopAirports.join(", ")}` : ""
                      }`}
                </td>
                <td className="px-4 py-3 text-slate-700">{formatDateTime(flight.departDate)}</td>
                <td className="px-4 py-3 text-slate-700">{formatDateTime(flight.returnDate)}</td>
                <td className="px-4 py-3 text-right font-semibold text-slate-700">
                  {flight.currency} {flight.price}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}