import { useTranslation } from "react-i18next"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import { Search, Bell, PlaneTakeoff } from "lucide-react"

const CONTAINER = "max-w-4xl mx-auto px-4 sm:px-6 lg:px-8"

export default function HowItWorks({ onSearch, onNavigate }) {
  const { t } = useTranslation()

  const steps = [
    {
      icon: Search,
      title: t("howItWorks.step1_title"),
      description: t("howItWorks.step1_description"),
    },
    {
      icon: Bell,
      title: t("howItWorks.step2_title"),
      description: t("howItWorks.step2_description"),
    },
    {
      icon: PlaneTakeoff,
      title: t("howItWorks.step3_title"),
      description: t("howItWorks.step3_description"),
    },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900">
      <Navbar onSearch={onSearch} onNavigate={onNavigate} />

      <div className={`flex-1 pt-28 pb-16 ${CONTAINER}`}>
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h1
            className="text-3xl sm:text-4xl font-semibold tracking-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {t("howItWorks.title")}
          </h1>
          <p className="mt-3 text-slate-500 text-base">
            {t("howItWorks.subtitle")}
          </p>
        </div>

        <div className="space-y-10">
          {steps.map((step, i) => (
            <div key={i} className="flex gap-5 items-start">
              <div className="shrink-0 w-12 h-12 rounded-full bg-cyan-50 border border-cyan-200 flex items-center justify-center">
                <step.icon className="w-5 h-5 text-cyan-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  {i + 1}. {step.title}
                </h2>
                <p className="mt-1.5 text-slate-600 leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 border-t border-slate-200 pt-10 text-center">
          <h3 className="text-lg font-semibold text-slate-900">{t("howItWorks.cta_title")}</h3>
          <p className="mt-2 text-slate-500 text-sm">
            {t("howItWorks.cta_subtitle")}
          </p>
          <button
            type="button"
            onClick={() => onNavigate?.("home")}
            className="mt-5 inline-flex items-center justify-center bg-cyan-500 hover:bg-cyan-600 text-white rounded-full px-6 py-2.5 text-sm font-medium transition-colors"
          >
            {t("howItWorks.cta_button")}
          </button>
        </div>
      </div>

      <Footer onNavigate={onNavigate} />
    </div>
  )
}