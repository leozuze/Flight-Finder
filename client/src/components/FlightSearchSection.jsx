import { useState, useEffect } from "react"
import FlightSearchForm from "@/components/flight-search/FlightSearchForm"
import FlightResultsTable from "@/components/flight-search/FlightResultsTable"
import OtherFlightsSection from "@/components/flight-search/OtherFlightsSection"
import { searchFlights, quickSearchFlights, checkFlightStatus } from "@/api/flightApi"

// Same logic as Navbar.jsx: pulls "KJFK" out of "New York (KJFK)".
// Falls back to the trimmed raw value if there's no parenthesized code,
// so plain city-name typing still works.
const extractCode = (val) => {
  const match = (val || "").match(/\(([A-Z]{3})\)\s*$/)
  return match ? match[1] : (val || "").trim()
}

export default function FlightSearchSection({ externalQuery, onSelectFlight }) {
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

  const swap = () => {
    setOrigin(destination)
    setDestination(origin)
  }

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!origin || !destination || !budget || !email) return

    const originCode = extractCode(origin)
    const destinationCode = extractCode(destination)

    if (!originCode || !destinationCode) {
      setError("Please select a valid origin and destination.")
      return
    }

    setLoading(true)
    setResults(null)
    setError(null)
    setStatus(null)
    setQuickResults(null)

    try {
      const data = await searchFlights({
        origin: originCode, destination: destinationCode, tripType,
        budget: Number(budget), currency, email,
        adults: Number(adults), travelClass,
      })

      if (data.error) setError(data.error)
      else setResults(data)
    } catch {
      setError("Something went wrong reaching the search service. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const checkStatus = async (flightNumber, date) => {
    if (!flightNumber || !date) return
    setStatusLoading(true)
    try {
      const data = await checkFlightStatus(flightNumber, date)
      setStatus(data.status || "Unavailable")
    } catch {
      setStatus("Unavailable")
    } finally {
      setStatusLoading(false)
    }
  }

  useEffect(() => {
    if (!externalQuery) return
    setOrigin(externalQuery.origin)
    setDestination(externalQuery.destination)
    runQuickSearch(externalQuery.origin, externalQuery.destination)
  }, [externalQuery])

  const runQuickSearch = async (o, d) => {
    setQuickLoading(true)
    setQuickResults(null)
    setQuickError(null)
    setResults(null)
    setError(null)
    try {
      const data = await quickSearchFlights(extractCode(o), extractCode(d))
      if (data.error) setQuickError(data.error)
      else setQuickResults(data)
    } catch {
      setQuickError("Something went wrong reaching the search service. Please try again.")
    } finally {
      setQuickLoading(false)
    }
  }

  return (
    <section id="search" className="py-20">
      <FlightSearchForm
        origin={origin} setOrigin={setOrigin}
        destination={destination} setDestination={setDestination}
        tripType={tripType} setTripType={setTripType}
        budget={budget} setBudget={setBudget}
        currency={currency} setCurrency={setCurrency}
        email={email} setEmail={setEmail}
        advancedOpen={advancedOpen} setAdvancedOpen={setAdvancedOpen}
        adults={adults} setAdults={setAdults}
        travelClass={travelClass} setTravelClass={setTravelClass}
        loading={loading}
        onSubmit={handleSearch}
        onSwap={swap}
      />

      <div className="mt-8">
        {quickLoading && (
          <div className="text-center text-slate-400 py-10 animate-pulse">
            Scanning routes for the cheapest fares...
          </div>
        )}

        {!quickLoading && quickError && (
          <div className="text-center text-red-500 bg-red-50 border border-red-100 rounded-xl py-4 px-4 text-sm">
            {quickError}
          </div>
        )}

        {!quickLoading && quickResults?.flights?.length > 0 && (
          <OtherFlightsSection
            flights={quickResults.flights}
            origin={origin}
            destination={destination}
            originCode={quickResults.originCode}
            destinationCode={quickResults.destinationCode}
            onSelectFlight={onSelectFlight}

            title="Flight Results"
          />
        )}

        {!quickResults && !quickLoading && (
          <>
            {loading && (
              <div className="text-center text-slate-400 py-10 animate-pulse">
                Scanning routes for the cheapest fares...
              </div>
            )}

            {!loading && error && (
              <div className="text-center text-red-500 bg-red-50 border border-red-100 rounded-xl py-4 px-4 text-sm">
                {error}
              </div>
            )}

            {!loading && results?.bestDeal && (
              <FlightResultsTable
                flight={results.bestDeal}
                origin={origin}
                destination={destination}
                status={status}
                statusLoading={statusLoading}
                onCheckStatus={checkStatus}
                onSelectFlight={onSelectFlight}
              />
            )}

            {!loading && results?.otherFlights?.length > 0 && (
              <div className="mt-6">
                <OtherFlightsSection
                  flights={results.otherFlights}
                  origin={origin}
                  destination={destination}
                  originCode={results.bestDeal.originCode}
                  destinationCode={results.bestDeal.destinationCode}
                  onSelectFlight={onSelectFlight}
                />
              </div>
            )}
          </>
        )}
      </div>
    </section>
  )
}
