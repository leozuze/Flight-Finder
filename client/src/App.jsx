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
const Explore = lazy(() => import("@/pages/Explore"))
const ExplorePlacesPage = lazy(() => import("@/pages/ExplorePlacesPage"))
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

  // params is optional — pages that don't need extra data (the vast
  // majority of onNavigate call sites) keep calling this with just a
  // string, exactly as before. When present, params travels via router
  // state (same pattern already used for airportQuery below) rather than
  // a URL query string, since some of it (destinations arrays) isn't
  // cleanly serializable to a URL.
  const handleNavigate = (dest, params) => {
    const routes = {
      welcome: "/",
      home: "/flights",
      places: "/places",
      explore: "/explore",
      "explore-places": "/explore/places",
      "airport-board": "/airport-board",
      "how-it-works": "/how-it-works",
      terms: "/terms",
      privacy: "/privacy",
    }
    navigate(routes[dest] || "/", params ? { state: params } : undefined)
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
          path="/explore"
          element={<Explore onSearch={handleSearch} onNavigate={handleNavigate} />}
        />
        <Route
          path="/explore/places"
          element={<ExplorePlacesRoute onNavigate={handleNavigate} />}
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

function ExplorePlacesRoute({ onNavigate }) {
  const location = useLocation()
  const navigate = useNavigate()
  const params = location.state

  // Router state doesn't survive a hard refresh or a pasted/shared link —
  // unlike AirportBoard (which degrades fine to an empty query), this page
  // has nothing useful to show without origin/destinations, so bounce back
  // to /explore rather than render a broken empty page.
  if (!params) {
    navigate("/explore", { replace: true })
    return null
  }

  return <ExplorePlacesPage {...params} onNavigate={onNavigate} />
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