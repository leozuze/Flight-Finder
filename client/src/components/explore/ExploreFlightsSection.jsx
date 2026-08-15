import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ArrowRight, SlidersHorizontal } from "lucide-react"
import ExploreFlightCard from "./ExploreFlightCard"

const CATEGORY_LABELS = { beach: "Beach", city: "City", mountain: "Mountain", heritage: "Heritage", adventure: "Adventure" }

export default function ExploreFlightsSection({ destinations, currency, onSelect, expanded, onExpandedChange }) {
  const [activeCategory, setActiveCategory] = useState(null)
  const [budgetFilter, setBudgetFilter] = useState(null)

  const categories = useMemo(() => [...new Set(destinations.map((d) => d.category))], [destinations])
  const maxBudget = useMemo(() => (destinations.length ? Math.max(...destinations.map((d) => d.price)) : null), [destinations])

  const filtered = destinations.filter((d) => {
    if (activeCategory && d.category !== activeCategory) return false
    if (budgetFilter && d.price > budgetFilter) return false
    return true
  })

  if (expanded) {
    return (
      <section className="min-w-0">
        {/* Header row — back button + title, its own line, nothing competing for space */}
        <div className="flex items-center gap-3 mb-5">
          <button
            onClick={() => onExpandedChange(false)}
            className="flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-full border shrink-0"
            style={{ borderColor: "var(--nuvex-border, #E4E7EC)", color: "var(--nuvex-slate, #64707D)" }}
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            Back to Explore
          </button>
          <h2 className="text-lg font-semibold" style={{ color: "var(--nuvex-ink, #10131A)" }}>All flights</h2>
          <span className="text-xs ml-auto" style={{ color: "var(--nuvex-slate, #64707D)" }}>
            {filtered.length} destination{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Filter toolbar — its own full-width row, category chips left,
            budget stepper right, stacks on narrow screens instead of wrapping
            mid-row like flex-wrap was doing before. */}
        <div
          className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-6 pb-4 border-b"
          style={{ borderColor: "var(--nuvex-border, #E4E7EC)" }}
        >
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveCategory(null)}
              className="text-xs font-medium px-3 py-1.5 rounded-full transition-colors"
              style={!activeCategory
                ? { background: "var(--nuvex-accent, #17B8C4)", color: "#FFF" }
                : { background: "var(--nuvex-border, #E4E7EC)", color: "var(--nuvex-slate, #64707D)" }}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
                className="text-xs font-medium px-3 py-1.5 rounded-full transition-colors"
                style={activeCategory === cat
                  ? { background: "var(--nuvex-accent, #17B8C4)", color: "#FFF" }
                  : { background: "var(--nuvex-border, #E4E7EC)", color: "var(--nuvex-slate, #64707D)" }}
              >
                {CATEGORY_LABELS[cat] || cat}
              </button>
            ))}
          </div>

          {maxBudget != null && (
            <div className="flex items-center gap-2 sm:ml-auto text-xs shrink-0" style={{ color: "var(--nuvex-slate, #64707D)" }}>
              <SlidersHorizontal className="w-3.5 h-3.5 shrink-0" />
              <span className="whitespace-nowrap">Under {currency} {budgetFilter ?? maxBudget}</span>
              <input
                type="range"
                min={0}
                max={maxBudget}
                step={Math.max(1, Math.round(maxBudget / 50))}
                value={budgetFilter ?? maxBudget}
                onChange={(e) => setBudgetFilter(Number(e.target.value))}
                className="w-28 sm:w-32"
              />
            </div>
          )}
        </div>

        {/* Results grid or empty state */}
        {filtered.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence mode="popLayout">
              {filtered.map((d) => (
                <ExploreFlightCard key={d.code} destination={d} currency={currency} onSelect={onSelect} compact={false} />
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div
            className="text-center py-16 rounded-2xl border text-sm"
            style={{ borderColor: "var(--nuvex-border, #E4E7EC)", color: "var(--nuvex-slate, #64707D)" }}
          >
            No destinations match that filter — try widening the budget or category.
          </div>
        )}
      </section>
    )
  }

  return (
    <section className="mb-10 min-w-0">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold" style={{ color: "var(--nuvex-ink, #10131A)" }}>Flights worth booking</h2>
        <button
          onClick={() => onExpandedChange(true)}
          className="flex items-center gap-1 text-xs font-medium"
          style={{ color: "var(--nuvex-accent, #17B8C4)" }}
        >
          View all <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div
        className="flex w-full max-w-full gap-4 overflow-x-auto pb-2 min-w-0 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{
          overscrollBehaviorX: "contain",
          touchAction: "pan-x pan-y",
        }}
      >
        {destinations.map((d) => (
          <ExploreFlightCard key={d.code} destination={d} currency={currency} onSelect={onSelect} compact />
        ))}
      </div>
    </section>
  )
}