import { useState, useEffect, useRef } from "react"
import { useTranslation } from "react-i18next"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, Search, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import logo from "@/assets/logo.png"
import AirportAutocomplete from "@/components/AirportAutocomplete"

const languages = [
  { code: "en-US", label: "English (US)", country: "us" },
  { code: "en-GB", label: "English (UK)", country: "gb" },
  { code: "fr", label: "French", country: "fr" },
  { code: "es", label: "Spanish", country: "es" },
  { code: "pt", label: "Portuguese", country: "pt" },
  { code: "ar", label: "Arabic", country: "sa" },
  { code: "zh", label: "Chinese", country: "cn" },
  { code: "de", label: "German", country: "de" },
  { code: "ja", label: "Japanese", country: "jp" },
  { code: "ru", label: "Russian", country: "ru" },
  { code: "it", label: "Italian", country: "it" },
  { code: "ko", label: "Korean", country: "kr" },
  { code: "nl", label: "Dutch", country: "nl" },
  { code: "tr", label: "Turkish", country: "tr" },
]

function FlagIcon({ country, label }) {
  return (
    <img
      src={`https://flagcdn.com/24x18/${country}.png`}
      srcSet={`https://flagcdn.com/48x36/${country}.png 2x`}
      width={20}
      height={15}
      alt={label}
      className="inline-block rounded-[2px] shrink-0"
      style={{ objectFit: "cover" }}
    />
  )
}

const languageTimeZones = {
  "en-US": "America/New_York",
  "en-GB": "Europe/London",
  fr: "Europe/Paris",
  es: "Europe/Madrid",
  pt: "Europe/Lisbon",
  ar: "Asia/Dubai",
  zh: "Asia/Shanghai",
  de: "Europe/Berlin",
  ja: "Asia/Tokyo",
  ru: "Europe/Moscow",
  it: "Europe/Rome",
  ko: "Asia/Seoul",
  nl: "Europe/Amsterdam",
  tr: "Europe/Istanbul",
}

export default function Navbar({ onSearch, onNavigate }) {
  const { t, i18n } = useTranslation()
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [menuOverflowVisible, setMenuOverflowVisible] = useState(false)
  const [langOpen, setLangOpen] = useState(false)
  const [searchTypeOpen, setSearchTypeOpen] = useState(false)
  const [searchValues, setSearchValues] = useState({})
  const [now, setNow] = useState(new Date())
  const langRef = useRef(null)
  const searchTypeRef = useRef(null)

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (!mobileOpen) setMenuOverflowVisible(false)
  }, [mobileOpen])

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

  const marqueeMessages = [
    t("navbar.marquee_1"),
    t("navbar.marquee_2"),
    t("navbar.marquee_3"),
    t("navbar.marquee_4"),
    t("navbar.marquee_5"),
  ]

  const [selectedSearchType, setSelectedSearchType] = useState(searchTypes[0])

  const selectedLang = languages.find((l) => l.code === i18n.language) || languages[0]

  const timeZone = languageTimeZones[selectedLang.code] || "UTC"
  const formattedTime = new Intl.DateTimeFormat(selectedLang.code, {
    hour: "2-digit",
    minute: "2-digit",
    timeZone,
    timeZoneName: "short",
  }).format(now)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

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

  const handleLanguageSelect = (lang) => {
    i18n.changeLanguage(lang.code)
    setLangOpen(false)
  }

  const activeFields = searchFieldsConfig[selectedSearchType.key]

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
              <span
                className="flex items-center gap-1.5 py-1"
                style={{ color: "var(--color-text-secondary)" }}
              >
                {formattedTime}
              </span>

              <div className="relative" ref={langRef}>
                <button
                  onClick={() => setLangOpen(!langOpen)}
                  className="flex items-center gap-1.5 hover:text-white transition-colors py-1"
                >
                  <span className="flex items-center gap-1.5">
                    <FlagIcon country={selectedLang.country} label={selectedLang.label} />
                    <span>{selectedLang.label}</span>
                  </span>
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
                            onClick={() => handleLanguageSelect(lang)}
                            className="w-full text-left px-3 py-2 text-xs hover:bg-white/10 transition-colors flex items-center justify-between"
                            style={{
                              color:
                                lang.code === selectedLang.code
                                  ? "var(--color-accent)"
                                  : "var(--color-text-secondary)",
                            }}
                          >
                            <span className="flex items-center gap-1.5">
                              <FlagIcon country={lang.country} label={lang.label} />
                              <span>{lang.label}</span>
                            </span>
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

            <button
              type="button"
              onClick={() => onNavigate?.("home")}
              className="flex items-center shrink-0 relative"
            >
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
            </button>

            <div
              className="flex-1 hidden md:flex items-stretch h-10 rounded-lg border overflow-visible"
              style={{
                background: "rgba(255,255,255,0.05)",
                borderColor: "var(--color-border)",
              }}
            >
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

              {activeFields.map((field, i) => (
                <AirportAutocomplete
                  key={field.id}
                  value={searchValues[field.id] || ""}
                  onChange={(val) => handleFieldChange(field.id, val)}
                  onSelect={(airport) => handleFieldChange(field.id, `${airport.city || airport.name} (${airport.iata})`)}
                  placeholder={field.placeholder}
                  className={`flex-1 min-w-0 bg-transparent text-sm outline-none px-3 ${
                    i > 0 ? "border-l" : ""
                  }`}
                  style={{ color: "var(--color-text-primary)", borderColor: "var(--color-border)" }}
                />
              ))}

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
            onAnimationComplete={() => setMenuOverflowVisible(true)}
            className="md:hidden border-b"
            style={{
              background: "var(--color-bg-secondary)",
              borderColor: "var(--color-border)",
              overflow: menuOverflowVisible ? "visible" : "hidden",
            }}
          >
            <div className="px-4 pt-4">
              <div
                className="rounded-lg border"
                style={{ borderColor: "var(--color-border)" }}
              >
                <select
                  value={selectedSearchType.key}
                  onChange={(e) =>
                    handleSearchTypeSelect(
                      searchTypes.find((type) => type.key === e.target.value)
                    )
                  }
                  className="w-full text-sm px-3 py-2.5 outline-none rounded-t-lg"
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
                  <AirportAutocomplete
                    key={field.id}
                    value={searchValues[field.id] || ""}
                    onChange={(val) => handleFieldChange(field.id, val)}
                    onSelect={(airport) => handleFieldChange(field.id, `${airport.city || airport.name} (${airport.iata})`)}
                    placeholder={field.placeholder}
                    className="w-full text-sm px-3 py-2.5 outline-none border-t last:rounded-b-lg"
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      color: "var(--color-text-primary)",
                      borderColor: "var(--color-border)",
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="px-4 py-4">
              <Button
                onClick={handleSubmitSearch}
                className="w-full rounded-full text-white font-medium"
                style={{ background: "var(--color-accent)" }}
              >
                {t("common.search_flights")}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}

function Marquee({ items }) {
  const loopItems = [...items, ...items]

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