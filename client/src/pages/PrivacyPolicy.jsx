import { useTranslation } from "react-i18next"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"

const CONTAINER = "max-w-3xl mx-auto px-4 sm:px-6 lg:px-8"

export default function PrivacyPolicy({ onSearch, onNavigate }) {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900">
      <Navbar onSearch={onSearch} onNavigate={onNavigate} />

      <div className={`flex-1 pt-28 pb-16 ${CONTAINER}`}>
        <h1
          className="text-3xl font-semibold tracking-tight"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {t("privacy.title")}
        </h1>
        <p className="mt-2 text-sm text-slate-400">{t("privacy.last_updated")}</p>

        <div className="mt-10 space-y-8 text-slate-700 leading-relaxed">
          {[1, 2, 3, 4, 5, 6, 7].map((n) => (
            <section key={n}>
              <h2 className="text-lg font-semibold text-slate-900 mb-2">
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