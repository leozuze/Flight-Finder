import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import { Search, Bell, PlaneTakeoff } from "lucide-react"

const CONTAINER = "max-w-4xl mx-auto px-4 sm:px-6 lg:px-8"

const steps = [
  {
    icon: Search,
    title: "Search your route",
    description:
      "Tell us where you're flying from and to, along with your budget and travel dates. We scan live fares across airlines instantly.",
  },
  {
    icon: Bell,
    title: "We watch the fares for you",
    description:
      "Once your search is saved, SkyScout keeps an eye on that route. The moment a fare drops within your budget, you're the first to know.",
  },
  {
    icon: PlaneTakeoff,
    title: "Book with confidence",
    description:
      "Get notified by email the instant a matching deal appears, so you can book before the price disappears.",
  },
]

export default function HowItWorks({ onSearch, onNavigate }) {
  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900">
      <Navbar onSearch={onSearch} onNavigate={onNavigate} />

      <div className={`flex-1 pt-28 pb-16 ${CONTAINER}`}>
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h1
            className="text-3xl sm:text-4xl font-semibold tracking-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            How SkyScout works
          </h1>
          <p className="mt-3 text-slate-500 text-base">
            Finding the right fare shouldn't take hours of refreshing tabs. Here's how we do the watching for you.
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
          <h3 className="text-lg font-semibold text-slate-900">Ready to find your next fare?</h3>
          <p className="mt-2 text-slate-500 text-sm">
            Head back to search and set up your first price alert in under a minute.
          </p>
          <button
            type="button"
            onClick={() => onNavigate?.("home")}
            className="mt-5 inline-flex items-center justify-center bg-cyan-500 hover:bg-cyan-600 text-white rounded-full px-6 py-2.5 text-sm font-medium transition-colors"
          >
            Start searching
          </button>
        </div>
      </div>

      <Footer onNavigate={onNavigate} />
    </div>
  )
}