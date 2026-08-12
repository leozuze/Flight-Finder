import Hero from "@/components/Hero"
import Footer from "@/components/Footer"

// Landing page for the new "/welcome" route. Keeps the existing flights
// Home.jsx at "/" completely untouched — this is a separate entry point.
export default function Landing({ onNavigate }) {
  return (
    <div className="w-full">
      <Hero onExplore={() => onNavigate?.("home")} />
      {/* Future landing sections (e.g. featured destinations, how-it-works
          teaser, stays/places previews) go here, below the Hero. */}
      <Footer onNavigate={onNavigate} />
    </div>
  )
}