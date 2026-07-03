import CheckboxFilterGroup from "./CheckboxFilterGroup"
import RangeFilterGroup from "./RangeFilterGroup"
import { formatMinutesLabel, formatDurationLabel } from "@/utils/flightFormatters"

export default function FilterPanelContent({
  meta,
  selectedAirlines, setSelectedAirlines,
  selectedAircraft, setSelectedAircraft,
  selectedConnections, setSelectedConnections,
  selectedDepart, setSelectedDepart,
  departTime, setDepartTime,
  arriveTime, setArriveTime,
  duration, setDuration,
}) {
  return (
    <div className="space-y-5">
      <CheckboxFilterGroup label="Airline" options={meta.airlines} selected={selectedAirlines} setSelected={setSelectedAirlines} />
      <CheckboxFilterGroup label="Depart" options={meta.departLabels} selected={selectedDepart} setSelected={setSelectedDepart} hideShowAll />
      <RangeFilterGroup label="Departure Time" min={0} max={1439} value={departTime} onChange={setDepartTime} formatLabel={formatMinutesLabel} />
      <RangeFilterGroup label="Arrival Time" min={0} max={1439} value={arriveTime} onChange={setArriveTime} formatLabel={formatMinutesLabel} />
      <RangeFilterGroup label="Duration" min={meta.durationRange[0]} max={meta.durationRange[1]} value={duration} onChange={setDuration} formatLabel={formatDurationLabel} />
      <CheckboxFilterGroup label="Connection" options={meta.connections} selected={selectedConnections} setSelected={setSelectedConnections} />
      <CheckboxFilterGroup label="Aircraft" options={meta.aircraft} selected={selectedAircraft} setSelected={setSelectedAircraft} />
    </div>
  )
}