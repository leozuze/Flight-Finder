import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, Search, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import logo from "@/assets/logo.png"

const languages = [
  { code: "en-US", label: "English (US)" },
  { code: "en-GB", label: "English (UK)" },
  { code: "fr", label: "French" },
  { code: "es", label: "Spanish" },
  { code: "pt", label: "Portuguese" },
  { code: "ar", label: "Arabic" },
  { code: "zh", label: "Chinese" },
  { code: "hi", label: "Hindi" },
  { code: "sw", label: "Swahili" },
  { code: "de", label: "German" },
  { code: "ja", label: "Japanese" },
  { code: "ru", label: "Russian" },
  { code: "it", label: "Italian" },
  { code: "ko", label: "Korean" },
  { code: "nl", label: "Dutch" },
  { code: "tr", label: "Turkish" },
]

const searchTypes = [
  { key: "all", label: "All" },
  { key: "route", label: "Route" },
  { key: "airport", label: "Airport" },
]

const searchFieldsConfig = {
  all: [{ id: "q", placeholder: "Search for flight, tail, airport, or city" }],
  route: [
    { id: "from", placeholder: "From (e.g. KJFK or New York)" },
    { id: "to", placeholder: "To (e.g. KLAX or Los Angeles)" },
  ],
  airport: [
    { id: "code", placeholder: "Airport Code (e.g. KJFK)" },
    { id: "city", placeholder: "Airport City (e.g. New York)" },
  ],
}

const marqueeMessages = [
  "Never miss a fare drop.",
  "Cheap flights, found for you.",
  "Deals before they disappear.",
  "Smart fares. Zero effort.",
  "Track fares. Book smarter.",
]

function Marquee({ items }) {
  const loopItems = [...items, ...items] // duplicated for seamless loop

  return (
    <div className="relative overflow-hidden flex-1 h-full flex items-center">
      <motion.div
        className="flex items-center gap-8 whitespace-nowrap"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 22, ease: "linear", repeat: Infinity }}
      >
        {loopItems.map((msg, i) => (
          <span key={i} className="flex items-center gap-8">
            <span>{msg}</span>
            <span style={{ color: "var(--color-accent)" }}>•</span>
          </span>
        ))}
      </motion.div>
      {/* fade edges so text doesn't hard-cut */}
      <div
        className="pointer-events-none absolute inset-y-0 left-0 w-8"
        style={{ background: "linear-gradient(to right, var(--color-bg-secondary), transparent)" }}
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 w-8"
        style={{ background: "linear-gradient(to left, var(--color-bg-secondary), transparent)" }}
      />
    </div>
  )
}

export default function Navbar({ onSearch }) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [langOpen, setLangOpen] = useState(false)
  const [selectedLang, setSelectedLang] = useState(languages[0])
  const [searchTypeOpen, setSearchTypeOpen] = useState(false)
  const [selectedSearchType, setSelectedSearchType] = useState(searchTypes[0])
  const [searchValues, setSearchValues] = useState({})
  const langRef = useRef(null)
  const searchTypeRef = useRef(null)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (langRef.current && !langRef.current.contains(e.target)) {
        setLangOpen(false)
      }
      if (searchTypeRef.current && !searchTypeRef.current.contains(e.target)) {
        setSearchTypeOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSearchTypeSelect = (type) => {
    setSelectedSearchType(type)
    setSearchValues({})
    setSearchTypeOpen(false)
  }

  const handleFieldChange = (id, value) => {
    setSearchValues((prev) => ({ ...prev, [id]: value }))
  }

  const activeFields = searchFieldsConfig[selectedSearchType.key]

const handleSubmitSearch = () => {
  if (selectedSearchType.key === "route") {
    const originVal = searchValues.from
    const destinationVal = searchValues.to
    if (!originVal || !destinationVal) {
      alert("Please enter both an origin and destination, e.g. 'Pune to Harare'.")
      return
    }
    onSearch?.({ type: "route", origin: originVal, destination: destinationVal })

  } else if (selectedSearchType.key === "all") {
    const raw = (searchValues.q || "").trim()
    if (!raw) {
      alert("Please enter a route, airport, or city, e.g. 'Pune to Harare' or 'KJFK'.")
      return
    }
    const parts = raw.split(/\s+to\s+/i)
    if (parts.length === 2 && parts[0].trim() && parts[1].trim()) {
      onSearch?.({ type: "route", origin: parts[0].trim(), destination: parts[1].trim() })
    } else {
      onSearch?.({ type: "airport", query: raw })
    }

  } else if (selectedSearchType.key === "airport") {
    const code = (searchValues.code || "").trim()
    const city = (searchValues.city || "").trim()
    if (!code && !city) {
      alert("Please enter an airport code or city, e.g. 'KJFK' or 'New York'.")
      return
    }
    onSearch?.({ type: "airport", query: code || city, code, city })

  } else {
    alert("This search type isn't available yet — try 'Route', 'All', or 'Airport'.")
    return
  }

  document.getElementById("search")?.scrollIntoView({ behavior: "smooth" })
  setMobileOpen(false)
}

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "shadow-xl" : ""
      }`}
      style={{ background: "var(--color-bg-secondary)" }}
    >
      {/* ── Top Utility Bar ── */}
      <div className="border-b" style={{ borderColor: "var(--color-border)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className="flex items-center justify-between h-9 text-xs"
            style={{ color: "var(--color-text-secondary)" }}
          >
            <Marquee items={marqueeMessages} />

            <div className="flex items-center gap-4">
              {/* Time display */}
              <span
                className="flex items-center gap-1.5 py-1"
                style={{ color: "var(--color-text-secondary)" }}
              >
                14:32 GMT
              </span>

              {/* Language Dropdown */}
              <div className="relative" ref={langRef}>
                <button
                  onClick={() => setLangOpen(!langOpen)}
                  className="flex items-center gap-1.5 hover:text-white transition-colors py-1"
                >
                  <span>{selectedLang.label}</span>
                  <ChevronDown
                    className="w-3 h-3 transition-transform duration-200"
                    style={{ transform: langOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                  />
                </button>

                <AnimatePresence>
                  {langOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-1 w-40 rounded-lg border overflow-hidden shadow-xl z-50"
                      style={{
                        background: "var(--color-bg-secondary)",
                        borderColor: "var(--color-border)",
                      }}
                    >
                      <div className="max-h-64 overflow-y-auto">
                        {languages.map((lang) => (
                          <button
                            key={lang.code}
                            onClick={() => {
                              setSelectedLang(lang)
                              setLangOpen(false)
                            }}
                            className="w-full text-left px-3 py-2 text-xs hover:bg-white/10 transition-colors flex items-center justify-between"
                            style={{
                              color:
                                lang.code === selectedLang.code
                                  ? "var(--color-accent)"
                                  : "var(--color-text-secondary)",
                            }}
                          >
                            {lang.label}
                            {lang.code === selectedLang.code && (
                              <span style={{ color: "var(--color-accent)" }}>✓</span>
                            )}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Bar ── */}
      <div className="border-b" style={{ borderColor: "var(--color-border)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 h-16">

            {/* Logo lockup: image overlaps the tail end of the wordmark */}
           <a href="#home" className="flex items-center shrink-0 relative">
              <span
                className="font-bold text-xl tracking-tight relative z-10"
                style={{ color: "var(--color-text-primary)", fontFamily: "var(--font-display)" }}
              >
                Sky<span style={{ color: "var(--color-accent)" }}>Scout</span>
              </span>
              <img
                src={logo}
                alt="SkyScout"
                className="h-16 w-auto -ml-7 relative z-0 pointer-events-none"
              />
            </a>
            {/* Search Bar: type dropdown + dynamic fields + submit */}
            <div
              className="flex-1 hidden md:flex items-stretch h-10 rounded-lg border overflow-visible"
              style={{
                background: "rgba(255,255,255,0.05)",
                borderColor: "var(--color-border)",
              }}
            >
              {/* Search type dropdown */}
              <div className="relative" ref={searchTypeRef}>
                <button
                  onClick={() => setSearchTypeOpen(!searchTypeOpen)}
                  className="h-full flex items-center gap-1.5 px-3 border-r text-sm whitespace-nowrap"
                  style={{
                    borderColor: "var(--color-border)",
                    color: "var(--color-text-primary)",
                  }}
                >
                  {selectedSearchType.label}
                  <ChevronDown
                    className="w-3.5 h-3.5 transition-transform duration-200"
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
                      style={{
                        background: "var(--color-bg-secondary)",
                        borderColor: "var(--color-border)",
                      }}
                    >
                      {searchTypes.map((type) => (
                        <button
                          key={type.key}
                          onClick={() => handleSearchTypeSelect(type)}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors"
                          style={{
                            color:
                              type.key === selectedSearchType.key
                                ? "var(--color-accent)"
                                : "var(--color-text-primary)",
                          }}
                        >
                          {type.label}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Dynamic input fields for the selected search type */}
              {activeFields.map((field, i) => (
                <input
                  key={field.id}
                  type="text"
                  placeholder={field.placeholder}
                  value={searchValues[field.id] || ""}
                  onChange={(e) => handleFieldChange(field.id, e.target.value)}
                  className={`flex-1 min-w-0 bg-transparent text-sm outline-none px-3 ${
                    i > 0 ? "border-l" : ""
                  }`}
                  style={{ color: "var(--color-text-primary)", borderColor: "var(--color-border)" }}
                />
              ))}

              {/* Submit */}
              <button
                onClick={handleSubmitSearch}
                className="px-4 flex items-center justify-center shrink-0 rounded-r-lg transition-colors"
                style={{ background: "var(--color-accent)" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "var(--color-accent-hover)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "var(--color-accent)")
                }
              >
                <Search className="w-4 h-4 text-white" />
              </button>
            </div>

            {/* Hamburger (mobile only) */}
            <div className="flex items-center gap-3 ml-auto">
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden p-2"
                style={{ color: "var(--color-text-primary)" }}
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile Menu ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-b overflow-hidden"
            style={{
              background: "var(--color-bg-secondary)",
              borderColor: "var(--color-border)",
            }}
          >
            {/* Mobile search type dropdown */}
            <div className="px-4 pt-4">
              <div
                className="rounded-lg border overflow-hidden"
                style={{ borderColor: "var(--color-border)" }}
              >
                <select
                  value={selectedSearchType.key}
                  onChange={(e) =>
                    handleSearchTypeSelect(
                      searchTypes.find((t) => t.key === e.target.value)
                    )
                  }
                  className="w-full text-sm px-3 py-2.5 outline-none"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    color: "var(--color-text-primary)",
                  }}
                >
                  {searchTypes.map((type) => (
                    <option key={type.key} value={type.key} style={{ color: "#000" }}>
                      {type.label}
                    </option>
                  ))}
                </select>

                {activeFields.map((field) => (
                  <input
                    key={field.id}
                    type="text"
                    placeholder={field.placeholder}
                    value={searchValues[field.id] || ""}
                    onChange={(e) => handleFieldChange(field.id, e.target.value)}
                    className="w-full text-sm px-3 py-2.5 outline-none border-t"
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      color: "var(--color-text-primary)",
                      borderColor: "var(--color-border)",
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Mobile CTA */}
            <div className="px-4 py-4">
              <Button
                onClick={handleSubmitSearch}
                className="w-full rounded-full text-white font-medium"
                style={{ background: "var(--color-accent)" }}
              >
                Find Flights
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
