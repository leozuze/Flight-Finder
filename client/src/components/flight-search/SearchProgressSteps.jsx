import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { Check } from "lucide-react"

const STEP_KEYS = [
  "flightSearch.step_search_routes",
  "flightSearch.step_compare_prices",
  "flightSearch.step_check_availability",
  "flightSearch.step_finalizing",
]

const STEP_DURATION_MS = 1400

// Cycles through step labels while `active` is true, holding on the last
// step (all checked) once `active` goes false. Whether this component is
// shown or hidden at all is controlled by the parent via useDelayedLoading —
// that's where the "hold before disappearing" timing lives.
export default function SearchProgressSteps({ active }) {
  const { t } = useTranslation()
  const [stepIndex, setStepIndex] = useState(0)

  useEffect(() => {
    if (!active) return undefined
    setStepIndex(0)
    const interval = setInterval(() => {
      setStepIndex((i) => Math.min(i + 1, STEP_KEYS.length - 1))
    }, STEP_DURATION_MS)
    return () => clearInterval(interval)
  }, [active])

  return (
    <div className="py-10 flex flex-col items-center gap-2.5">
      {STEP_KEYS.map((key, i) => {
        const done = !active || i < stepIndex
        const current = active && i === stepIndex

        return (
          <div key={key} className="flex items-center gap-2 text-sm">
            {done ? (
              <Check className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
            ) : (
              <span
                className={`w-3.5 h-3.5 rounded-full border-2 shrink-0 ${
                  current ? "border-cyan-500 animate-pulse" : "border-slate-200"
                }`}
              />
            )}
            <span className={done || current ? "text-slate-700" : "text-slate-400"}>
              {t(key)}
            </span>
          </div>
        )
      })}
    </div>
  )
}