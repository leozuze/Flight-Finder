import { useState, useEffect } from "react"
import Navbar from "@/components/Navbar"
import FlightSearchSection from "@/components/FlightSearchSection"
import Footer from "@/components/Footer"

const CONTAINER = "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"

export default function Home({ startingQuery, onSearch, onNavigate , onSelectFlight }) {
  const [navQuery, setNavQuery] = useState(startingQuery || null)

  useEffect(() => {
    if (startingQuery) setNavQuery(startingQuery)
  }, [startingQuery])

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Navbar onSearch={onSearch} onNavigate={onNavigate} />

      <div className={`pt-28 text-center ${CONTAINER}`}>
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
            Never overpay for a flight again
          </h1>
          <p className="mt-3 text-slate-500 text-base">
            Set your route and budget, and we'll email you when the price drops.
          </p>
        </div>
      </div>

      <div className={`mt-8 ${CONTAINER}`}>
        <FlightSearchSection externalQuery={navQuery} onSelectFlight={onSelectFlight} />
      </div>

      <div className="mt-16">
        <Footer onNavigate={onNavigate} />
      </div>
    </div>
  )
}