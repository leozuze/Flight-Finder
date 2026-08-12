import { useEffect } from "react"
import { useTranslation } from "react-i18next"
import Footer from "@/components/Footer"
import { Search, Bell, Compass } from "lucide-react"

const CONTAINER = "max-w-4xl mx-auto px-4 sm:px-6 lg:px-8"

const NUVEX_THEME = {
  "--nuvex-bg": "#FFFFFF",
  "--nuvex-border": "#E4E7EC",
  "--nuvex-ink": "#10131A",
  "--nuvex-slate": "#64707D",
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

export default function HowItWorks({ onNavigate }) {
  useNuvexFonts()
  const { t } = useTranslation()

  const steps = [
    { icon: Search, title: t("howItWorks.step1_title"), description: t("howItWorks.step1_description") },
    { icon: Bell, title: t("howItWorks.step2_title"), description: t("howItWorks.step2_description") },
    { icon: Compass, title: t("howItWorks.step3_title"), description: t("howItWorks.step3_description") },
  ]

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ ...NUVEX_THEME, background: "var(--nuvex-bg)", color: "var(--nuvex-ink)", fontFamily: "var(--nuvex-body)" }}
    >
      <div className={`flex-1 pt-16 pb-16 ${CONTAINER}`}>
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h1
            className="text-3xl sm:text-4xl font-semibold tracking-tight"
            style={{ fontFamily: "var(--nuvex-display)", color: "var(--nuvex-ink)" }}
          >
            {t("howItWorks.title")}
          </h1>
          <p className="mt-3 text-base" style={{ color: "var(--nuvex-slate)" }}>
            {t("howItWorks.subtitle")}
          </p>
        </div>

        <div className="space-y-10">
          {steps.map((step, i) => (
            <div key={i} className="flex gap-5 items-start">
              <div
                className="shrink-0 w-12 h-12 rounded-full flex items-center justify-center"
                style={{ background: "rgba(23,184,196,0.10)", border: "1px solid rgba(23,184,196,0.35)" }}
              >
                <step.icon className="w-5 h-5" style={{ color: "var(--nuvex-accent)" }} />
              </div>
              <div>
                <h2 className="text-lg font-semibold" style={{ color: "var(--nuvex-ink)" }}>
                  {i + 1}. {step.title}
                </h2>
                <p className="mt-1.5 leading-relaxed" style={{ color: "var(--nuvex-slate)" }}>
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 pt-10 text-center" style={{ borderTop: "1px solid var(--nuvex-border)" }}>
          <h3 className="text-lg font-semibold" style={{ color: "var(--nuvex-ink)" }}>
            {t("howItWorks.cta_title")}
          </h3>
          <p className="mt-2 text-sm" style={{ color: "var(--nuvex-slate)" }}>
            {t("howItWorks.cta_subtitle")}
          </p>
          <button
            type="button"
            onClick={() => onNavigate?.("home")}
            className="mt-5 inline-flex items-center justify-center text-white rounded-full px-6 py-2.5 text-sm font-medium transition-colors"
            style={{ background: "var(--nuvex-accent)" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--nuvex-accent-hover)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "var(--nuvex-accent)")}
          >
            {t("howItWorks.cta_button")}
          </button>
        </div>
      </div>

      <Footer onNavigate={onNavigate} />
    </div>
  )
}