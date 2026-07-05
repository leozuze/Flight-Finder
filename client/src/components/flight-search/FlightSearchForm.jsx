import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeftRight, Search, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import AirportAutocomplete from "@/components/AirportAutocomplete"

const currencies = ["GBP", "USD", "EUR", "INR", "AUD", "CAD"]

export default function FlightSearchForm({
  origin, setOrigin,
  destination, setDestination,
  tripType, setTripType,
  budget, setBudget,
  currency, setCurrency,
  email, setEmail,
  advancedOpen, setAdvancedOpen,
  adults, setAdults,
  travelClass, setTravelClass,
  loading,
  onSubmit,
  onSwap,
}) {
  return (
    <form
      onSubmit={onSubmit}
      className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 sm:p-8 space-y-5"
    >
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

      <div className="flex flex-col sm:flex-row items-stretch gap-3">
        <div className="flex-1">
          <label className="text-xs font-semibold text-slate-400 tracking-wide">ORIGIN</label>
          <AirportAutocomplete
            value={origin}
            onChange={setOrigin}
            onSelect={(airport) => setOrigin(`${airport.city || airport.name} (${airport.iata})`)}
            placeholder="e.g. KJFK or New York"
            className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-cyan-500 transition-colors"
          />
        </div>

        <button
          type="button"
          onClick={onSwap}
          className="self-center sm:self-end mb-0 sm:mb-0.5 shrink-0 w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center hover:bg-slate-200 transition-colors"
          aria-label="Swap origin and destination"
        >
          <ArrowLeftRight className="w-4 h-4 text-slate-500" />
        </button>

        <div className="flex-1">
          <label className="text-xs font-semibold text-slate-400 tracking-wide">DESTINATION</label>
          <AirportAutocomplete
            value={destination}
            onChange={setDestination}
            onSelect={(airport) => setDestination(`${airport.city || airport.name} (${airport.iata})`)}
            placeholder="e.g. KLAX or Los Angeles"
            className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-cyan-500 transition-colors"
          />
        </div>
      </div>

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
  )
}