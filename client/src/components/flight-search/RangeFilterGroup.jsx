import { Range, getTrackBackground } from "react-range"

export default function RangeFilterGroup({ label, min, max, value, onChange, formatLabel }) {
  if (min === max) return null

  const clamped = [
    Math.min(Math.max(value[0], min), max),
    Math.min(Math.max(value[1], min), max),
  ]
  const safeValues = clamped[0] <= clamped[1] ? clamped : [min, max]

  return (
    <div>
      <div className="text-xs font-semibold text-orange-500 tracking-wide mb-1">{label}</div>
      <div className="text-sm text-slate-600 mb-3">
        {formatLabel(safeValues[0])} - {formatLabel(safeValues[1])}
      </div>
      <div className="px-1">
        <Range
          step={Math.max(1, Math.round((max - min) / 200))}
          min={min}
          max={max}
          values={safeValues}
          onChange={(vals) => onChange(vals)}
          renderTrack={({ props, children }) => (
            <div
              {...props}
              className="h-1.5 w-full rounded-full"
              style={{
                ...props.style,
                background: getTrackBackground({
                  values: safeValues,
                  colors: ["#e2e8f0", "#06b6d4", "#e2e8f0"],
                  min,
                  max,
                }),
              }}
            >
              {children}
            </div>
          )}
          renderThumb={({ props }) => (
            <div
              {...props}
              className="w-4 h-4 rounded-full bg-white border-2 border-cyan-500 shadow focus:outline-none focus:ring-2 focus:ring-cyan-300"
            />
          )}
        />
      </div>
    </div>
  )
}