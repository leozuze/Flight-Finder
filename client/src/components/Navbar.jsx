import { useState } from "react"
import { useTranslation } from "react-i18next"
import { motion, AnimatePresence } from "framer-motion"
import { Search, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import AirportAutocomplete from "@/components/AirportAutocomplete"

const SEARCHBAR_THEME = {
  "--sb-bg": "#F6F5FC",
  "--sb-border": "#E4E7EC",
  "--sb-ink": "#1B1730",
  "--sb-slate": "#64707D",
  "--sb-accent": "#17B8C4",
  "--sb-accent-hover": "#149AA5",
}

export default function Navbar({ onSearch }) {
  const { t } = useTranslation()
  const [searchTypeOpen, setSearchTypeOpen] = useState(false)
  const [searchValues, setSearchValues] = useState({})

  const searchTypes = [
    { key: "all", label: t("navbar.search_type_all") },
    { key: "route", label: t("navbar.search_type_route") },
    { key: "airport", label: t("navbar.search_type_airport") },
  ]

  const searchFieldsConfig = {
    all: [{ id: "q", placeholder: t("navbar.placeholder_all") }],
    route: [
      { id: "from", placeholder: t("navbar.placeholder_from") },
      { id: "to", placeholder: t("navbar.placeholder_to") },
    ],
    airport: [
      { id: "code", placeholder: t("navbar.placeholder_airport_code") },
      { id: "city", placeholder: t("navbar.placeholder_airport_city") },
    ],
  }

  const [selectedSearchType, setSelectedSearchType] = useState(searchTypes[0])
  const activeFields = searchFieldsConfig[selectedSearchType.key]

  const handleSearchTypeSelect = (type) => {
    setSelectedSearchType(type)
    setSearchValues({})
    setSearchTypeOpen(false)
  }

  const handleFieldChange = (id, value) => {
    setSearchValues((prev) => ({ ...prev, [id]: value }))
  }

  const extractCode = (val) => {
    const match = val.match(/\(([A-Z]{3})\)\s*$/)
    return match ? match[1] : val.trim()
  }

  const handleSubmitSearch = () => {
    if (selectedSearchType.key === "route") {
      const originVal = extractCode(searchValues.from || "")
      const destinationVal = extractCode(searchValues.to || "")
      if (!originVal || !destinationVal) {
        alert(t("navbar.alert_route_missing"))
        return
      }
      onSearch?.({ type: "route", origin: originVal, destination: destinationVal })

    } else if (selectedSearchType.key === "all") {
      const raw = (searchValues.q || "").trim()
      if (!raw) {
        alert(t("navbar.alert_all_missing"))
        return
      }
      const parts = raw.split(/\s+to\s+/i)
      if (parts.length === 2 && parts[0].trim() && parts[1].trim()) {
        onSearch?.({
          type: "route",
          origin: extractCode(parts[0].trim()),
          destination: extractCode(parts[1].trim()),
        })
      } else {
        onSearch?.({ type: "airport", query: extractCode(raw) })
      }

    } else if (selectedSearchType.key === "airport") {
      const code = extractCode((searchValues.code || "").trim())
      const city = extractCode((searchValues.city || "").trim())
      if (!code && !city) {
        alert(t("navbar.alert_airport_missing"))
        return
      }
      onSearch?.({ type: "airport", query: code || city, code, city })

    } else {
      alert(t("navbar.alert_type_unavailable"))
      return
    }

    document.getElementById("search")?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <div style={SEARCHBAR_THEME} className="w-full">
      {/* ── Desktop ── */}
      <div
        className="hidden md:flex items-stretch h-12 rounded-xl border overflow-visible max-w-3xl mx-auto"
        style={{ background: "var(--sb-bg)", borderColor: "var(--sb-border)" }}
      >
        <div className="relative shrink-0">
          <button
            onClick={() => setSearchTypeOpen(!searchTypeOpen)}
            className="h-full flex items-center gap-1.5 px-4 border-r text-sm whitespace-nowrap shrink-0"
            style={{ borderColor: "var(--sb-border)", color: "var(--sb-ink)" }}
          >
            {selectedSearchType.label}
            <ChevronDown
              className="w-3.5 h-3.5 transition-transform duration-200 shrink-0"
              style={{ transform: searchTypeOpen ? "rotate(180deg)" : "rotate(0deg)" }}
            />
          </button>

          <AnimatePresence>
            {searchTypeOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute left-0 top-full mt-1 w-48 rounded-lg border overflow-hidden shadow-xl z-50"
                style={{ background: "#FFFFFF", borderColor: "var(--sb-border)" }}
              >
                {searchTypes.map((type) => (
                  <button
                    key={type.key}
                    onClick={() => handleSearchTypeSelect(type)}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-black/[0.04] transition-colors"
                    style={{
                      color: type.key === selectedSearchType.key ? "var(--sb-accent-hover)" : "var(--sb-ink)",
                    }}
                  >
                    {type.label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {activeFields.map((field, i) => (
          <AirportAutocomplete
            key={field.id}
            value={searchValues[field.id] || ""}
            onChange={(val) => handleFieldChange(field.id, val)}
            onSelect={(airport) => handleFieldChange(field.id, `${airport.city || airport.name} (${airport.iata})`)}
            placeholder={field.placeholder}
            dropdownAlign={i > 0 ? "right" : "left"}
            className={`flex-1 min-w-[140px] bg-transparent text-sm outline-none px-3 ${i > 0 ? "border-l" : ""}`}
            style={{ color: "var(--sb-ink)", borderColor: "var(--sb-border)" }}
          />
        ))}

        <button
          onClick={handleSubmitSearch}
          className="px-5 flex items-center justify-center shrink-0 rounded-r-xl transition-colors"
          style={{ background: "var(--sb-accent)" }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--sb-accent-hover)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "var(--sb-accent)")}
        >
          <Search className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* ── Mobile ── */}
      <div
        className="md:hidden rounded-xl border"
        style={{ background: "var(--sb-bg)", borderColor: "var(--sb-border)" }}
      >
        <select
          value={selectedSearchType.key}
          onChange={(e) => handleSearchTypeSelect(searchTypes.find((type) => type.key === e.target.value))}
          className="w-full text-sm px-3 py-2.5 outline-none rounded-t-xl bg-transparent"
          style={{ color: "var(--sb-ink)" }}
        >
          {searchTypes.map((type) => (
            <option key={type.key} value={type.key}>
              {type.label}
            </option>
          ))}
        </select>

        {activeFields.map((field) => (
          <AirportAutocomplete
            key={field.id}
            value={searchValues[field.id] || ""}
            onChange={(val) => handleFieldChange(field.id, val)}
            onSelect={(airport) => handleFieldChange(field.id, `${airport.city || airport.name} (${airport.iata})`)}
            placeholder={field.placeholder}
            className="w-full text-sm px-3 py-2.5 outline-none border-t bg-transparent"
            style={{ color: "var(--sb-ink)", borderColor: "var(--sb-border)" }}
          />
        ))}

        <div className="p-3">
          <Button
            onClick={handleSubmitSearch}
            className="w-full rounded-full text-white font-medium"
            style={{ background: "var(--sb-accent)" }}
          >
            {t("common.search_flights")}
          </Button>
        </div>
      </div>
    </div>
  )
}