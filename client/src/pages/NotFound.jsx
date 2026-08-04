import { useTranslation } from "react-i18next"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import { Plane } from "lucide-react"

const CONTAINER = "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"

export default function NotFound({ onSearch, onNavigate }) {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900">
      <Navbar onSearch={onSearch} onNavigate={onNavigate} />

      <div className={`flex-1 pt-28 pb-16 flex flex-col items-center justify-center text-center ${CONTAINER}`}>
        <Plane className="w-12 h-12 text-cyan-500 mb-4" strokeWidth={1.5} />

        <h1
          className="text-6xl font-bold tracking-tight text-slate-900"
          style={{ fontFamily: "var(--font-display)" }}
        >
          404
        </h1>

        <p className="mt-3 text-lg font-medium text-slate-700">
          {t("notFound.title")}
        </p>
        <p className="mt-2 text-sm text-slate-500 max-w-md">
          {t("notFound.subtitle")}
        </p>

        <button
          type="button"
          onClick={() => onNavigate("home")}
          className="mt-8 px-6 py-2.5 rounded-full bg-cyan-500 hover:bg-cyan-600 text-white text-sm font-medium transition-colors"
        >
          {t("notFound.back_home")}
        </button>
      </div>

      <Footer onNavigate={onNavigate} />
    </div>
  )
}