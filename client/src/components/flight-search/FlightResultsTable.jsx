import { Play } from "lucide-react"
import { formatDateTime } from "@/utils/flightFormatters"

export default function FlightResultsTable({ flight, origin, destination, status, statusLoading, onCheckStatus, onSelectFlight }) {
  const originLabel = flight.originCode ? `(${flight.originCode}) ${origin}` : origin
  const destinationLabel = flight.destinationCode ? `(${flight.destinationCode}) ${destination}` : destination

  return (
    <div className="border border-cyan-500 rounded-lg overflow-hidden">
      <div className="bg-cyan-600 text-white px-4 py-3 font-semibold text-base flex items-center gap-2 flex-wrap">
        <span>Cheapest Flight Results: {originLabel}</span>
        <Play className="w-4 h-4 shrink-0" fill="currentColor" />
        <span>{destinationLabel}</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-orange-500 border-b border-slate-200">
              <th className="px-4 py-2.5 font-medium">Airline</th>
              <th className="px-4 py-2.5 font-medium">Ident</th>
              <th className="px-4 py-2.5 font-medium">Aircraft</th>
              <th className="px-4 py-2.5 font-medium">Connections</th>
              <th className="px-4 py-2.5 font-medium">Status</th>
              <th className="px-4 py-2.5 font-medium">Departure</th>
              <th className="px-4 py-2.5 font-medium">Arrival</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-slate-100">
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
              <td className="px-4 py-3 text-slate-700">
                {flight.stops === 0
                  ? "Direct"
                  : `${flight.stops} stop${flight.stops > 1 ? "s" : ""}${
                      flight.stopAirports?.length ? ` via ${flight.stopAirports.join(", ")}` : ""
                    }`}
              </td>
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
                    {statusLoading ? "Checking..." : "Check status"}
                  </button>
                )}
              </td>
              <td className="px-4 py-3 text-slate-700">{formatDateTime(flight.departDate)}</td>
              <td className="px-4 py-3 text-slate-700">{formatDateTime(flight.returnDate)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-end text-sm">
        <span className="text-lg font-bold text-cyan-600">
          {flight.currency} {flight.price}
        </span>
      </div>
    </div>
  )
}