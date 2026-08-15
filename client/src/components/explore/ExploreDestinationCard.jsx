import { motion } from "framer-motion"
import { MapPin, Plane, ArrowRight } from "lucide-react"
import { cldImage } from "@/lib/cloudinary"

// No real per-destination photo source (unlike Places, flights have no
// venue-photo API), so each category borrows a themed asset from your
// existing Cloudinary media — same "Representative photo" honesty pattern
// as PlaceCard.jsx, just applied per-category instead of per-place.
const CATEGORY_IMAGE_IDS = {
  beach: "seaa",
  city: "tallbuildings",
  mountain: "hotair",
  heritage: "city",
  adventure: "waterfalll",
}

const CATEGORY_IMAGES = Object.fromEntries(
  Object.entries(CATEGORY_IMAGE_IDS).map(([cat, id]) => [cat, cldImage(id, { w: 480 })])
)

export default function ExploreDestinationCard({ destination, currency, onSelect }) {
  const { city, country, category, price, stops, airline, topPlaces } = destination
  const bg = CATEGORY_IMAGES[category] || CATEGORY_IMAGES.city

  return (
    <motion.button
      layout
      onClick={() => onSelect(destination)}
      whileHover={{ y: -3 }}
      className="text-left rounded-2xl overflow-hidden border w-full"
      style={{ borderColor: "var(--nuvex-border, #E4E7EC)", background: "#FFFFFF" }}
    >
      <div className="relative h-36 w-full">
        <img src={bg} alt={category} loading="lazy" className="w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(10,15,30,0) 40%, rgba(10,15,30,0.65) 100%)" }} />

        <span
          className="absolute top-2.5 left-2.5 text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-full text-white"
          style={{ background: "rgba(10,15,30,0.55)" }}
        >
          {category}
        </span>
        <span
          className="absolute top-2.5 right-2.5 text-[9px] font-medium px-1.5 py-0.5 rounded-full text-white"
          style={{ background: "rgba(10,15,30,0.45)" }}
        >
          Representative photo
        </span>

        <div className="absolute bottom-2.5 left-3 right-3 flex items-end justify-between">
          <div>
            <p className="text-white font-semibold text-sm leading-tight">{city}</p>
            <p className="text-white/75 text-xs">{country}</p>
          </div>
          <div className="text-right">
            <p className="text-white font-bold text-base leading-none">{currency} {price}</p>
            <p className="text-white/70 text-[10px] mt-0.5">from</p>
          </div>
        </div>
      </div>

      <div className="p-3">
        <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--nuvex-slate, #64707D)" }}>
          <Plane className="w-3.5 h-3.5" />
          <span>{airline}</span>
          <span>·</span>
          <span>{stops === 0 ? "Direct" : `${stops} stop${stops > 1 ? "s" : ""}`}</span>
        </div>

        {topPlaces?.length > 0 ? (
          <div className="flex items-start gap-1.5 mt-2.5 text-xs" style={{ color: "var(--nuvex-ink, #10131A)" }}>
            <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: "var(--nuvex-slate, #64707D)" }} />
            <span className="line-clamp-2">{topPlaces.map((p) => p.name).join(" · ")}</span>
          </div>
        ) : (
          <div className="mt-2.5 text-xs" style={{ color: "var(--nuvex-slate, #64707D)" }}>
            Tap to see flight details
          </div>
        )}

        <div className="flex items-center gap-1 mt-3 text-xs font-medium" style={{ color: "var(--nuvex-accent, #17B8C4)" }}>
          Explore route <ArrowRight className="w-3 h-3" />
        </div>
      </div>
    </motion.button>
  )
}