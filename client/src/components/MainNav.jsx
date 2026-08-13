import { useState, useEffect, useRef, useMemo } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { motion, AnimatePresence, LayoutGroup } from "framer-motion"
import { Plane, MapPin, Compass, BedDouble, Menu, X, ChevronDown } from "lucide-react"
import logo from "@/assets/nuvexblacklogo.webp"

const NAV_ITEMS = [
  { key: "flights", labelKey: "navbar.nav_flights", label: "Flights", path: "/flights", icon: Plane, enabled: true },
  { key: "places", labelKey: "navbar.nav_places", label: "Places", path: "/places", icon: MapPin, enabled: true },
  { key: "explore", labelKey: "navbar.nav_explore", label: "Explore", path: "/explore", icon: Compass, enabled: false },
  { key: "stays", labelKey: "navbar.nav_stays", label: "Stays", path: "/stays", icon: BedDouble, enabled: false },
]

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

function FlagIcon({ country, label }) {
  return (
    <img
      src={`https://flagcdn.com/24x18/${country}.png`}
      srcSet={`https://flagcdn.com/48x36/${country}.png 2x`}
      width={18}
      height={13}
      alt={label}
      className="inline-block rounded-[2px] shrink-0"
      style={{ objectFit: "cover" }}
    />
  )
}

const NUVEX_THEME = {
  "--nuvex-bg": "#FFFFFF",
  "--nuvex-border": "#E4E7EC",
  "--nuvex-ink": "#10131A",
  "--nuvex-slate": "#64707D",
  "--nuvex-signal": "#E8A33D",
  "--nuvex-signal-soft": "rgba(232,163,61,0.14)",
  "--nuvex-accent": "#0B4F6C",
}

function LiveClock({ locale, timeZone }) {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const formatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        hour: "2-digit",
        minute: "2-digit",
        timeZone,
        timeZoneName: "short",
      }),
    [locale, timeZone]
  )

  return <span>{formatter.format(now)}</span>
}

export default function MainNav() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [langOpen, setLangOpen] = useState(false)
  const langRef = useRef(null)

  // FIXED-HEADER ADDITION: header measures its own height (utility strip +
  // logo row, and grows when the mobile panel opens) and renders a spacer
  // of the same height right after it. That's what lets `header` go
  // `position: fixed` without page content sliding underneath it — no
  // App.jsx changes needed, this component is self-contained.
  const headerRef = useRef(null)
  const [headerHeight, setHeaderHeight] = useState(0)

  useEffect(() => {
    if (!headerRef.current) return
    const el = headerRef.current
    const ro = new ResizeObserver((entries) => {
      setHeaderHeight(entries[0].contentRect.height)
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (langRef.current && !langRef.current.contains(e.target)) setLangOpen(false)
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const selectedLang = languages.find((l) => l.code === i18n.language) || languages[0]
  const selectedLangLabel = t(`languages.${selectedLang.code}`, { defaultValue: selectedLang.label })
  const timeZone = languageTimeZones[selectedLang.code] || "UTC"

  const handleLanguageSelect = (lang) => {
    i18n.changeLanguage(lang.code)
    setLangOpen(false)
  }

  const isActive = (item) => item.enabled && location.pathname === item.path

  // SMOOTH-NAV ADDITION: reset scroll to top on every route change. Without
  // this, clicking a nav link while scrolled down on e.g. /flights lands
  // you on the new page still scrolled down, which reads as a broken jump
  // rather than a clean navigation.
  const handleSelect = (item) => {
    if (!item.enabled) return
    navigate(item.path)
    window.scrollTo({ top: 0, behavior: "smooth" })
    setMobileOpen(false)
  }

  return (
    <>
      <header
        ref={headerRef}
        className="fixed top-0 left-0 right-0 z-[60] w-full transition-shadow duration-300"
        style={{
          ...NUVEX_THEME,
          background: "var(--nuvex-bg)",
          boxShadow: scrolled ? "0 1px 0 var(--nuvex-border), 0 8px 24px -16px rgba(16,19,26,0.25)" : "none",
        }}
      >
        {/* ── Utility strip: time + language ── */}
        <div style={{ background: "var(--nuvex-accent)" }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-8 flex items-center justify-between text-xs text-white/90">
            <span className="hidden sm:flex items-center gap-1.5 whitespace-nowrap">
              <LiveClock locale={selectedLang.code} timeZone={timeZone} />
            </span>

            <div className="relative ml-auto" ref={langRef}>
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-1.5 py-1 hover:text-white transition-colors whitespace-nowrap"
              >
                <FlagIcon country={selectedLang.country} label={selectedLangLabel} />
                <span>{selectedLangLabel}</span>
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
                    style={{ background: "var(--nuvex-bg)", borderColor: "var(--nuvex-border)" }}
                  >
                    <div className="max-h-64 overflow-y-auto">
                      {languages.map((lang) => {
                        const langLabel = t(`languages.${lang.code}`, { defaultValue: lang.label })
                        return (
                          <button
                            key={lang.code}
                            onClick={() => handleLanguageSelect(lang)}
                            className="w-full text-left px-3 py-2 text-xs hover:bg-black/[0.04] transition-colors flex items-center justify-between"
                            style={{
                              color: lang.code === selectedLang.code ? "var(--nuvex-accent)" : "var(--nuvex-ink)",
                            }}
                          >
                            <span className="flex items-center gap-1.5">
                              <FlagIcon country={lang.country} label={langLabel} />
                              <span>{langLabel}</span>
                            </span>
                            {lang.code === selectedLang.code && <span>✓</span>}
                          </button>
                        )
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* ── Logo + links row ── */}
        <div
          className="transition-colors duration-300"
          style={{ borderBottom: scrolled ? "1px solid transparent" : "1px solid var(--nuvex-border)" }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                navigate("/")
                window.scrollTo({ top: 0, behavior: "smooth" })
                setMobileOpen(false)
              }}
              className="flex items-center shrink-0 transition-transform duration-200 hover:scale-105"
              aria-label="Nuvex home"
            >
              <img src={logo} alt="Nuvex" className="h-9 w-auto" />
            </button>

            <LayoutGroup id="nuvex-nav">
              <nav className="hidden md:flex items-center gap-1">
                {NAV_ITEMS.map((item) => {
                  const Icon = item.icon
                  const active = isActive(item)
                  const label = t(item.labelKey, { defaultValue: item.label })
                  return (
                    <motion.button
                      key={item.key}
                      type="button"
                      onClick={() => handleSelect(item)}
                      disabled={!item.enabled}
                      whileHover={item.enabled && !active ? { color: "var(--nuvex-ink)" } : {}}
                      whileTap={item.enabled ? { scale: 0.95 } : {}}
                      transition={{ duration: 0.15 }}
                      className="relative flex items-center gap-1.5 px-3.5 py-2 text-[15px] font-medium rounded-full"
                      style={{
                        color: active
                          ? "var(--nuvex-ink)"
                          : item.enabled
                          ? "var(--nuvex-slate)"
                          : "color-mix(in srgb, var(--nuvex-slate) 55%, transparent)",
                        cursor: item.enabled ? "pointer" : "default",
                      }}
                    >
                      {active && (
                        <motion.span
                          layoutId="nuvex-active-pill"
                          className="absolute inset-0 rounded-full"
                          style={{ background: "var(--nuvex-signal-soft)" }}
                          transition={{ type: "spring", stiffness: 400, damping: 32 }}
                        />
                      )}
                      <Icon className="w-4 h-4 relative z-10" />
                      <span className="relative z-10">{label}</span>
                      {!item.enabled && (
                        <span
                          className="relative z-10 ml-1 text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full border"
                          style={{ color: "var(--nuvex-slate)", borderColor: "var(--nuvex-border)" }}
                        >
                          Soon
                        </span>
                      )}
                    </motion.button>
                  )
                })}
              </nav>
            </LayoutGroup>

            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              className="md:hidden p-2"
              style={{ color: "var(--nuvex-ink)" }}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile panel */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.nav
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden border-b overflow-hidden"
              style={{ borderColor: "var(--nuvex-border)", background: "var(--nuvex-bg)" }}
            >
              <div
                className="flex items-stretch gap-3 px-4 py-4 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                style={{ scrollSnapType: "x proximity" }}
              >
                {NAV_ITEMS.map((item) => {
                  const Icon = item.icon
                  const active = isActive(item)
                  const label = t(item.labelKey, { defaultValue: item.label })
                  return (
                    <motion.button
                      key={item.key}
                      type="button"
                      onClick={() => handleSelect(item)}
                      disabled={!item.enabled}
                      whileTap={item.enabled ? { scale: 0.95 } : {}}
                      className="relative flex flex-col items-center justify-center gap-2 shrink-0 rounded-2xl px-6 py-4 text-base font-semibold"
                      style={{
                        minWidth: 104,
                        scrollSnapAlign: "start",
                        border: "1px solid var(--nuvex-border)",
                        color: active
                          ? "var(--nuvex-ink)"
                          : item.enabled
                          ? "var(--nuvex-slate)"
                          : "color-mix(in srgb, var(--nuvex-slate) 55%, transparent)",
                        background: active ? "var(--nuvex-signal-soft)" : "transparent",
                      }}
                    >
                      <Icon className="w-6 h-6" />
                      <span className="whitespace-nowrap">{label}</span>
                      {!item.enabled && (
                        <span
                          className="absolute top-2 right-2 text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full border"
                          style={{ color: "var(--nuvex-slate)", borderColor: "var(--nuvex-border)" }}
                        >
                          Soon
                        </span>
                      )}
                    </motion.button>
                  )
                })}
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>

      {/* FIXED-HEADER ADDITION: reserves the space the header used to
          occupy in normal flow. Height tracks the header live (including
          when the mobile panel opens), so nothing gets covered on any
          page — including ones with their own internal scroll area. */}
      <div style={{ height: headerHeight }} aria-hidden="true" />
    </>
  )
}