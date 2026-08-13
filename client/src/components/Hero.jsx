import { useEffect, useMemo, useRef, useState } from "react"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import { useTranslation } from "react-i18next"
import { Plane, ArrowRight } from "lucide-react"

// ── Media (now Cloudinary-hosted, see src/data/heroMedia.js) ────────────
import { MEDIA_POOL, EARTH } from "@/data/heroMedia"

const HERO_THEME = {
  "--hero-bg": "#070B12",
  "--hero-ink": "#F4F6F8",
  "--hero-slate": "#8B96A5",
  "--hero-accent": "#17B8C4",
  "--hero-ocean": "#0B4F6C",
  "--hero-signal": "#E8A33D",
  "--hero-display": "'Bricolage Grotesque', 'Segoe UI', sans-serif",
  "--hero-body": "'IBM Plex Sans', 'Segoe UI', sans-serif",
}

const BENTO_AREAS = `"a a b" "a a c" "d e c" "d f f"`

const SLOTS = [
  { id: "a", from: "left" },
  { id: "b", from: "top" },
  { id: "c", from: "right" },
  { id: "d", from: "bottom" },
  { id: "e", from: "sink" },
  { id: "f", from: "bottom" },
]

const ENTER_FROM = {
  left: { x: -70, y: 0, scale: 1, opacity: 0 },
  right: { x: 70, y: 0, scale: 1, opacity: 0 },
  top: { x: 0, y: -60, scale: 1, opacity: 0 },
  bottom: { x: 0, y: 60, scale: 1, opacity: 0 },
  sink: { x: 0, y: -18, scale: 0.55, opacity: 0 },
}
const EXIT_TO = {
  left: { x: 70, y: 0, scale: 1, opacity: 0 },
  right: { x: -70, y: 0, scale: 1, opacity: 0 },
  top: { x: 0, y: 60, scale: 1, opacity: 0 },
  bottom: { x: 0, y: -60, scale: 1, opacity: 0 },
  sink: { x: 0, y: 18, scale: 0.6, opacity: 0 },
}

// ── CLOUDINARY ADDITION: module-scope cache ──────────────────────────────
// Lives OUTSIDE the component, so it survives Hero unmounting/remounting
// when the user navigates to /flights and back. Without this, every
// remount reset `loaded` to false and replayed the placeholder + fade-in,
// even though the browser's HTTP cache already had the bytes. It only
// resets on a hard page reload, which is exactly what you want.
const loadedCache = new Set()

// ── MediaAsset ─────────────────────────────────────────────────────────
function MediaAsset({ item, isActive }) {
  const [loaded, setLoaded] = useState(() => loadedCache.has(item.src))
  const videoRef = useRef(null)

  const markLoaded = () => {
    loadedCache.add(item.src)
    setLoaded(true)
  }

  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    if (isActive) {
      v.play().catch(() => {})
    } else {
      v.pause()
    }
  }, [isActive])

  return (
    <div className="absolute inset-0">
      <div
        className="absolute inset-0 transition-opacity duration-500"
        style={{
          opacity: loaded ? 0 : 1,
          background:
            "linear-gradient(135deg, rgba(244,246,248,0.08), rgba(244,246,248,0.02))",
        }}
      />
      {item.type === "video" ? (
        <video
          ref={videoRef}
          key={item.src}
          src={item.src}
          poster={item.poster}
          muted
          loop
          playsInline
          preload={isActive ? "auto" : "metadata"}
          onLoadedData={markLoaded}
          onError={() => console.error("[Hero] video failed to load:", item.src)}
          className="w-full h-full object-cover"
        />
      ) : (
        <img
          key={item.src}
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
function BentoTile({ slot, pool, activeIndex, reduceMotion }) {
  const enter = ENTER_FROM[slot.from]
  return (
    <div className="relative overflow-hidden rounded-[22px]" style={{ gridArea: slot.id }}>
      {pool.map((item, idx) => {
        const isActive = idx === activeIndex
        return (
          <motion.div
            key={item.src}
            className="absolute inset-0"
            style={{ willChange: "transform, opacity" }}
            initial={false}
            animate={
              reduceMotion
                ? { opacity: isActive ? 1 : 0 }
                : isActive
                ? { x: 0, y: 0, scale: 1, opacity: 1 }
                : { ...enter, opacity: 0 }
            }
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          >
            <MediaAsset item={item} isActive={isActive} />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(180deg, rgba(7,11,18,0) 55%, rgba(7,11,18,0.55) 100%)",
              }}
            />
            <div
              className="absolute inset-0 rounded-[22px]"
              style={{ boxShadow: "inset 0 0 0 1px rgba(244,246,248,0.08)" }}
            />
          </motion.div>
        )
      })}
    </div>
  )
}
function OrbitRing({ size, duration, direction, dashed, children }) {
  return (
    <motion.div
      className="absolute left-1/2 top-1/2 rounded-full"
      style={{
        width: size,
        height: size,

        marginLeft: `calc(${size} / -2)`,
        marginTop: `calc(${size} / -2)`,
        border: dashed ? "1px dashed rgba(244,246,248,0.18)" : "1px solid rgba(244,246,248,0.1)",
      }}
      animate={{ rotate: direction === "cw" ? 360 : -360 }}
      transition={{ duration, repeat: Infinity, ease: "linear" }}
    >
      {children}
    </motion.div>
  )
}

function EarthPhase({ reduceMotion, visible, videoRef }) {
  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center"
      style={{ pointerEvents: visible ? "auto" : "none" }}
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.8 }}
    >
      {!reduceMotion &&
        [0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{ border: "1px solid var(--hero-accent)" }}
            initial={{ width: 220, height: 220, opacity: 0.35 }}
            animate={{ width: 520, height: 520, opacity: 0 }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeOut", delay: i * 1.3 }}
          />
        ))}

      {!reduceMotion && (
  <>
    <OrbitRing size="420px" duration={42} direction="cw" dashed>
      <div
        className="absolute rounded-full flex items-center justify-center"
        style={{
          top: -14,
          left: "50%",
          marginLeft: -14,
          width: 28,
          height: 28,
          background: "var(--hero-signal)",
        }}
      >
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 42, repeat: Infinity, ease: "linear" }}
        >
          <Plane className="w-4 h-4" style={{ color: "var(--hero-bg)" }} />
        </motion.div>
      </div>
    </OrbitRing>
    <OrbitRing size="520px" duration={58} direction="ccw" />
  </>
)}

      <motion.div
        className="relative rounded-full overflow-hidden"
        style={{ width: 320, height: 320, boxShadow: "0 0 80px rgba(23,184,196,0.25)" }}
        animate={reduceMotion ? {} : { scale: [1, 1.03, 1] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        <video
          ref={videoRef}
          src={EARTH.src}
          poster={EARTH.poster}
          muted
          loop
          playsInline
          preload={visible ? "auto" : "metadata"}
          className="w-full h-full object-cover"
        />
      </motion.div>
    </motion.div>
  )
}

function AmbientBackground({ reduceMotion }) {
  const blobs = [
    { color: "var(--hero-accent)", size: 520, start: { x: "10%", y: "15%" } },
    { color: "var(--hero-signal)", size: 420, start: { x: "75%", y: "60%" } },
    { color: "var(--hero-ocean)", size: 600, start: { x: "55%", y: "5%" } },
  ]
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {blobs.map((b, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full blur-[110px] opacity-20"
          style={{
            width: b.size,
            height: b.size,
            left: b.start.x,
            top: b.start.y,
            background: b.color,
            willChange: "transform",
            transform: "translateZ(0)",
          }}
          animate={
            reduceMotion
              ? {}
              : {
                  x: [0, 60, -40, 0],
                  y: [0, -50, 30, 0],
                }
          }
          transition={{ duration: 22 + i * 6, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  )
}

function useHeroFonts() {
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

// ── CLOUDINARY ADDITION: preconnect so the very first request to
// res.cloudinary.com doesn't pay DNS + TLS handshake cost on top of the
// asset fetch itself. Runs once, guarded the same way as the fonts hook.
function useCloudinaryPreconnect() {
  useEffect(() => {
    if (document.getElementById("cloudinary-preconnect")) return
    const link = document.createElement("link")
    link.id = "cloudinary-preconnect"
    link.rel = "preconnect"
    link.href = "https://res.cloudinary.com"
    link.crossOrigin = "anonymous"
    document.head.appendChild(link)
  }, [])
}

// ── CLOUDINARY ADDITION: preload is now cheap. Images warm the real
// asset (they're already small thanks to c_fill/w_ in cldImage). Videos
// only warm their POSTER jpg — the actual video streams on demand when a
// tile becomes active, instead of downloading all 3 videos' full data on
// every page load like before.
function usePreloadMedia() {
  useEffect(() => {
    MEDIA_POOL.forEach((item) => {
      const img = new Image()
      img.decoding = "async"
      img.onload = () => loadedCache.add(item.type === "image" ? item.src : item.poster)
      img.src = item.type === "image" ? item.src : item.poster
    })
    const earthPoster = new Image()
    earthPoster.src = EARTH.poster
  }, [])
}

const COLLAGE_MS = 14000
const EARTH_MS = 7000
const SUBTITLE_MS = 5200
const SUBTITLE_KEYS = ["subtitle_1", "subtitle_2", "subtitle_3"]

const copyVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
}
const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
}

export default function Hero({ onExplore }) {
  useHeroFonts()
  useCloudinaryPreconnect()
  usePreloadMedia()
  const { t } = useTranslation()
  const reduceMotion = useReducedMotion()
  const [phase, setPhase] = useState("collage")
  const [slotIndices, setSlotIndices] = useState(SLOTS.map(() => 0))
  const [subtitleIndex, setSubtitleIndex] = useState(0)
  const timers = useRef([])
  const earthVideoRef = useRef(null)

  const slotPools = useMemo(
    () => SLOTS.map((_, i) => MEDIA_POOL.filter((_, mi) => mi % SLOTS.length === i)),
    []
  )

  useEffect(() => {
    if (reduceMotion) return
    timers.current.forEach(clearInterval)
    timers.current = SLOTS.map((_, i) => {
      const period = 3800 + i * 650
      return setInterval(() => {
        setSlotIndices((prev) => {
          const next = [...prev]
          next[i] = (next[i] + 1) % slotPools[i].length
          return next
        })
      }, period)
    })
    return () => timers.current.forEach(clearInterval)
  }, [reduceMotion, slotPools])

  useEffect(() => {
    if (reduceMotion) return
    const id = setInterval(() => {
      setPhase((p) => (p === "collage" ? "earth" : "collage"))
    }, phase === "collage" ? COLLAGE_MS : EARTH_MS)
    return () => clearInterval(id)
  }, [phase, reduceMotion])

  useEffect(() => {
    const v = earthVideoRef.current
    if (!v) return
    if (phase === "earth") v.play().catch(() => {})
    else v.pause()
  }, [phase])

  useEffect(() => {
    if (reduceMotion) return
    const id = setInterval(() => {
      setSubtitleIndex((i) => (i + 1) % SUBTITLE_KEYS.length)
    }, SUBTITLE_MS)
    return () => clearInterval(id)
  }, [reduceMotion])

  return (
    <section
      className="relative w-full min-h-[100svh] overflow-hidden flex items-center"
      style={{ ...HERO_THEME, background: "var(--hero-bg)", fontFamily: "var(--hero-body)" }}
    >
      <AmbientBackground reduceMotion={reduceMotion} />

      <div className="relative z-10 max-w-7xl mx-auto w-full px-6 sm:px-10 lg:px-16 grid lg:grid-cols-[0.85fr_1.15fr] gap-10 items-center">
        <motion.div className="max-w-lg" variants={copyVariants} initial="hidden" animate="show">
          <motion.span
            variants={itemVariants}
            className="inline-block text-xs font-semibold tracking-[0.2em] uppercase mb-5"
            style={{ color: "var(--hero-accent)" }}
          >
            {t("landingHero.kicker")}
          </motion.span>

          <motion.h1
            variants={itemVariants}
            className="text-4xl sm:text-5xl lg:text-[3.4rem] leading-[1.05] font-semibold mb-6"
            style={{ fontFamily: "var(--hero-display)", color: "var(--hero-ink)" }}
          >
            {t("landingHero.title_line1")}
            <br />
            {t("landingHero.title_line2")}
          </motion.h1>

          <motion.div variants={itemVariants} className="mb-8 min-h-[3.2rem] sm:min-h-[3.6rem]">
            <AnimatePresence mode="wait">
              <motion.p
                key={subtitleIndex}
                initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -12 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="text-base sm:text-lg"
                style={{ color: "var(--hero-slate)" }}
              >
                {t(`landingHero.${SUBTITLE_KEYS[subtitleIndex]}`)}
              </motion.p>
            </AnimatePresence>
          </motion.div>

          <motion.button
            variants={itemVariants}
            type="button"
            onClick={onExplore}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-medium text-sm transition-transform hover:scale-105"
            style={{ background: "var(--hero-accent)", color: "var(--hero-bg)" }}
          >
            {t("landingHero.cta")}
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </motion.div>

        <div className="relative w-full h-[62vh] min-h-[420px]">
          <motion.div
            className="absolute inset-0 grid gap-3"
            style={{
              gridTemplateColumns: "1.3fr 1fr 1fr",
              gridTemplateRows: "repeat(4, 1fr)",
              gridTemplateAreas: BENTO_AREAS,
              pointerEvents: phase === "collage" ? "auto" : "none",
            }}
            animate={{ opacity: phase === "collage" ? 1 : 0 }}
            transition={{ duration: 0.7 }}
          >
            {SLOTS.map((slot, i) => (
              <BentoTile
                key={slot.id}
                slot={slot}
                pool={slotPools[i]}
                activeIndex={slotIndices[i]}
                reduceMotion={reduceMotion}
              />
            ))}
          </motion.div>

          <EarthPhase
            reduceMotion={reduceMotion}
            visible={phase === "earth"}
            videoRef={earthVideoRef}
          />
        </div>
      </div>
    </section>
  )
}