import { useTranslation } from "react-i18next"
import { Play } from "lucide-react"
import { formatDateTime } from "@/utils/flightFormatters"

export default function OtherFlightsTable({ flights, totalCount, origin, destination, originCode, destinationCode, travelClass, title, onSelectFlight }) {
  const { t } = useTranslation()
  const resolvedTitle = title || t("resultsTable.other_flights")
  const originLabel = originCode ? `(${originCode}) ${origin}` : origin
  const destinationLabel = destinationCode ? `(${destinationCode}) ${destination}` : destination
  const classKey = travelClass === "premium" ? "premium_economy" : travelClass
  return (
    <div className="border border-slate-300 rounded-lg overflow-hidden">
      <div className="bg-slate-700 text-white px-4 py-3 font-semibold text-base flex items-center gap-2 flex-wrap">
        <span>{resolvedTitle}: {originLabel}</span>
        <Play className="w-4 h-4 shrink-0" fill="currentColor" />
        <span>{destinationLabel}</span>
      </div>

    <div className="bg-slate-50 px-4 py-2.5 text-sm text-slate-600 border-b border-slate-200 flex items-center justify-between">
        <span>
          {t("resultsTable.showing", { shown: flights.length, total: totalCount })}{" "}
          {totalCount > 1 ? t("resultsTable.flights") : t("resultsTable.flight")}
        </span>
        {classKey && (
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
            {t(`searchForm.${classKey}`)}
          </span>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-orange-500 border-b border-slate-200">
              <th className="px-4 py-2.5 font-medium">{t("resultsTable.airline")}</th>
              <th className="px-4 py-2.5 font-medium">{t("resultsTable.ident")}</th>
              <th className="px-4 py-2.5 font-medium">{t("resultsTable.aircraft")}</th>
              <th className="px-4 py-2.5 font-medium">{t("resultsTable.connections")}</th>
              <th className="px-4 py-2.5 font-medium">{t("resultsTable.departure")}</th>
              <th className="px-4 py-2.5 font-medium">{t("resultsTable.arrival")}</th>
              <th className="px-4 py-2.5 font-medium text-right">{t("resultsTable.price")}</th>
            </tr>
          </thead>
          <tbody>
            {flights.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-slate-400">
                  {t("resultsTable.no_flights_match")}
                </td>
              </tr>
            )}
            {flights.map((flight, i) => {
              const connectionsLabel = flight.stops === 0
                ? t("resultsTable.direct")
                : `${flight.stops} ${flight.stops > 1 ? t("resultsTable.stops") : t("resultsTable.stop")}${
                    flight.stopAirports?.length ? ` ${t("resultsTable.via")} ${flight.stopAirports.join(", ")}` : ""
                  }`

              return (
                <tr key={i} className="border-b border-slate-100">
                  <td className="px-4 py-3 text-slate-700">
                    <div className="flex items-center gap-2">
                      {flight.airlineLogo && (
                        <img src={flight.airlineLogo} alt={flight.airline || "airline logo"} className="w-5 h-5 object-contain" />
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
                  <td className="px-4 py-3 text-slate-700">{formatDateTime(flight.departDate)}</td>
                  <td className="px-4 py-3 text-slate-700">{formatDateTime(flight.returnDate)}</td>
                  <td className="px-4 py-3 text-right font-semibold text-slate-700">
                    {flight.currency} {flight.price}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}