import { useEffect } from "react"
import { useTranslation } from "react-i18next"
import { motion } from "framer-motion"
import Footer from "@/components/Footer"
import { Compass, MapPin } from "lucide-react"

const CONTAINER = "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"

const NUVEX_THEME = {
  "--nuvex-bg": "#FFFFFF",
  "--nuvex-border": "#E4E7EC",
  "--nuvex-ink": "#10131A",
  "--nuvex-slate": "#64707D",
  "--nuvex-signal": "#E8A33D",
  "--nuvex-accent": "#17B8C4",
  "--nuvex-accent-hover": "#149AA5",
  "--nuvex-display": "'Bricolage Grotesque', 'Segoe UI', sans-serif",
  "--nuvex-body": "'IBM Plex Sans', 'Segoe UI', sans-serif",
}

function useNuvexFonts() {
  useEffect(() => {
    if (document.getElementById("hero-fonts")) return
    const link = document.createElement("link")
    link.id = "hero-fonts"
    link.rel = "stylesheet"
    link.href =
      "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@400..800&family=IBM+Plex+Sans:wght@400;500;600&display=swap"
    document.head.appendChild(link)
  }, [])
}

function LostCompass() {
  return (
    <div className="relative w-24 h-24 mb-6 flex items-center justify-center">
      <div
        className="absolute inset-0 rounded-full"
        style={{ border: "1px dashed color-mix(in srgb, var(--nuvex-accent) 45%, transparent)" }}
      />
      <motion.div
        animate={{ rotate: [-12, 10, -6, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      >
        <Compass className="w-11 h-11" style={{ color: "var(--nuvex-accent)" }} strokeWidth={1.5} />
      </motion.div>
      <motion.div
        className="absolute"
        style={{ top: -6, right: -2 }}
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <MapPin className="w-5 h-5" style={{ color: "var(--nuvex-signal)" }} fill="var(--nuvex-signal)" fillOpacity={0.15} />
      </motion.div>
    </div>
  )
}

export default function NotFound({ onNavigate }) {
  useNuvexFonts()
  const { t } = useTranslation()

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ ...NUVEX_THEME, background: "var(--nuvex-bg)", color: "var(--nuvex-ink)", fontFamily: "var(--nuvex-body)" }}
    >
      <div className={`flex-1 pt-16 pb-16 flex flex-col items-center justify-center text-center ${CONTAINER}`}>
        <LostCompass />

        <h1
          className="text-6xl font-bold tracking-tight"
          style={{ fontFamily: "var(--nuvex-display)", color: "var(--nuvex-ink)" }}
        >
          404
        </h1>

        <p className="mt-3 text-lg font-medium" style={{ color: "var(--nuvex-ink)" }}>
          {t("notFound.title")}
        </p>
        <p className="mt-2 text-sm max-w-md" style={{ color: "var(--nuvex-slate)" }}>
          {t("notFound.subtitle")}
        </p>

        <button
          type="button"
          onClick={() => onNavigate("home")}
          className="mt-8 px-6 py-2.5 rounded-full text-white text-sm font-medium transition-colors"
          style={{ background: "var(--nuvex-accent)" }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--nuvex-accent-hover)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "var(--nuvex-accent)")}
        >
          {t("notFound.back_home")}
        </button>
      </div>

      <Footer onNavigate={onNavigate} />
    </div>
  )
}