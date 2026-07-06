import { useTranslation } from "react-i18next"
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
  const { t } = useTranslation()

  return (
    <div className="space-y-5">
      <CheckboxFilterGroup label={t("filters.airline")} options={meta.airlines} selected={selectedAirlines} setSelected={setSelectedAirlines} />
      <CheckboxFilterGroup label={t("filters.depart")} options={meta.departLabels} selected={selectedDepart} setSelected={setSelectedDepart} hideShowAll />
      <RangeFilterGroup label={t("filters.departure_time")} min={0} max={1439} value={departTime} onChange={setDepartTime} formatLabel={formatMinutesLabel} />
      <RangeFilterGroup label={t("filters.arrival_time")} min={0} max={1439} value={arriveTime} onChange={setArriveTime} formatLabel={formatMinutesLabel} />
      <RangeFilterGroup label={t("filters.duration")} min={meta.durationRange[0]} max={meta.durationRange[1]} value={duration} onChange={setDuration} formatLabel={formatDurationLabel} />
      <CheckboxFilterGroup label={t("filters.connection")} options={meta.connections} selected={selectedConnections} setSelected={setSelectedConnections} />
      <CheckboxFilterGroup label={t("filters.aircraft")} options={meta.aircraft} selected={selectedAircraft} setSelected={setSelectedAircraft} />
    </div>
  )
}