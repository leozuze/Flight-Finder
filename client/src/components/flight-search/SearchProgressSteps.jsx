import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { motion, AnimatePresence } from "framer-motion"
import { Check, Loader2 } from "lucide-react"

const STEP_KEYS = [
  "flightSearch.step_search_routes",
  "flightSearch.step_compare_prices",
  "flightSearch.step_check_availability",
  "flightSearch.step_finalizing",
]

const LAST_STEP = STEP_KEYS.length - 1

const STEP_DURATION_MS = 1400 // how long each of the first steps spins before ticking
const CHECK_HOLD_MS = 450 // how long a tick shows before the next step fades in

// Column shapes for the skeleton rows, sized to roughly match the real
// tables so the loading state doesn't jump when results replace it.
const SKELETON_VARIANTS = {
  flights: { cols: [22, "auto", 14, 20, 14, 14, 12], hasLeadingIcon: true, trailingAlign: "right" },
  airport: { cols: [14, 22, "auto", 14, 14, 14, 12], hasLeadingIcon: true, trailingAlign: "left" },
}

export default function SearchProgressSteps({ active, variant = "flights" }) {
  const { t } = useTranslation()
  const [stepIndex, setStepIndex] = useState(0)
  const [showCheck, setShowCheck] = useState(false)

  useEffect(() => {
    if (!active) {
      
      setStepIndex(LAST_STEP)
      setShowCheck(true)
      return undefined
    }

    setStepIndex(0)
    setShowCheck(false)

    let cancelled = false
    let timeoutId

    const advance = (i) => {
      // Once we reach the last step, stop scheduling anything — it waits
      // indefinitely for `active` to go false instead of a fixed timeout.
      if (i >= LAST_STEP) return

      timeoutId = setTimeout(() => {
        if (cancelled) return
        setShowCheck(true)
        timeoutId = setTimeout(() => {
          if (cancelled) return
          setStepIndex(i + 1)
          setShowCheck(false)
          advance(i + 1)
        }, CHECK_HOLD_MS)
      }, STEP_DURATION_MS)
    }

    advance(0)

    return () => {
      cancelled = true
      clearTimeout(timeoutId)
    }
  }, [active])

  const isLastStep = stepIndex === LAST_STEP
  const waitingOnResults = isLastStep && !showCheck
  const { cols, hasLeadingIcon, trailingAlign } = SKELETON_VARIANTS[variant] || SKELETON_VARIANTS.flights

  return (
    <div className="py-10 flex flex-col items-center gap-8">
      <AnimatePresence mode="wait">
        <motion.div
          key={stepIndex}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.25 }}
          className="flex items-center gap-2.5 text-sm"
        >
          {showCheck ? (
            <motion.span
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className="w-5 h-5 rounded-full bg-cyan-500 flex items-center justify-center shrink-0"
            >
              <Check className="w-3 h-3 text-white" strokeWidth={3} />
            </motion.span>
          ) : waitingOnResults ? (
            <span className="w-5 h-5 flex items-center justify-center gap-0.5 shrink-0">
              {[0, 1, 2].map((d) => (
                <span
                  key={d}
                  className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-bounce"
                  style={{ animationDelay: `${d * 150}ms`, animationDuration: "900ms" }}
                />
              ))}
            </span>
          ) : (
            <Loader2 className="w-5 h-5 text-cyan-500 animate-spin shrink-0" />
          )}
          <span className="text-slate-700 font-medium">{t(STEP_KEYS[stepIndex])}</span>
        </motion.div>
      </AnimatePresence>

      {/* skeleton rows shaped like the real table columns, pulsing dim/bright */}
      <div className="w-full max-w-3xl flex flex-col gap-2">
        {[0, 1, 2].map((row) => (
          <div
            key={row}
            className={`flex items-center gap-3 border border-slate-100 rounded-lg px-4 py-3 ${
              row % 2 === 1 && variant === "airport" ? "bg-sky-50/50" : "bg-white"
            }`}
          >
            {cols.map((width, c) => (
              <div
                key={c}
                className="flex items-center gap-2"
                style={{ flex: width === "auto" ? "1 1 auto" : `0 0 ${width}%` }}
              >
                {hasLeadingIcon && c === (variant === "airport" ? 1 : 0) && (
                  <div
                    className="w-4 h-4 rounded-full bg-slate-200 animate-pulse shrink-0"
                    style={{ animationDelay: `${row * 150}ms` }}
                  />
                )}
                <div
                  className={`h-2.5 rounded bg-slate-200 animate-pulse w-full ${
                    c === cols.length - 1 && trailingAlign === "right" ? "ml-auto" : ""
                  }`}
                  style={{
                    maxWidth: c === cols.length - 1 ? "70%" : "90%",
                    animationDelay: `${row * 150 + c * 40}ms`,
                  }}
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}