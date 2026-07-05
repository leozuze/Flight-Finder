import { useState } from "react"
import Home from "@/pages/Home"
import AirportBoard from "@/pages/AirportBoard"
import FlightDetail from "@/pages/FlightDetail"
import HowItWorks from "@/pages/HowItWorks"
import TermsOfService from "@/pages/TermsOfService"
import PrivacyPolicy from "@/pages/PrivacyPolicy"

function App() {
  const [page, setPage] = useState("home")
  const [routeQuery, setRouteQuery] = useState(null)
  const [airportQuery, setAirportQuery] = useState(null)
  const [flightIdent, setFlightIdent] = useState(null)
  const [previousPage, setPreviousPage] = useState("home")

  const handleSearch = (result) => {
    if (result.type === "route") {
      setRouteQuery({ origin: result.origin, destination: result.destination })
      setPage("home")
    } else if (result.type === "airport") {
      setAirportQuery(result)
      setPage("airport-board")
    }
  }

  const handleSelectFlight = (ident) => {
    setFlightIdent(ident)
    setPreviousPage(page)
    setPage("flight-detail")
  }

  if (page === "airport-board") {
    return (
      <AirportBoard
        query={airportQuery}
        onSearch={handleSearch}
        onBack={() => setPage("home")}
        onNavigate={setPage}
        onSelectFlight={handleSelectFlight}
      />
    )
  }

  if (page === "flight-detail") {
    return (
      <FlightDetail
        ident={flightIdent}
        onSearch={handleSearch}
        onNavigate={setPage}
        onBack={() => setPage(previousPage)}
      />
    )
  }

  if (page === "how-it-works") {
    return <HowItWorks onSearch={handleSearch} onNavigate={setPage} />
  }

  if (page === "terms") {
    return <TermsOfService onSearch={handleSearch} onNavigate={setPage} />
  }

  if (page === "privacy") {
    return <PrivacyPolicy onSearch={handleSearch} onNavigate={setPage} />
  }

  return <Home startingQuery={routeQuery} onSearch={handleSearch} onNavigate={setPage} onSelectFlight={handleSelectFlight} />
}

export default App