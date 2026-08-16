import { useState, useRef, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, Plane, MapPin, Compass, BedDouble } from "lucide-react"
import logo from "@/assets/nuvexwhitelogo.webp"

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

// TODO (flagged in project notes): duplicated from MainNav.jsx — candidate
// for src/data/languages.js + src/components/FlagIcon.jsx shared extraction.
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

// TODO: duplicated from MainNav.jsx's NAV_ITEMS — same shared-extraction
// candidate as the languages list above.
const FOOTER_NAV_ITEMS = [
  { key: "flights", labelKey: "navbar.nav_flights", label: "Flights", dest: "home", icon: Plane, enabled: true },
  { key: "places", labelKey: "navbar.nav_places", label: "Places", dest: "places", icon: MapPin, enabled: true },
  { key: "explore", labelKey: "navbar.nav_explore", label: "Explore", dest: "explore", icon: Compass, enabled: true },
  { key: "stays", labelKey: "navbar.nav_stays", label: "Stays", dest: "stays", icon: BedDouble, enabled: false },
]

export default function Footer({ onNavigate }) {
  const { t, i18n } = useTranslation()
  const [langOpen, setLangOpen] = useState(false)
  const langRef = useRef(null)

  const selectedLang = languages.find((l) => l.code === i18n.language) || languages[0]

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (langRef.current && !langRef.current.contains(e.target)) {
        setLangOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleLanguageSelect = (lang) => {
    i18n.changeLanguage(lang.code)
    setLangOpen(false)
  }

  const handleNavItem = (item) => {
    if (!item.enabled) return
    onNavigate?.(item.dest)
  }

  return (
    <div style={NUVEX_THEME}>
      {/* ── Blue section: brand, quick links, legal/trust ── */}
      <footer style={{ background: "var(--nuvex-accent)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">

            {/* Brand — logo-only lockup now (Nuvex wordmark lives inside
                nuvexwhitelogo.webp itself), matches MainNav's logo usage */}
            <div>
              <button
                type="button"
                onClick={() => onNavigate?.("home")}
                className="flex items-center shrink-0"
              >
                <img src={logo} alt="Nuvex" className="h-9 w-auto" />
              </button>
              <p
                className="text-sm mt-3 leading-relaxed"
                style={{ color: "rgba(255,255,255,0.72)" }}
              >
                {t("footer.brand_blurb")}
              </p>
            </div>

            {/* Quick links — full nav set, matching MainNav's NAV_ITEMS
                (same enabled/disabled state + "Soon" badge). "Search
                Flights" now links straight to /flights, no scroll. */}
            <div>
              <h4
                className="text-xs font-semibold tracking-wide mb-4"
                style={{ color: "#FFFFFF" }}
              >
                {t("footer.quick_links")}
              </h4>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <button
                    type="button"
                    onClick={() => onNavigate?.("home")}
                    className="transition-colors hover:text-white"
                    style={{ color: "rgba(255,255,255,0.72)" }}
                  >
                    {t("common.search_flights")}
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => onNavigate?.("how-it-works")}
                    className="transition-colors hover:text-white"
                    style={{ color: "rgba(255,255,255,0.72)" }}
                  >
                    {t("footer.how_it_works")}
                  </button>
                </li>

                {FOOTER_NAV_ITEMS.filter((item) => item.key !== "flights").map((item) => {
                  const Icon = item.icon
                  const label = t(item.labelKey, { defaultValue: item.label })
                  return (
                    <li key={item.key}>
                      <button
                        type="button"
                        onClick={() => handleNavItem(item)}
                        disabled={!item.enabled}
                        className="flex items-center gap-1.5 transition-colors"
                        style={{
                          color: item.enabled ? "rgba(255,255,255,0.72)" : "rgba(255,255,255,0.4)",
                          cursor: item.enabled ? "pointer" : "default",
                        }}
                        onMouseEnter={(e) => {
                          if (item.enabled) e.currentTarget.style.color = "#FFFFFF"
                        }}
                        onMouseLeave={(e) => {
                          if (item.enabled) e.currentTarget.style.color = "rgba(255,255,255,0.72)"
                        }}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{label}</span>
                        {!item.enabled && (
                          <span
                            className="ml-1 text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full border"
                            style={{ color: "rgba(255,255,255,0.6)", borderColor: "rgba(255,255,255,0.25)" }}
                          >
                            Soon
                          </span>
                        )}
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>

            {/* Legal & Trust */}
            <div>
              <h4
                className="text-xs font-semibold tracking-wide mb-4"
                style={{ color: "#FFFFFF" }}
              >
                {t("footer.legal_trust")}
              </h4>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <button
                    type="button"
                    onClick={() => onNavigate?.("terms")}
                    className="transition-colors hover:text-white"
                    style={{ color: "rgba(255,255,255,0.72)" }}
                  >
                    {t("footer.terms_of_service")}
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => onNavigate?.("privacy")}
                    className="transition-colors hover:text-white"
                    style={{ color: "rgba(255,255,255,0.72)" }}
                  >
                    {t("footer.privacy_policy")}
                  </button>
                </li>
                <li
                  className="text-xs pt-1"
                  style={{ color: "rgba(255,255,255,0.5)" }}
                >
                  {t("footer.powered_by")}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </footer>

      {/* ── White strip: language selector + copyright ── */}
      <div className="bg-white" style={{ borderTop: "1px solid var(--nuvex-border)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">

          <div className="text-xs order-2 sm:order-1" style={{ color: "var(--nuvex-slate)" }}>
            {t("common.copyright")}
          </div>

          <div className="relative order-1 sm:order-2" ref={langRef}>
            <button
              onClick={() => setLangOpen(!langOpen)}
              className="flex items-center gap-1.5 text-xs py-1 transition-colors"
              style={{ color: "var(--nuvex-slate)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--nuvex-ink)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--nuvex-slate)")}
            >
              <FlagIcon country={selectedLang.country} label={selectedLang.label} />
              <span>{t(`languages.${selectedLang.code}`, { defaultValue: selectedLang.label })}</span>
              <ChevronDown
                className="w-3.5 h-3.5 transition-transform duration-200"
                style={{ transform: langOpen ? "rotate(180deg)" : "rotate(0deg)" }}
              />
            </button>

            <AnimatePresence>
              {langOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 sm:left-0 bottom-full mb-1 w-40 rounded-lg border overflow-hidden shadow-xl z-50"
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
    </div>
  )
}