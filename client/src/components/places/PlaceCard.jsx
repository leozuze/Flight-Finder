import { motion } from "framer-motion"
import {
  MapPin, ExternalLink, Utensils, BedDouble, Trees, Landmark,
  Drama, ShoppingBag, Dumbbell, Building2,
} from "lucide-react"
import { getCategoryFallbackImage, getCategoryIconMeta } from "@/data/placeCategoryImages"

// Maps the icon *name* strings from placeCategoryImages.js to actual
// lucide-react components. Kept here (rather than in the data file) so
// that file stays free of a React/JSX dependency.
const ICON_COMPONENTS = {
  Utensils, BedDouble, Trees, Landmark, Drama, ShoppingBag, Dumbbell, Building2, MapPin,
}

export default function PlaceCard({ place, isActive, onHover, onLeave }) {
  const hasRealPhoto = Boolean(place.photoUrl)
  const fallbackImage = hasRealPhoto ? null : getCategoryFallbackImage(place.category)
  const showPhoto = hasRealPhoto || Boolean(fallbackImage)
  const imageSrc = place.photoUrl || fallbackImage

  const iconMeta = showPhoto ? null : getCategoryIconMeta(place.category)
  const IconComponent = iconMeta ? ICON_COMPONENTS[iconMeta.icon] || MapPin : null

  return (
    <motion.a
      href={place.mapsUrl || undefined}
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={() => onHover?.(place.id)}
      onMouseLeave={() => onLeave?.()}
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="block rounded-2xl overflow-hidden group cursor-pointer"
      style={{
        border: isActive ? "2px solid var(--nuvex-accent)" : "1px solid var(--nuvex-border)",
        background: "var(--nuvex-bg)",
        boxShadow: isActive ? "0 8px 24px -12px rgba(23,184,196,0.35)" : "none",
        transition: "border-color 0.2s, box-shadow 0.2s",
      }}
    >
      <div className="relative w-full h-40 overflow-hidden">
        {showPhoto ? (
          <img
            src={imageSrc}
            alt={place.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          // Honest "no photo" state — a category-relevant icon on a soft
          // tinted background, instead of an unrelated stock photo. This
          // replaces the old generic skyline fallback, which looked like
          // a data error on categories like desserts or repair shops.
          <div
            className="w-full h-full flex flex-col items-center justify-center gap-1.5"
            style={{ background: iconMeta.bg }}
          >
            <IconComponent className="w-7 h-7" style={{ color: iconMeta.fg }} strokeWidth={1.75} />
            <span className="text-[10px] font-medium" style={{ color: iconMeta.fg }}>
              No photo available
            </span>
          </div>
        )}

        {hasRealPhoto ? null : showPhoto ? (
          <span
            className="absolute bottom-2 left-2 text-[9px] font-medium px-1.5 py-0.5 rounded-full"
            style={{ background: "rgba(7,11,18,0.55)", color: "#FFFFFF" }}
          >
            Representative photo
          </span>
        ) : null}

        {place.mapsUrl && (
          <span
            className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ background: "rgba(255,255,255,0.9)" }}
          >
            <ExternalLink className="w-3 h-3" style={{ color: "var(--nuvex-ink)" }} />
          </span>
        )}
      </div>

      <div className="p-3.5">
        {place.category && (
          <span
            className="inline-block text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full mb-1.5"
            style={{ color: "var(--nuvex-accent)", background: "rgba(23,184,196,0.10)" }}
          >
            {place.category}
          </span>
        )}
        <h3 className="text-sm font-semibold leading-snug line-clamp-1" style={{ color: "var(--nuvex-ink)" }}>
          {place.name}
        </h3>
        {place.address && (
          <p className="mt-1 text-xs flex items-start gap-1 line-clamp-2" style={{ color: "var(--nuvex-slate)" }}>
            <MapPin className="w-3 h-3 mt-0.5 shrink-0" />
            {place.address}
          </p>
        )}
        {place.distanceMeters != null && (
          <p className="mt-1.5 text-xs font-medium" style={{ color: "var(--nuvex-slate)" }}>
            {place.distanceMeters < 1000
              ? `${Math.round(place.distanceMeters)}m away`
              : `${(place.distanceMeters / 1000).toFixed(1)}km away`}
          </p>
        )}
      </div>
    </motion.a>
  )
}
