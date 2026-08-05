import { useTranslation } from "react-i18next"
import { Play, Info } from "lucide-react"
import { formatDateTime, formatDateOnly } from "@/utils/flightFormatters"

export default function FlightResultsTable({ flight, origin, destination, travelClass, status, statusLoading, onCheckStatus, onSelectFlight }) {
  const { t } = useTranslation()
  const originLabel = flight.originCode ? `(${flight.originCode}) ${origin}` : origin
  const destinationLabel = flight.destinationCode ? `(${flight.destinationCode}) ${destination}` : destination
  const classKey = travelClass === "premium" ? "premium_economy" : travelClass
  const connectionsLabel = flight.stops === 0
    ? t("resultsTable.direct")
    : `${flight.stops} ${flight.stops > 1 ? t("resultsTable.stops") : t("resultsTable.stop")}${
        flight.stopAirports?.length ? ` ${t("resultsTable.via")} ${flight.stopAirports.join(", ")}` : ""
      }`

  return (
    <div className="border border-cyan-500 rounded-lg overflow-hidden">
      <div className="bg-cyan-600 text-white px-4 py-3 font-semibold text-base flex items-center gap-2 flex-wrap">
        <span>{t("resultsTable.cheapest_results")}: {originLabel}</span>
        <Play className="w-4 h-4 shrink-0" fill="currentColor" />
        <span>{destinationLabel}</span>
      </div>

      {flight.dateAdjusted && (
        <div className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50 border-b border-amber-100 px-4 py-2.5">
          <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
          <span>
            {t("resultsTable.date_adjusted_note", { requested: formatDateOnly(flight.requestedReturnDate) })}
          </span>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-orange-500 border-b border-slate-200">
              <th className="px-4 py-2.5 font-medium">{t("resultsTable.airline")}</th>
              <th className="px-4 py-2.5 font-medium">{t("resultsTable.ident")}</th>
              <th className="px-4 py-2.5 font-medium">{t("resultsTable.aircraft")}</th>
              <th className="px-4 py-2.5 font-medium">{t("resultsTable.connections")}</th>
              <th className="px-4 py-2.5 font-medium">{t("resultsTable.status")}</th>
              <th className="px-4 py-2.5 font-medium">{t("resultsTable.departure")}</th>
              <th className="px-4 py-2.5 font-medium">{t("resultsTable.arrival")}</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-slate-100">
              <td className="px-4 py-3 text-slate-700">
                <div className="flex items-center gap-2">
                  {flight.airlineLogo && (
                    <img src={flight.airlineLogo} alt={flight.airline || "airline logo"} className="w-6 h-6 object-contain" />
                  )}
                  <span>{flight.airline || ""}</span>
                </div>
              </td>
              <td className="px-4 py-3">
                {flight.flightNumber ? (
                  <button
                    type="button"
                    onClick={() => onSelectFlight?.(flight.flightNumber)}
                    className="text-cyan-600 underline hover:text-cyan-700"
                  >
                    {flight.flightNumber}
                  </button>
                ) : (
                  ""
                )}
              </td>
              <td className="px-4 py-3 text-slate-700">{flight.aircraft || ""}</td>
              <td className="px-4 py-3 text-slate-700">{connectionsLabel}</td>
              <td className="px-4 py-3 text-slate-700">
                {status ? (
                  <span>{status}</span>
                ) : (
                  <button
                    type="button"
                    onClick={() => onCheckStatus(flight.flightNumber, flight.departDate)}
                    disabled={statusLoading || !flight.flightNumber}
                    className="text-cyan-600 underline text-xs disabled:text-slate-300 disabled:no-underline"
                  >
                    {statusLoading ? t("resultsTable.checking") : t("resultsTable.check_status")}
                  </button>
                )}
              </td>
              <td className="px-4 py-3 text-slate-700">{formatDateTime(flight.departDate)}</td>
              <td className="px-4 py-3 text-slate-700">{formatDateTime(flight.returnDate)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-sm">
        {classKey && (
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
            {t(`searchForm.${classKey}`)}
          </span>
        )}
        <span className="text-lg font-bold text-cyan-600">
          {flight.currency} {flight.price}
        </span>
      </div>
    </div>
  )
}