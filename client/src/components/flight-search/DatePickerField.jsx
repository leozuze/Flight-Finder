import { useState, useRef, useEffect } from "react"
import { DayPicker } from "react-day-picker"
import { CalendarDays } from "lucide-react"
import "react-day-picker/style.css"

// Local-date-safe helpers — never route through toISOString()/UTC, since
// that can shift the date by a day depending on the user's timezone offset.
function parseISO(iso) {
  if (!iso) return undefined
  const [y, m, d] = iso.split("-").map(Number)
  return new Date(y, m - 1, d)
}

function toISO(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

function formatDisplay(iso) {
  const date = parseISO(iso)
  if (!date) return ""
  return date.toLocaleDateString(undefined, {
    weekday: "short", month: "short", day: "numeric", year: "numeric",
  })
}

export default function DatePickerField({ label, value, onChange, minDate, placeholder }) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [open])

  const selected = parseISO(value)
  const min = minDate ? parseISO(minDate) : undefined

  const handleSelect = (date) => {
    if (!date) return
    onChange(toISO(date))
    setOpen(false)
  }

  return (
    <div className="relative" ref={containerRef}>
      <label className="text-xs font-semibold text-slate-400 tracking-wide">{label}</label>

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-cyan-500 transition-colors flex items-center justify-between gap-2 text-left"
      >
        <span className={value ? "text-slate-900" : "text-slate-400"}>
          {value ? formatDisplay(value) : placeholder}
        </span>
        <CalendarDays className="w-4 h-4 text-slate-400 shrink-0" />
      </button>

      {open && (
        <div className="absolute z-50 mt-2 bg-white border border-slate-200 rounded-xl shadow-lg p-3">
          <DayPicker
            mode="single"
            selected={selected}
            onSelect={handleSelect}
            defaultMonth={selected || min}
            disabled={min ? { before: min } : undefined}
            classNames={{
              months: "flex flex-col",
              month: "space-y-3",
              month_caption: "flex justify-center items-center h-9 relative",
              caption_label: "text-sm font-semibold text-[#0B4F6C]",
              nav: "flex items-center justify-between absolute inset-x-0 top-0 h-9 px-1",
              button_previous: "h-7 w-7 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500 transition-colors disabled:opacity-30 disabled:hover:bg-transparent",
              button_next: "h-7 w-7 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500 transition-colors disabled:opacity-30 disabled:hover:bg-transparent",
              month_grid: "w-full border-collapse mt-2",
              weekdays: "flex",
              weekday: "text-slate-400 text-xs font-medium w-9 h-9 flex items-center justify-center",
              week: "flex",
              day: "w-9 h-9 flex items-center justify-center p-0",
              day_button: "w-9 h-9 flex items-center justify-center rounded-full text-sm text-slate-700 hover:bg-cyan-50 transition-colors",
              today: "[&>button]:font-semibold [&>button]:text-cyan-600",
              selected: "[&>button]:bg-cyan-500 [&>button]:text-white [&>button]:hover:bg-cyan-600 [&>button]:font-medium",
              outside: "[&>button]:text-slate-300",
              disabled: "[&>button]:text-slate-300 [&>button]:hover:bg-transparent [&>button]:cursor-not-allowed",
              hidden: "invisible",
            }}
          />
        </div>
      )}
    </div>
  )
}