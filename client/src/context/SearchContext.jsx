import { createContext, useContext, useState } from "react"

const SearchContext = createContext(null)

export function SearchProvider({ children }) {
  const [origin, setOrigin] = useState("")
  const [destination, setDestination] = useState("")
  const [tripType, setTripType] = useState("round")
  const [budget, setBudget] = useState("")
  const [currency, setCurrency] = useState("GBP")
  const [email, setEmail] = useState("")
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const [adults, setAdults] = useState(1)
  const [travelClass, setTravelClass] = useState("economy")

  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState(null)
  const [error, setError] = useState(null)

  const [status, setStatus] = useState(null)
  const [statusLoading, setStatusLoading] = useState(false)

  const [quickResults, setQuickResults] = useState(null)
  const [quickLoading, setQuickLoading] = useState(false)
  const [quickError, setQuickError] = useState(null)

  // Incremented whenever the navbar (or anything outside FlightSearchSection)
  // wants to trigger a quick search. FlightSearchSection watches this value
  // and runs the search when it changes — decouples the trigger from prop
  // drilling / router state, so it survives navigation.
  const [quickSearchTrigger, setQuickSearchTrigger] = useState(0)

  const triggerQuickSearch = (newOrigin, newDestination) => {
    setOrigin(newOrigin)
    setDestination(newDestination)
    setQuickSearchTrigger((n) => n + 1)
  }

  const value = {
    origin, setOrigin,
    destination, setDestination,
    tripType, setTripType,
    budget, setBudget,
    currency, setCurrency,
    email, setEmail,
    advancedOpen, setAdvancedOpen,
    adults, setAdults,
    travelClass, setTravelClass,
    loading, setLoading,
    results, setResults,
    error, setError,
    status, setStatus,
    statusLoading, setStatusLoading,
    quickResults, setQuickResults,
    quickLoading, setQuickLoading,
    quickError, setQuickError,
    quickSearchTrigger,
    triggerQuickSearch,
  }

  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>
}

export function useSearchContext() {
  const ctx = useContext(SearchContext)
  if (!ctx) throw new Error("useSearchContext must be used within a SearchProvider")
  return ctx
}