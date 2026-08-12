import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { motion, AnimatePresence } from "framer-motion"

const STEP_KEYS = [
  "placesSearch.step_locating_area",
  "placesSearch.step_scanning_categories",
  "placesSearch.step_gathering_details",
  "placesSearch.step_finalizing",
]

const LAST_STEP = STEP_KEYS.length - 1
const STEP_DURATION_MS = 1400 // how long each of the first steps shows before moving to the next

export default function PlacesProgressSteps({ active, cardCount = 6 }) {
  const { t } = useTranslation()
  const [stepIndex, setStepIndex] = useState(0)

  useEffect(() => {
    if (!active) return undefined
    setStepIndex(0)

    let cancelled = false
    let timeoutId

    const advance = (i) => {
      if (i >= LAST_STEP) return // last step waits on `active`, not a timer
      timeoutId = setTimeout(() => {
        if (cancelled) return
        setStepIndex(i + 1)
        advance(i + 1)
      }, STEP_DURATION_MS)
    }

    advance(0)

    return () => {
      cancelled = true
      clearTimeout(timeoutId)
    }
  }, [active])

  return (
    <div className="py-4 flex flex-col items-center gap-6">
      <AnimatePresence mode="wait">
        <motion.div
          key={stepIndex}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.25 }}
          className="flex items-center gap-2.5 text-sm"
        >
          <span className="w-5 h-5 flex items-center justify-center gap-0.5 shrink-0">
            {[0, 1, 2].map((d) => (
              <span
                key={d}
                className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-bounce"
                style={{ animationDelay: `${d * 150}ms`, animationDuration: "900ms" }}
              />
            ))}
          </span>
          <span className="text-slate-700 font-medium">{t(STEP_KEYS[stepIndex])}</span>
        </motion.div>
      </AnimatePresence>

      {/* card-shaped skeletons, dimming/brightening in a staggered wave to
          mirror the real PlaceCard layout (photo, category pill, name,
          address, distance) so there's no visual jump when results land */}
      <div className="w-full grid sm:grid-cols-2 gap-4">
        {Array.from({ length: cardCount }).map((_, i) => (
          <div
            key={i}
            className="h-64 rounded-2xl overflow-hidden border"
            style={{ borderColor: "#E4E7EC", background: "#FFFFFF" }}
          >
            <div
              className="h-32 w-full animate-pulse"
              style={{ background: "#E4E7EC", animationDelay: `${i * 100}ms` }}
            />
            <div className="p-4 flex flex-col gap-2">
              <div
                className="h-4 w-16 rounded-full animate-pulse"
                style={{ background: "#E4E7EC", animationDelay: `${i * 100 + 50}ms` }}
              />
              <div
                className="h-3.5 w-3/4 rounded animate-pulse"
                style={{ background: "#E4E7EC", animationDelay: `${i * 100 + 100}ms` }}
              />
              <div
                className="h-3 w-full rounded animate-pulse"
                style={{ background: "#E4E7EC", animationDelay: `${i * 100 + 150}ms` }}
              />
              <div
                className="h-3 w-1/3 rounded animate-pulse"
                style={{ background: "#E4E7EC", animationDelay: `${i * 100 + 200}ms` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}