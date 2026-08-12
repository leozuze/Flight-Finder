import { useEffect } from "react"
import { useTranslation } from "react-i18next"
import Footer from "@/components/Footer"

const CONTAINER = "max-w-3xl mx-auto px-4 sm:px-6 lg:px-8"

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

export default function PrivacyPolicy({ onNavigate }) {
  useNuvexFonts()
  const { t } = useTranslation()

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ ...NUVEX_THEME, background: "var(--nuvex-bg)", color: "var(--nuvex-ink)", fontFamily: "var(--nuvex-body)" }}
    >
      <div className={`flex-1 pt-16 pb-16 ${CONTAINER}`}>
        <h1
          className="text-3xl font-semibold tracking-tight"
          style={{ fontFamily: "var(--nuvex-display)", color: "var(--nuvex-ink)" }}
        >
          {t("privacy.title")}
        </h1>
        <p className="mt-2 text-sm" style={{ color: "var(--nuvex-slate)" }}>
          {t("privacy.last_updated")}
        </p>

        <div className="mt-10 space-y-8 leading-relaxed" style={{ color: "var(--nuvex-slate)" }}>
          {[1, 2, 3, 4, 5, 6, 7].map((n) => (
            <section key={n}>
              <h2 className="text-lg font-semibold mb-2" style={{ color: "var(--nuvex-ink)" }}>
                {t(`privacy.section${n}_title`)}
              </h2>
              <p>{t(`privacy.section${n}_body`)}</p>
            </section>
          ))}
        </div>
      </div>

      <Footer onNavigate={onNavigate} />
    </div>
  )
}