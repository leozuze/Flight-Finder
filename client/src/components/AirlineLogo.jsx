import { useState } from "react"
import { Plane } from "lucide-react"
import { getAirlineLogoUrl } from "@/utils/flightFormatters"

export default function AirlineLogo({ iataCode, airlineName, className = "w-6 h-6" }) {
  const [failed, setFailed] = useState(false)
  const src = getAirlineLogoUrl(iataCode)

  if (!src || failed) {
    return <Plane className={`${className} text-slate-300 shrink-0`} />
  }

  return (
    <img
      src={src}
      alt={airlineName || iataCode || "airline logo"}
      className={`${className} object-contain shrink-0`}
      onError={() => setFailed(true)}
    />
  )
}