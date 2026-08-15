import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import { useTranslation } from "react-i18next"
import { Compass } from "lucide-react"
import { MEDIA_POOL } from "@/data/heroMedia"

const HERO_ROTATE_MS = 5000
const TILE_COUNT = 6
const loadedCache = new Set()

function pickRandomTiles(pool, count) {
  return [...pool].sort(() => Math.random() - 0.5).slice(0, count)
}

function HeroMediaAsset({ item }) {
  const [loaded, setLoaded] = useState(() => loadedCache.has(item.src))
  const videoRef = useRef(null)

  const markLoaded = () => {
    loadedCache.add(item.src)
    setLoaded(true)
  }

  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    v.play().catch(() => {})
    return () => v.pause()
  }, [])

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
          preload="auto"
          onLoadedData={markLoaded}
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

export default function ExploreHero({ originLabel, originCode }) {
  const { t } = useTranslation()
  const reduceMotion = useReducedMotion()
  const [tiles] = useState(() => pickRandomTiles(MEDIA_POOL, TILE_COUNT))
  const [active, setActive] = useState(0)

  useEffect(() => {
    if (reduceMotion) return
    const id = setInterval(() => setActive((i) => (i + 1) % tiles.length), HERO_ROTATE_MS)
    return () => clearInterval(id)
  }, [reduceMotion, tiles.length])

  const currentTile = tiles[active]

  return (
    <section className="relative w-full h-[280px] sm:h-[360px] rounded-2xl overflow-hidden mb-8" style={{ background: "#070B12" }}>
      {/* Single active tile, keyed on its own src — AnimatePresence only
          ever tracks one child at a time, so there's no window where two
          tiles briefly coexist mid-transition (the cause of the "2 tiles
          then 1" flash, worsened by React 19 StrictMode's dev-only
          double-mount). */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentTile.src}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0"
        >
          <HeroMediaAsset item={currentTile} />
        </motion.div>
      </AnimatePresence>

      <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, rgba(7,11,18,0.85) 0%, rgba(7,11,18,0.35) 60%, rgba(7,11,18,0.15) 100%)" }} />

      <div className="relative z-10 h-full flex flex-col justify-center px-6 sm:px-10 max-w-lg">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-[0.2em] uppercase mb-3" style={{ color: "#17B8C4" }}>
          <Compass className="w-3.5 h-3.5" />
          {t("explore.kicker", { defaultValue: "Explore" })}
        </span>
        <h1 className="text-2xl sm:text-3xl font-semibold leading-tight mb-2" style={{ fontFamily: "'Bricolage Grotesque', sans-serif", color: "#F4F6F8" }}>
          {t("explore.title", { defaultValue: "Where to next?" })}
        </h1>
        <p className="text-sm" style={{ color: "#8B96A5" }}>
          {originCode
            ? t("explore.subtitle_with_origin", { defaultValue: `Cheap flights and places to explore, flying from ${originLabel} (${originCode})`, city: originLabel, code: originCode })
            : t("explore.subtitle_loading", { defaultValue: "Finding your nearest airport..." })}
        </p>
      </div>
    </section>
  )
}