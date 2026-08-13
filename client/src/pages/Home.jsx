import { useState, useEffect, useRef } from "react"
import { useTranslation } from "react-i18next"
import Navbar from "@/components/Navbar"
import FlightSearchSection from "@/components/FlightSearchSection"
import Footer from "@/components/Footer"

const CONTAINER = "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"

export default function Home({ startingQuery, onSearch, onNavigate, onSelectFlight }) {
  const { t } = useTranslation()
  const [navQuery, setNavQuery] = useState(startingQuery || null)

  useEffect(() => {
    if (startingQuery) setNavQuery(startingQuery)
  }, [startingQuery])


  const searchBarWrapRef = useRef(null)
  const [searchBarHeight, setSearchBarHeight] = useState(0)

  useEffect(() => {
    if (!searchBarWrapRef.current) return
    const el = searchBarWrapRef.current
    const ro = new ResizeObserver((entries) => {
      setSearchBarHeight(entries[0].contentRect.height)
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <div
        ref={searchBarWrapRef}
        className="fixed left-0 right-0 z-50 bg-white border-b border-slate-100"
        style={{ top: "var(--nuvex-main-nav-height, 0px)" }}
      >
        <div className={`py-3 ${CONTAINER}`}>
          <Navbar onSearch={onSearch} />
        </div>
      </div>
      <div style={{ height: searchBarHeight }} aria-hidden="true" />

      <div className={`pt-10 text-center ${CONTAINER}`}>
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
            {t("home.hero_title")}
          </h1>
          <p className="mt-3 text-slate-500 text-base">
            {t("home.hero_subtitle")}
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