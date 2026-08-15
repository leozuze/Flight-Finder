import { motion } from "framer-motion"
import { Plane, ArrowRight } from "lucide-react"

export default function ExploreFlightCard({ destination, currency, onSelect, compact }) {
  const { city, country, price, stops, airline, airlineLogo } = destination

  return (
    <motion.button
      layout={!compact || undefined}
      onClick={() => onSelect(destination)}
      whileHover={{ y: -3 }}
      className={`text-left rounded-2xl overflow-hidden border shrink-0 ${compact ? "w-64" : "w-full"}`}
      style={{ borderColor: "var(--nuvex-border, #E4E7EC)", background: "#FFFFFF" }}
    >
      <div className="h-28 flex items-center justify-center px-6" style={{ background: "#F6F5FC" }}>
        {airlineLogo ? (
          <img src={airlineLogo} alt={airline} className="max-h-10 max-w-full object-contain" />
        ) : (
          <Plane className="w-6 h-6" style={{ color: "var(--nuvex-slate, #64707D)" }} />
        )}
      </div>

      <div className="p-3.5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-sm font-semibold leading-tight" style={{ color: "var(--nuvex-ink, #10131A)" }}>{city}</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--nuvex-slate, #64707D)" }}>{country}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-sm font-bold leading-none" style={{ color: "var(--nuvex-ink, #10131A)" }}>{currency} {price}</p>
            <p className="text-[10px] mt-0.5" style={{ color: "var(--nuvex-slate, #64707D)" }}>from</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs mt-2.5" style={{ color: "var(--nuvex-slate, #64707D)" }}>
          <span className="truncate">{airline}</span>
          <span>·</span>
          <span>{stops === 0 ? "Direct" : `${stops} stop${stops > 1 ? "s" : ""}`}</span>
        </div>

        <div className="flex items-center gap-1 mt-2.5 text-xs font-medium" style={{ color: "var(--nuvex-accent, #17B8C4)" }}>
          View flight <ArrowRight className="w-3 h-3" />
        </div>
      </div>
    </motion.button>
  )
}