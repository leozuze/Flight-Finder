import { useState } from "react"
import Home from "@/pages/Home"
import AirportBoard from "@/pages/AirportBoard"

function App() {
  const [page, setPage] = useState("home")
  const [routeQuery, setRouteQuery] = useState(null)
  const [airportQuery, setAirportQuery] = useState(null)

  const handleSearch = (result) => {
    if (result.type === "route") {
      setRouteQuery({ origin: result.origin, destination: result.destination })
      setPage("home")
    } else if (result.type === "airport") {
      setAirportQuery(result)
      setPage("airport-board")
    }
  }

  if (page === "airport-board") {
    return (
      <AirportBoard
        query={airportQuery}
        onSearch={handleSearch}
        onBack={() => setPage("home")}
      />
    )
  }

  return <Home startingQuery={routeQuery} onSearch={handleSearch} />
}

export default App