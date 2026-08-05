import { useTranslation } from "react-i18next"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeftRight, Search, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import AirportAutocomplete from "@/components/AirportAutocomplete"

const currencies = ["GBP", "USD", "EUR", "INR", "AUD", "CAD"]

// Local-timezone-safe "today" string. Using new Date().toISOString() is
// wrong here — it converts to UTC, which can be a day ahead or behind the
// user's actual local calendar date depending on their timezone offset.
// <input type="date"> always works in local time, so this must match.
const todayISO = () => {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

export default function FlightSearchForm({
  origin, setOrigin,
  destination, setDestination,
  tripType, setTripType,
  departDate, setDepartDate,
  returnDate, setReturnDate,
  budget, setBudget,
  currency, setCurrency,
  advancedOpen, setAdvancedOpen,
  adults, setAdults,
  travelClass, setTravelClass,
  loading,
  onSubmit,
  onSwap,
}) {
  const { t } = useTranslation()

  const tripTypes = [
    { key: "round", label: t("searchForm.round_trip") },
    { key: "oneway", label: t("searchForm.one_way") },
  ]

  const handleDepartChange = (e) => {
    const raw = e.target.value
    const today = todayISO()
    const newDepart = raw && raw < today ? today : raw
    setDepartDate(newDepart)
    if (returnDate && newDepart && returnDate < newDepart) {
      setReturnDate("")
    }
  }

  const handleReturnChange = (e) => {
    const raw = e.target.value
    const floor = departDate || todayISO()
    const newReturn = raw && raw < floor ? floor : raw
    setReturnDate(newReturn)
  }

  return (
    <form
      onSubmit={onSubmit}
      className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 sm:p-8 space-y-5"
    >
      <div className="flex gap-2">
        {tripTypes.map((tt) => (
          <button
            key={tt.key}
            type="button"
            onClick={() => setTripType(tt.key)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              tripType === tt.key
                ? "bg-cyan-500 text-white"
                : "bg-slate-100 text-slate-500 hover:bg-slate-200"
            }`}
          >
            {tt.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row items-stretch gap-3">
        <div className="flex-1">
          <label className="text-xs font-semibold text-slate-400 tracking-wide">{t("searchForm.origin_label")}</label>
          <AirportAutocomplete
            value={origin}
            onChange={setOrigin}
            onSelect={(airport) => setOrigin(`${airport.city || airport.name} (${airport.iata})`)}
            placeholder={t("searchForm.origin_placeholder")}
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
          <label className="text-xs font-semibold text-slate-400 tracking-wide">{t("searchForm.destination_label")}</label>
          <AirportAutocomplete
            value={destination}
            onChange={setDestination}
            onSelect={(airport) => setDestination(`${airport.city || airport.name} (${airport.iata})`)}
            placeholder={t("searchForm.destination_placeholder")}
            className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-cyan-500 transition-colors"
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <label className="text-xs font-semibold text-slate-400 tracking-wide">{t("searchForm.depart_label")}</label>
          <input
            type="date"
            min={todayISO()}
            value={departDate}
            onChange={handleDepartChange}
            className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-cyan-500 transition-colors"
          />
        </div>

        <AnimatePresence initial={false}>
          {tripType === "round" && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "100%" }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2 }}
              className="flex-1 overflow-hidden"
            >
              <label className="text-xs font-semibold text-slate-400 tracking-wide whitespace-nowrap">{t("searchForm.return_label")}</label>
              <input
                type="date"
                min={departDate || todayISO()}
                value={returnDate}
                onChange={handleReturnChange}
                className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-cyan-500 transition-colors"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div>
        <label className="text-xs font-semibold text-slate-400 tracking-wide">{t("searchForm.budget_label")}</label>
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
            placeholder={t("searchForm.budget_placeholder")}
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            className="flex-1 bg-slate-50 px-3 py-2.5 text-sm outline-none"
          />
        </div>
      </div>

      <div>
        <button
          type="button"
          onClick={() => setAdvancedOpen(!advancedOpen)}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors"
        >
          {t("searchForm.advanced_options")}
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
                  <label className="text-xs font-semibold text-slate-400 tracking-wide">{t("searchForm.adults_label")}</label>
                  <input
                    type="number"
                    min="1"
                    value={adults}
                    onChange={(e) => setAdults(e.target.value)}
                    className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 tracking-wide">{t("searchForm.cabin_class_label")}</label>
                  <select
                    value={travelClass}
                    onChange={(e) => setTravelClass(e.target.value)}
                    className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none"
                  >
                    <option value="economy" style={{ color: "#000" }}>{t("searchForm.economy")}</option>
                    <option value="premium" style={{ color: "#000" }}>{t("searchForm.premium_economy")}</option>
                    <option value="business" style={{ color: "#000" }}>{t("searchForm.business")}</option>
                    <option value="first" style={{ color: "#000" }}>{t("searchForm.first")}</option>
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
        {loading ? t("searchForm.searching") : t("searchForm.search_button")}
      </Button>
    </form>
  )
}