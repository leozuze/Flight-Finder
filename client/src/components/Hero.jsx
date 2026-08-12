import { useEffect, useMemo, useRef, useState } from "react"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import { useTranslation } from "react-i18next"
import { Plane, ArrowRight } from "lucide-react"

// ── Media ──────────────────────────────────────────────────────────────
import earthVideo from "@/assets/earth.mp4"
import airportVideo from "@/assets/airport.mp4"

import planeflyVideo from "@/assets/planefly.mp4"

import ballonImg from "@/assets/ballon.jpg"
import cityImg from "@/assets/city.jpg"
import hotairImg from "@/assets/hotair.jpg"
import parkImg from "@/assets/park.jpg"
import restaurentImg from "@/assets/restaurent.jpg"
import restaurantsImg from "@/assets/rest.jpg"
import roomsImg from "@/assets/rooms.jpg"
import rooms1Img from "@/assets/rooms1.jpg"
import tallbuildingsImg from "@/assets/tallbuildings.jpg"

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

const MEDIA_POOL = [
  { type: "video", src: planeflyVideo, alt: "Aircraft in flight" },
  { type: "image", src: roomsImg, alt: "Hotel room" },
  { type: "image", src: hotairImg, alt: "Hot air balloons at sunrise" },
  { type: "image", src: tallbuildingsImg, alt: "City skyline" },

  { type: "image", src: restaurantsImg, alt: "Restaurant interior" },

  { type: "image", src: parkImg, alt: "City park" },
  { type: "image", src: rooms1Img, alt: "Hotel suite" },
  { type: "image", src: restaurentImg, alt: "Restaurant table" },
  { type: "video", src: airportVideo, alt: "Airport terminal" },
  { type: "image", src: ballonImg, alt: "Hot air balloon over a valley" },
  { type: "image", src: cityImg, alt: "City street at dusk" },
]

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

// ── MediaAsset ─────────────────────────────────────────────────────────
// PERF FIX: video elements stay mounted (so no remount-decode stutter),
// but now only the ACTIVE tile's video is actually playing/decoding.
// Every other video in the pool is paused via ref — same visual result,
// a fraction of the CPU/GPU cost. This was the #1 source of slowness:
// previously every video in MEDIA_POOL decoded continuously forever,
// even while invisible at opacity 0.
function MediaAsset({ item, isActive }) {
  const [loaded, setLoaded] = useState(false)
  const videoRef = useRef(null)

  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    if (isActive) {
      // play() can reject if the browser hasn't finished loading yet or
      // due to autoplay policy races — safe to swallow, it'll retry next
      // time isActive flips true.
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
          muted
          loop
          playsInline
          preload={isActive ? "auto" : "metadata"}
          onLoadedData={() => setLoaded(true)}
          className="w-full h-full object-cover transition-opacity duration-700 ease-out"
          style={{ opacity: loaded ? 1 : 0 }}
        />
      ) : (
        <img
          key={item.src}
          src={item.src}
          alt={item.alt}
          decoding="async"
          onLoad={() => setLoaded(true)}
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

// ── Globe phase (original styling, restored) ─────────────────────────────
function OrbitRing({ radius, duration, direction, dashed, children }) {
  return (
    <motion.div
      className="absolute left-1/2 top-1/2 rounded-full"
      style={{
        width: radius * 2,
        height: radius * 2,
        marginLeft: -radius,
        marginTop: -radius,
        border: dashed ? "1px dashed rgba(244,246,248,0.18)" : "1px solid rgba(244,246,248,0.1)",
      }}
      animate={{ rotate: direction === "cw" ? 360 : -360 }}
      transition={{ duration, repeat: Infinity, ease: "linear" }}
    >
      {children}
    </motion.div>
  )
}

// PERF FIX: this used to fully unmount/remount on every phase toggle
// (every 7–14s, forever) via AnimatePresence, which forces the browser
// to rebuild the video decode pipeline from scratch each time — the
// exact stutter the BentoTile comment warns about, just repeated
// endlessly here. Now the earth video is mounted once by the parent and
// only play/paused; this component just renders the fade wrapper.
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
          <OrbitRing radius={210} duration={42} direction="cw" dashed>
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
          <OrbitRing radius={260} duration={58} direction="ccw" />
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
          src={earthVideo}
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

// PERF NOTE: kept the exact same animated blobs/positions/opacity so the
// visual is identical. Added `willChange` + `translateZ(0)` so the
// browser is hinted to keep these on their own compositor layer rather
// than re-evaluating layout each frame — a free scheduling win with zero
// visual change. The real cost here (blur filter repaint) is inherent to
// the design as-is; if you ever want it cheaper, it requires an actual
// visual tradeoff, which we're deliberately not doing here.
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

// PERF FIX: was preload="auto" for EVERY item (forces full-file download
// of every video up front). Now images still warm the cache (cheap),
// but videos only warm metadata — the active one gets bumped to "auto"
// by MediaAsset itself once it becomes active, so its full data streams
// in right when it's needed instead of all-at-once on mount.
function usePreloadMedia() {
  useEffect(() => {
    const videos = []
    MEDIA_POOL.forEach((item) => {
      if (item.type === "image") {
        const img = new Image()
        img.src = item.src
      } else {
        const video = document.createElement("video")
        video.preload = "metadata"
        video.muted = true
        video.src = item.src
        videos.push(video)
      }
    })
    return () => videos.forEach((v) => { v.src = "" })
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
  usePreloadMedia()
  const { t } = useTranslation()
  const reduceMotion = useReducedMotion()
  const [phase, setPhase] = useState("collage") // 'collage' | 'earth'
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

  // PERF FIX: earth video now play/pauses in sync with phase instead of
  // being torn down and rebuilt every cycle.
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

        {/* ── Visual column ── */}
        {/* PERF FIX: both phases are now mounted together and cross-faded
            via opacity instead of AnimatePresence mount/unmount. Visually
            identical fade; no more remount-triggered decode rebuild. */}
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