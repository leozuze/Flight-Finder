import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import { fetchFlightDetail } from "@/api/flightApi"
import { formatDateTime } from "@/utils/flightFormatters"

const CONTAINER = "max-w-4xl mx-auto px-4 sm:px-6 lg:px-8"

export default function FlightDetail({ ident, onSearch, onNavigate, onBack }) {
  const { t } = useTranslation()
  const [flight, setFlight] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

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
    <div className="min-h-screen flex flex-col bg-white text-slate-900">
      <Navbar onSearch={onSearch} onNavigate={onNavigate} />

      <div className={`flex-1 pt-28 pb-16 ${CONTAINER}`}>
        <button type="button" onClick={onBack} className="text-sm text-cyan-600 underline mb-4">
          ← {t("common.back")}
        </button>

        {loading && (
          <div className="text-center text-slate-400 py-16 animate-pulse">
            {t("flightDetail.loading")}
          </div>
        )}

        {!loading && error && (
          <div className="text-center text-red-500 bg-red-50 border border-red-100 rounded-xl py-4 px-4 text-sm">
            {error}
          </div>
        )}

        {!loading && !error && flight && (
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-slate-200">
              <h1
                className="text-2xl font-semibold tracking-tight"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {val(flight.airline) || t("flightDetail.unknown_airline")} {val(flight.ident) || ""}
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                {t("flightDetail.status_label")}{" "}
                <span className="font-medium text-slate-700 capitalize">
                  {val(flight.status) || t("common.unknown")}
                </span>
              </p>
            </div>

            {/* Route */}
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-8 border-b border-slate-200">
              <div>
                <div className="text-xs font-semibold text-orange-500 tracking-wide mb-1">
                  {t("flightDetail.departure_label")}
                </div>
                <div className="text-lg font-semibold text-slate-900">
                  {val(flight.departureCode) || "—"}
                </div>
                <div className="text-sm text-slate-500">
                  {val(flight.departureAirport) || t("flightDetail.unknown_airport")}
                </div>
                {val(flight.terminal) && (
                  <div className="text-xs text-slate-400 mt-1">
                    {t("flightDetail.terminal")} {flight.terminal}
                  </div>
                )}
                {val(flight.gate) && (
                  <div className="text-xs text-slate-400">
                    {t("flightDetail.gate")} {flight.gate}
                  </div>
                )}
                <div className="mt-3 text-sm text-slate-700">
                  {t("flightDetail.scheduled")}: {formatDateTime(flight.scheduledTime) || "—"}
                </div>
                {val(flight.estimatedTime) && (
                  <div className="text-sm text-slate-500">
                    {t("flightDetail.estimated")}: {formatDateTime(flight.estimatedTime)}
                  </div>
                )}
                {val(flight.actualTime) && (
                  <div className="text-sm text-slate-500">
                    {t("flightDetail.actual")}: {formatDateTime(flight.actualTime)}
                  </div>
                )}
              </div>

              <div>
                <div className="text-xs font-semibold text-orange-500 tracking-wide mb-1">
                  {t("flightDetail.arrival_label")}
                </div>
                <div className="text-lg font-semibold text-slate-900">
                  {val(flight.arrivalCode) || "—"}
                </div>
                <div className="text-sm text-slate-500">
                  {val(flight.arrivalAirport) || t("flightDetail.unknown_airport")}
                </div>
              </div>
            </div>

            {/* Aircraft — placeholder for future data */}
            <div className="p-6">
              <div className="text-xs font-semibold text-orange-500 tracking-wide mb-2">
                {t("flightDetail.aircraft_label")}
              </div>
              {val(flight.aircraftType) ? (
                <div className="text-sm text-slate-700">{flight.aircraftType}</div>
              ) : (
                <div className="text-sm text-slate-400 italic">
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