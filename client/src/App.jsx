import { lazy, Suspense } from "react"
import { BrowserRouter, Routes, Route, useNavigate, useLocation, useParams } from "react-router-dom"
import { SearchProvider, useSearchContext } from "@/context/SearchContext"
import MainNav from "@/components/MainNav"

// PERF FIX: every page used to be imported eagerly at the top of this
// file, so visiting "/" downloaded and parsed the JS for every other
// page (Places, AirportBoard, FlightDetail, HowItWorks, etc.) up front.
// React.lazy() code-splits each page into its own chunk, fetched only
// when that route is actually visited — smaller initial bundle, faster
// first load. Nothing about how routes behave or render changes.
const Home = lazy(() => import("@/pages/Home"))
const Landing = lazy(() => import("@/pages/Landing"))
const Places = lazy(() => import("@/pages/Places"))
const AirportBoard = lazy(() => import("@/pages/AirportBoard"))
const FlightDetail = lazy(() => import("@/pages/FlightDetail"))
const HowItWorks = lazy(() => import("@/pages/HowItWorks"))
const TermsOfService = lazy(() => import("@/pages/TermsOfService"))
const PrivacyPolicy = lazy(() => import("@/pages/PrivacyPolicy"))
const NotFound = lazy(() => import("@/pages/NotFound"))

function AppRoutes() {
  const navigate = useNavigate()
  const { triggerQuickSearch } = useSearchContext()

  const handleSearch = (result) => {
    if (result.type === "route") {
      triggerQuickSearch(result.origin, result.destination)
      navigate("/flights")
    } else if (result.type === "airport") {
      navigate("/airport-board", { state: { airportQuery: result } })
    }
  }

  const handleSelectFlight = (ident) => {
    navigate(`/flight/${encodeURIComponent(ident)}`)
  }

  const handleNavigate = (dest) => {
    const routes = {
      welcome: "/",
      home: "/flights",
      places: "/places",
      "airport-board": "/airport-board",
      "how-it-works": "/how-it-works",
      terms: "/terms",
      privacy: "/privacy",
    }
    navigate(routes[dest] || "/")
  }

  return (
    <Suspense fallback={null}>
      <Routes>
        <Route path="/" element={<Landing onNavigate={handleNavigate} />} />
        <Route
          path="/flights"
          element={
            <Home
              onSearch={handleSearch}
              onNavigate={handleNavigate}
              onSelectFlight={handleSelectFlight}
            />
          }
        />
        <Route
          path="/places"
          element={<Places onNavigate={handleNavigate} />}
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
    </Suspense>
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
        <MainNav />
        <AppRoutes />
      </BrowserRouter>
    </SearchProvider>
  )
}