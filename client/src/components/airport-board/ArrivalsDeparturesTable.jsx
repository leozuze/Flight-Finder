import { useTranslation } from "react-i18next"
import { formatDateTime } from "@/utils/flightFormatters"

export default function ArrivalsDeparturesTable({ flights, mode = "arrivals", onSelectFlight }) {
  const { t } = useTranslation()
  const placeColumnLabel = mode === "arrivals" ? t("resultsTable.origin") : t("resultsTable.destination")
  const modeLabel = mode === "arrivals" ? t("airportBoard.arrivals") : t("airportBoard.departures")

  return (
    <div className="border border-slate-300 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-orange-500 border-b border-slate-200 bg-white">
              <th className="px-4 py-2.5 font-medium">{t("resultsTable.ident")}</th>
              <th className="px-4 py-2.5 font-medium">{t("resultsTable.airline")}</th>
              <th className="px-4 py-2.5 font-medium">{placeColumnLabel}</th>
              <th className="px-4 py-2.5 font-medium">{t("resultsTable.terminal_gate")}</th>
              <th className="px-4 py-2.5 font-medium">{t("resultsTable.scheduled")}</th>
              <th className="px-4 py-2.5 font-medium">{t("resultsTable.estimated_actual")}</th>
              <th className="px-4 py-2.5 font-medium">{t("resultsTable.status")}</th>
            </tr>
          </thead>
          <tbody>
            {(!flights || flights.length === 0) && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-slate-400">
                  {t("airportBoard.no_flights", { mode: modeLabel.toLowerCase() })}
                </td>
              </tr>
            )}
            {flights?.map((f, i) => {
              const place = f.airportCode && f.airportCode !== "N/A"
                ? `(${f.airportCode}) ${f.airportName !== "N/A" ? f.airportName : ""}`
                : (f.airportName !== "N/A" ? f.airportName : "")

              const terminalGate = [
                f.terminal && f.terminal !== "N/A" ? `T${f.terminal}` : null,
                f.gate && f.gate !== "N/A" ? `Gate ${f.gate}` : null,
              ].filter(Boolean).join(" / ") || "—"

              const hasIdent = f.ident && f.ident !== "N/A"

              return (
                <tr
                  key={i}
                  className={`border-b border-slate-100 ${i % 2 === 1 ? "bg-sky-50" : "bg-white"}`}
                >
                  <td className="px-4 py-3 whitespace-nowrap">
                    {hasIdent ? (
                      <button
                        type="button"
                        onClick={() => onSelectFlight?.(f.ident)}
                        className="text-cyan-600 underline hover:text-cyan-700"
                      >
                        {f.ident}
                      </button>
                    ) : (
                      ""
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {f.airline !== "N/A" ? f.airline : ""}
                  </td>
                  <td className="px-4 py-3 text-slate-700">{place}</td>
                  <td className="px-4 py-3 text-slate-700 whitespace-nowrap">{terminalGate}</td>
                  <td className="px-4 py-3 text-slate-700 whitespace-nowrap">
                    {formatDateTime(f.scheduledTime)}
                  </td>
                  <td className="px-4 py-3 text-slate-700 whitespace-nowrap">
                    {formatDateTime(f.estimatedTime || f.actualTime)}
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {f.status !== "N/A" ? f.status : t("common.unknown")}
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