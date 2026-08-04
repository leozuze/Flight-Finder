import { BrowserRouter, Routes, Route, useNavigate, useLocation, useParams } from "react-router-dom"
import { SearchProvider, useSearchContext } from "@/context/SearchContext"
import Home from "@/pages/Home"
import AirportBoard from "@/pages/AirportBoard"
import FlightDetail from "@/pages/FlightDetail"
import HowItWorks from "@/pages/HowItWorks"
import TermsOfService from "@/pages/TermsOfService"
import PrivacyPolicy from "@/pages/PrivacyPolicy"
import NotFound from "@/pages/NotFound"

function AppRoutes() {
  const navigate = useNavigate()
  const { triggerQuickSearch } = useSearchContext()

  const handleSearch = (result) => {
    if (result.type === "route") {
      triggerQuickSearch(result.origin, result.destination)
      navigate("/")
    } else if (result.type === "airport") {
      navigate("/airport-board", { state: { airportQuery: result } })
    }
  }

  const handleSelectFlight = (ident) => {
    navigate(`/flight/${encodeURIComponent(ident)}`)
  }

  const handleNavigate = (dest) => {
    const routes = {
      home: "/",
      "airport-board": "/airport-board",
      "how-it-works": "/how-it-works",
      terms: "/terms",
      privacy: "/privacy",
    }
    navigate(routes[dest] || "/")
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          <Home
            onSearch={handleSearch}
            onNavigate={handleNavigate}
            onSelectFlight={handleSelectFlight}
          />
        }
      />
      <Route
        path="/airport-board"
        element={<AirportBoardRoute onSearch={handleSearch} onNavigate={handleNavigate} onSelectFlight={handleSelectFlight} />}
      />
      <Route
        path="/flight/:ident"
        element={<FlightDetailRoute onSearch={handleSearch} onNavigate={handleNavigate} />}
      />
      <Route path="/how-it-works" element={<HowItWorks onSearch={handleSearch} onNavigate={handleNavigate} />} />
      <Route path="/terms" element={<TermsOfService onSearch={handleSearch} onNavigate={handleNavigate} />} />
      <Route path="/privacy" element={<PrivacyPolicy onSearch={handleSearch} onNavigate={handleNavigate} />} />
      <Route path="*" element={<NotFound onSearch={handleSearch} onNavigate={handleNavigate} />} />
    </Routes>
  )
}

function AirportBoardRoute({ onSearch, onNavigate, onSelectFlight }) {
  const location = useLocation()
  const navigate = useNavigate()
  return (
    <AirportBoard
      query={location.state?.airportQuery}
      onSearch={onSearch}
      onNavigate={onNavigate}
      onSelectFlight={onSelectFlight}
      onBack={() => navigate(-1)}
    />
  )
}

function FlightDetailRoute({ onSearch, onNavigate }) {
  const { ident } = useParams()
  const navigate = useNavigate()
  return (
    <FlightDetail
      ident={ident}
      onSearch={onSearch}
      onNavigate={onNavigate}
      onBack={() => navigate(-1)}
    />
  )
}

export default function App() {
  return (
    <SearchProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </SearchProvider>
  )
}