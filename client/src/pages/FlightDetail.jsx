import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import { fetchFlightDetail } from "@/api/flightApi"
import { formatDateTime } from "@/utils/flightFormatters"

const CONTAINER = "max-w-4xl mx-auto px-4 sm:px-6 lg:px-8"
const NAV_CONTAINER = "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"

const NUVEX_THEME = {
  "--nuvex-bg": "#FFFFFF",
  "--nuvex-border": "#E4E7EC",
  "--nuvex-ink": "#10131A",
  "--nuvex-slate": "#64707D",
  "--nuvex-signal": "#E8A33D",
  "--nuvex-accent": "#17B8C4",
  "--nuvex-accent-hover": "#149AA5",
  "--nuvex-display": "'Bricolage Grotesque', 'Segoe UI', sans-serif",
  "--nuvex-body": "'IBM Plex Sans', 'Segoe UI', sans-serif",
}

function useNuvexFonts() {
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

export default function FlightDetail({ ident, onSearch, onNavigate, onBack }) {
  useNuvexFonts()
  const { t } = useTranslation()
  const [flight, setFlight] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Fetch effect — unchanged.
  useEffect(() => {
    if (!ident) return
    let cancelled = false

    setLoading(true)
    setError(null)
    setFlight(null)

    fetchFlightDetail(ident)
      .then((data) => {
        if (cancelled) return
        if (data.error) setError(data.error)
        else setFlight(data)
      })
      .catch(() => {
        if (!cancelled) setError(t("flightDetail.error_generic"))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [ident, t])

  const val = (v) => (v && v !== "N/A" ? v : null)

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ ...NUVEX_THEME, background: "var(--nuvex-bg)", color: "var(--nuvex-ink)", fontFamily: "var(--nuvex-body)" }}
    >
      {/* Search bar in its own mt-6 wrapper, same as Home.jsx. Widened to
          NAV_CONTAINER (7xl) here since the page content below it uses a
          narrower 4xl column — the search bar itself should still span
          the same width it does everywhere else in the app. */}
      <div className={`mt-6 ${NAV_CONTAINER}`}>
        <Navbar onSearch={onSearch} />
      </div>

      <div className={`flex-1 pt-10 pb-16 ${CONTAINER}`}>
        <button
          type="button"
          onClick={onBack}
          className="text-sm underline mb-4"
          style={{ color: "var(--nuvex-accent)" }}
        >
          ← {t("common.back")}
        </button>

        {loading && (
          <div className="text-center py-16 animate-pulse" style={{ color: "var(--nuvex-slate)" }}>
            {t("flightDetail.loading")}
          </div>
        )}

        {!loading && error && (
          <div className="text-center text-red-500 bg-red-50 border border-red-100 rounded-xl py-4 px-4 text-sm">
            {error}
          </div>
        )}

        {!loading && !error && flight && (
          <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--nuvex-border)" }}>
            {/* Header */}
            <div className="p-6" style={{ borderBottom: "1px solid var(--nuvex-border)" }}>
              <h1
                className="text-2xl font-semibold tracking-tight"
                style={{ fontFamily: "var(--nuvex-display)", color: "var(--nuvex-ink)" }}
              >
                {val(flight.airline) || t("flightDetail.unknown_airline")} {val(flight.ident) || ""}
              </h1>
              <p className="mt-1 text-sm" style={{ color: "var(--nuvex-slate)" }}>
                {t("flightDetail.status_label")}{" "}
                <span className="font-medium capitalize" style={{ color: "var(--nuvex-ink)" }}>
                  {val(flight.status) || t("common.unknown")}
                </span>
              </p>
            </div>

            {/* Route */}
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-8" style={{ borderBottom: "1px solid var(--nuvex-border)" }}>
              <div>
                <div className="text-xs font-semibold tracking-wide mb-1" style={{ color: "var(--nuvex-signal)" }}>
                  {t("flightDetail.departure_label")}
                </div>
                <div className="text-lg font-semibold" style={{ color: "var(--nuvex-ink)" }}>
                  {val(flight.departureCode) || "—"}
                </div>
                <div className="text-sm" style={{ color: "var(--nuvex-slate)" }}>
                  {val(flight.departureAirport) || t("flightDetail.unknown_airport")}
                </div>
                {val(flight.terminal) && (
                  <div className="text-xs mt-1" style={{ color: "var(--nuvex-slate)" }}>
                    {t("flightDetail.terminal")} {flight.terminal}
                  </div>
                )}
                {val(flight.gate) && (
                  <div className="text-xs" style={{ color: "var(--nuvex-slate)" }}>
                    {t("flightDetail.gate")} {flight.gate}
                  </div>
                )}
                <div className="mt-3 text-sm" style={{ color: "var(--nuvex-ink)" }}>
                  {t("flightDetail.scheduled")}: {formatDateTime(flight.scheduledTime) || "—"}
                </div>
                {val(flight.estimatedTime) && (
                  <div className="text-sm" style={{ color: "var(--nuvex-slate)" }}>
                    {t("flightDetail.estimated")}: {formatDateTime(flight.estimatedTime)}
                  </div>
                )}
                {val(flight.actualTime) && (
                  <div className="text-sm" style={{ color: "var(--nuvex-slate)" }}>
                    {t("flightDetail.actual")}: {formatDateTime(flight.actualTime)}
                  </div>
                )}
              </div>

              <div>
                <div className="text-xs font-semibold tracking-wide mb-1" style={{ color: "var(--nuvex-signal)" }}>
                  {t("flightDetail.arrival_label")}
                </div>
                <div className="text-lg font-semibold" style={{ color: "var(--nuvex-ink)" }}>
                  {val(flight.arrivalCode) || "—"}
                </div>
                <div className="text-sm" style={{ color: "var(--nuvex-slate)" }}>
                  {val(flight.arrivalAirport) || t("flightDetail.unknown_airport")}
                </div>
              </div>
            </div>

            {/* Aircraft */}
            <div className="p-6">
              <div className="text-xs font-semibold tracking-wide mb-2" style={{ color: "var(--nuvex-signal)" }}>
                {t("flightDetail.aircraft_label")}
              </div>
              {val(flight.aircraftType) ? (
                <div className="text-sm" style={{ color: "var(--nuvex-ink)" }}>{flight.aircraftType}</div>
              ) : (
                <div className="text-sm italic" style={{ color: "var(--nuvex-slate)" }}>
                  {t("flightDetail.aircraft_unavailable")}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <Footer onNavigate={onNavigate} />
    </div>
  )
}