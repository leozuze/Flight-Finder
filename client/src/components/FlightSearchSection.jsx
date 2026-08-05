import { useEffect, useRef } from "react"
import { useTranslation } from "react-i18next"
import FlightSearchForm from "@/components/flight-search/FlightSearchForm"
import FlightResultsTable from "@/components/flight-search/FlightResultsTable"
import OtherFlightsSection from "@/components/flight-search/OtherFlightsSection"
import SearchProgressSteps from "@/components/flight-search/SearchProgressSteps"
import { useDelayedLoading } from "@/hooks/useDelayedLoading"
import { useSearchContext } from "@/context/SearchContext"
import { searchFlights, quickSearchFlights, checkFlightStatus } from "@/api/flightApi"

const extractCode = (val) => {
  const match = (val || "").match(/\(([A-Z]{3})\)\s*$/)
  return match ? match[1] : (val || "").trim()
}

export default function FlightSearchSection({ onSelectFlight }) {
  const { t } = useTranslation()
  const {
    origin, setOrigin,
    destination, setDestination,
    tripType, setTripType,
    departDate, setDepartDate,
    returnDate, setReturnDate,
    budget, setBudget,
    currency, setCurrency,
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
  } = useSearchContext()

  const showLoading = useDelayedLoading(loading)
  const showQuickLoading = useDelayedLoading(quickLoading)

  const lastTriggerRef = useRef(quickSearchTrigger)

  const swap = () => {
    setOrigin(destination)
    setDestination(origin)
  }

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!origin || !destination || !budget || !departDate) return
    if (tripType === "round" && !returnDate) return

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
        departDate, returnDate: tripType === "round" ? returnDate : null,
        budget: Number(budget), currency,
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

  useEffect(() => {
    if (quickSearchTrigger === lastTriggerRef.current) return
    lastTriggerRef.current = quickSearchTrigger
    runQuickSearch(origin, destination, travelClass)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quickSearchTrigger])

  return (
    <section id="search" className="py-20">
      <FlightSearchForm
        origin={origin} setOrigin={setOrigin}
        destination={destination} setDestination={setDestination}
        tripType={tripType} setTripType={setTripType}
        departDate={departDate} setDepartDate={setDepartDate}
        returnDate={returnDate} setReturnDate={setReturnDate}
        budget={budget} setBudget={setBudget}
        currency={currency} setCurrency={setCurrency}
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