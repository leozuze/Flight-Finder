import { Play } from "lucide-react"
import { formatDateTime } from "@/utils/flightFormatters"

export default function OtherFlightsTable({ flights, totalCount, origin, destination, originCode, destinationCode, title = "Other Flights" }) {
  const originLabel = originCode ? `(${originCode}) ${origin}` : origin
  const destinationLabel = destinationCode ? `(${destinationCode}) ${destination}` : destination

  return (
    <div className="border border-slate-300 rounded-lg overflow-hidden">
      <div className="bg-slate-700 text-white px-4 py-3 font-semibold text-base flex items-center gap-2 flex-wrap">
        <span>{title}: {originLabel}</span>
        <Play className="w-4 h-4 shrink-0" fill="currentColor" />
        <span>{destinationLabel}</span>
      </div>

      <div className="bg-slate-50 px-4 py-2.5 text-sm text-slate-600 border-b border-slate-200">
        Showing {flights.length} of {totalCount} flight{totalCount > 1 ? "s" : ""}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-orange-500 border-b border-slate-200">
              <th className="px-4 py-2.5 font-medium">Airline</th>
              <th className="px-4 py-2.5 font-medium">Ident</th>
              <th className="px-4 py-2.5 font-medium">Aircraft</th>
              <th className="px-4 py-2.5 font-medium">Connections</th>
              <th className="px-4 py-2.5 font-medium">Departure</th>
              <th className="px-4 py-2.5 font-medium">Arrival</th>
              <th className="px-4 py-2.5 font-medium text-right">Price</th>
            </tr>
          </thead>
          <tbody>
            {flights.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-slate-400">
                  No flights match the selected filters.
                </td>
              </tr>
            )}
            {flights.map((flight, i) => (
              <tr key={i} className="border-b border-slate-100">
                <td className="px-4 py-3 text-slate-700">
                  <div className="flex items-center gap-2">
                    {flight.airlineLogo && (
                      <img src={flight.airlineLogo} alt={flight.airline || "airline logo"} className="w-5 h-5 object-contain" />
                    )}
                    <span>{flight.airline || ""}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-cyan-600 underline">{flight.flightNumber || ""}</td>
                <td className="px-4 py-3 text-slate-700">{flight.aircraft || ""}</td>
                <td className="px-4 py-3 text-slate-700">
                  {flight.stops === 0
                    ? "Direct"
                    : `${flight.stops} stop${flight.stops > 1 ? "s" : ""}${
                        flight.stopAirports?.length ? ` via ${flight.stopAirports.join(", ")}` : ""
                      }`}
                </td>
                <td className="px-4 py-3 text-slate-700">{formatDateTime(flight.departDate)}</td>
                <td className="px-4 py-3 text-slate-700">{formatDateTime(flight.returnDate)}</td>
                <td className="px-4 py-3 text-right font-semibold text-slate-700">
                  {flight.currency} {flight.price}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}