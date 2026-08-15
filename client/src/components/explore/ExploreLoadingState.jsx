import { useEffect, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { motion, AnimatePresence } from "framer-motion"
import { MEDIA_POOL } from "@/data/heroMedia"

const STEP_KEYS = [
  "explore.step_locating_airport",
  "explore.step_checking_fares",
  "explore.step_gathering_highlights",
  "explore.step_finalizing",
]
const STEP_DEFAULTS = [
  "Finding your nearest airport",
  "Checking live fares across routes",
  "Gathering local highlights",
  "Almost there...",
]

const LAST_STEP = STEP_KEYS.length - 1
const STEP_DURATION_MS = 1600
const TILE_COUNT = 5
const TILE_DURATION_MS = 2400

// Module-scope, same reasoning as Hero.jsx's loadedCache — survives this
// component unmounting/remounting (e.g. leaving Explore and coming back)
// so cached media doesn't replay its placeholder fade unnecessarily.
const loadedCache = new Set()

function pickRandomTiles(pool, count) {
  return [...pool].sort(() => Math.random() - 0.5).slice(0, count)
}

function LoadingMediaAsset({ item, isActive }) {
  const [loaded, setLoaded] = useState(() => loadedCache.has(item.src))
  const videoRef = useRef(null)

  const markLoaded = () => {
    loadedCache.add(item.src)
    setLoaded(true)
  }

  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    if (isActive) v.play().catch(() => {})
    else v.pause()
  }, [isActive])

  return (
    <div className="absolute inset-0">
      <div
        className="absolute inset-0 transition-opacity duration-500"
        style={{ opacity: loaded ? 0 : 1, background: "linear-gradient(135deg, rgba(244,246,248,0.08), rgba(244,246,248,0.02))" }}
      />
      {item.type === "video" ? (
        <video
          ref={videoRef}
          src={item.src}
          poster={item.poster}
          muted
          loop
          playsInline
          preload={isActive ? "auto" : "metadata"}
          onLoadedData={markLoaded}
          onError={() => console.error("[Explore] video failed to load:", item.src)}
          className="w-full h-full object-cover"
        />
      ) : (
        <img
          src={item.src}
          alt={item.alt}
          decoding="async"
          onLoad={markLoaded}
          className="w-full h-full object-cover transition-opacity duration-700 ease-out"
          style={{ opacity: loaded ? 1 : 0 }}
        />
      )}
    </div>
  )
}

export default function ExploreLoadingState({ cardCount = 6 }) {
  const { t } = useTranslation()
  const [stepIndex, setStepIndex] = useState(0)
  const [tiles] = useState(() => pickRandomTiles(MEDIA_POOL, TILE_COUNT))
  const [activeTile, setActiveTile] = useState(0)

  useEffect(() => {
    let cancelled = false
    let timeoutId
    const advance = (i) => {
      if (i >= LAST_STEP) return // last step waits on the real request, not a timer
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
  }, [])

  useEffect(() => {
    const id = setInterval(() => setActiveTile((i) => (i + 1) % tiles.length), TILE_DURATION_MS)
    return () => clearInterval(id)
  }, [tiles.length])

  return (
    <div className="flex flex-col gap-6">
      <div className="relative w-full h-[320px] sm:h-[420px] rounded-2xl overflow-hidden" style={{ background: "#0A0F1E" }}>
        <AnimatePresence mode="wait">
          {tiles.map((tile, i) =>
            i === activeTile ? (
              <motion.div
                key={tile.src}
                initial={{ opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0"
              >
                <LoadingMediaAsset item={tile} isActive />
              </motion.div>
            ) : null
          )}
        </AnimatePresence>

        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(180deg, rgba(10,15,30,0.1) 45%, rgba(10,15,30,0.8) 100%)" }}
        />

        <div className="absolute inset-0 flex flex-col items-center justify-end pb-8 px-6 text-center">
          <span className="w-5 h-5 flex items-center justify-center gap-0.5 mb-3">
            {[0, 1, 2].map((d) => (
              <span
                key={d}
                className="w-1.5 h-1.5 rounded-full animate-bounce"
                style={{ background: "#E8A33D", animationDelay: `${d * 150}ms`, animationDuration: "900ms" }}
              />
            ))}
          </span>
          <AnimatePresence mode="wait">
            <motion.p
              key={stepIndex}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
              className="text-sm font-medium text-white/90"
            >
              {t(STEP_KEYS[stepIndex], { defaultValue: STEP_DEFAULTS[stepIndex] })}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>

      {/* skeleton cards shaped like ExploreDestinationCard (photo, price
          corner, footer rows) so real results don't cause a layout jump */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: cardCount }).map((_, i) => (
          <div key={i} className="rounded-2xl overflow-hidden border" style={{ borderColor: "#E4E7EC", background: "#FFFFFF" }}>
            <div className="h-36 w-full animate-pulse" style={{ background: "#E4E7EC", animationDelay: `${i * 100}ms` }} />
            <div className="p-3 flex flex-col gap-2">
              <div className="h-3.5 w-2/3 rounded animate-pulse" style={{ background: "#E4E7EC", animationDelay: `${i * 100 + 60}ms` }} />
              <div className="h-3 w-1/2 rounded animate-pulse" style={{ background: "#E4E7EC", animationDelay: `${i * 100 + 120}ms` }} />
              <div className="h-3 w-1/3 rounded animate-pulse" style={{ background: "#E4E7EC", animationDelay: `${i * 100 + 180}ms` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}