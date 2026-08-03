import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import FlightSearchForm from "@/components/flight-search/FlightSearchForm"
import FlightResultsTable from "@/components/flight-search/FlightResultsTable"
import OtherFlightsSection from "@/components/flight-search/OtherFlightsSection"
import SearchProgressSteps from "@/components/flight-search/SearchProgressSteps"
import { useDelayedLoading } from "@/hooks/useDelayedLoading"
import { searchFlights, quickSearchFlights, checkFlightStatus } from "@/api/flightApi"

const extractCode = (val) => {
  const match = (val || "").match(/\(([A-Z]{3})\)\s*$/)
  return match ? match[1] : (val || "").trim()
}

export default function FlightSearchSection({ externalQuery, onSelectFlight }) {
  const { t } = useTranslation()
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

  // These stay true a beat longer than the real loading flags, so the step
  // checklist gets to finish reading instead of vanishing the instant data
  // arrives — see useDelayedLoading for the reasoning.
  const showLoading = useDelayedLoading(loading)
  const showQuickLoading = useDelayedLoading(quickLoading)

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
      setError(t("flightSearch.invalid_origin_destination"))
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
    } catch (err) {
      console.error("[SkyScout] full search failed:", err)
      setError(t("flightSearch.error_generic"))
    } finally {
      setLoading(false)
    }
  }

  const checkStatus = async (flightNumber, date) => {
    if (!flightNumber || !date) return
    setStatusLoading(true)
    try {
      const data = await checkFlightStatus(flightNumber, date)
      setStatus(data.status || t("flightSearch.status_unavailable"))
    } catch (err) {
      console.error("[SkyScout] status check failed:", err)
      setStatus(t("flightSearch.status_unavailable"))
    } finally {
      setStatusLoading(false)
    }
  }

  useEffect(() => {
    if (!externalQuery) return
    setOrigin(externalQuery.origin)
    setDestination(externalQuery.destination)
    runQuickSearch(externalQuery.origin, externalQuery.destination, travelClass)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [externalQuery])

  const runQuickSearch = async (o, d, tc = travelClass) => {
    setQuickLoading(true)
    setQuickResults(null)
    setQuickError(null)
    setResults(null)
    setError(null)
    try {
      const data = await quickSearchFlights(extractCode(o), extractCode(d), tc)
      if (data.error) setQuickError(data.error)
      else setQuickResults(data)
    } catch (err) {
      console.error("[SkyScout] quick search failed:", err)
      setQuickError(t("flightSearch.error_generic"))
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
        {showQuickLoading && <SearchProgressSteps active={quickLoading} />}

        {!showQuickLoading && quickError && (
          <div className="text-center text-red-500 bg-red-50 border border-red-100 rounded-xl py-4 px-4 text-sm">
            {quickError}
          </div>
        )}

        {!showQuickLoading && quickResults?.flights?.length > 0 && (
          <OtherFlightsSection
            flights={quickResults.flights}
            origin={origin}
            destination={destination}
            originCode={quickResults.originCode}
            destinationCode={quickResults.destinationCode}
            travelClass={travelClass}
            onSelectFlight={onSelectFlight}
            title={t("resultsTable.flight_results")}
          />
        )}

        {!quickResults && !showQuickLoading && (
          <>
            {showLoading && <SearchProgressSteps active={loading} />}

            {!showLoading && error && (
              <div className="text-center text-red-500 bg-red-50 border border-red-100 rounded-xl py-4 px-4 text-sm">
                {error}
              </div>
            )}

            {!showLoading && results?.bestDeal && (
              <FlightResultsTable
                flight={results.bestDeal}
                origin={origin}
                destination={destination}
                travelClass={travelClass}
                status={status}
                statusLoading={statusLoading}
                onCheckStatus={checkStatus}
                onSelectFlight={onSelectFlight}
              />
            )}

            {!showLoading && results?.otherFlights?.length > 0 && (
              <div className="mt-6">
                <OtherFlightsSection
                  flights={results.otherFlights}
                  origin={origin}
                  destination={destination}
                  originCode={results.bestDeal.originCode}
                  destinationCode={results.bestDeal.destinationCode}
                  travelClass={travelClass}
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