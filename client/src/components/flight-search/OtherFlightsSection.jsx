import { useState, useMemo, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, SlidersHorizontal } from "lucide-react"
import FilterPanelContent from "./FilterPanelContent"
import OtherFlightsTable from "./OtherFlightsTable"
import { getMinutesOfDay, getDurationMinutes, getDepartDateLabel } from "@/utils/flightFormatters"

export default function OtherFlightsSection({ flights, origin, destination, originCode, destinationCode, title = "Other Flights" }) {
  const [panelOpen, setPanelOpen] = useState(true)

  const meta = useMemo(() => {
    const airlines = new Set()
    const aircraft = new Set()
    const connections = new Set()
    const departLabels = new Set()
    let minDuration = Infinity, maxDuration = 0

    flights.forEach((f) => {
      if (f.airline) airlines.add(f.airline)
      if (f.aircraft) aircraft.add(f.aircraft)
      ;(f.stopAirports || []).forEach((a) => connections.add(a))
      if (f.stops === 0) connections.add("Direct")
      departLabels.add(getDepartDateLabel(f.departDate))

      const dur = getDurationMinutes(f.departDate, f.returnDate)
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