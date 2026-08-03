import { useState, useRef, useEffect } from "react"
import airports from "@/data/airports.json"

function searchAirports(query) {
  if (!query || query.trim().length < 2) return []
  const q = query.trim().toLowerCase()

  return airports
    .filter(
      (a) =>
        a.iata.toLowerCase().startsWith(q) ||
        a.city.toLowerCase().includes(q) ||
        a.name.toLowerCase().includes(q)
    )
    .slice(0, 20)
}

function highlightMatch(text, query) {
  if (!query || !text) return text
  const idx = text.toLowerCase().indexOf(query.toLowerCase())
  if (idx === -1) return text
  return (
    <>
      {text.slice(0, idx)}
      <span className="font-bold">{text.slice(idx, idx + query.length)}</span>
      {text.slice(idx + query.length)}
    </>
  )
}

export default function AirportAutocomplete({ value, onChange, onSelect, placeholder, className, style ,dropdownAlign = "left"}) {
  const [open, setOpen] = useState(false)
  const [highlighted, setHighlighted] = useState(-1)
  const wrapperRef = useRef(null)

  const q = value?.trim() || ""
  const results = searchAirports(q)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSelect = (airport) => {
    onSelect(airport)
    setOpen(false)
    setHighlighted(-1)
  }

  const handleKeyDown = (e) => {
    if (!open || results.length === 0) return
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setHighlighted((h) => (h + 1) % results.length)
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setHighlighted((h) => (h - 1 + results.length) % results.length)
    } else if (e.key === "Enter" && highlighted >= 0) {
      e.preventDefault()
      handleSelect(results[highlighted])
    } else if (e.key === "Escape") {
      setOpen(false)
    }
  }

  return (
    <div className="relative flex-1 min-w-0" ref={wrapperRef}>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          onChange(e.target.value)
          setOpen(true)
          setHighlighted(-1)
        }}
        onFocus={() => value && setOpen(true)}
        onKeyDown={handleKeyDown}
        className={className}
        style={style}
        autoComplete="off"
      />

      {open && results.length > 0 && (
        <div  className={`absolute top-full mt-1 w-80 max-w-[90vw] max-h-72 overflow-y-auto rounded-lg border shadow-xl z-50 bg-white ${
        dropdownAlign === "right" ? "right-0" : "left-0"
      }`}>
          {results.map((a, i) => (
            <button
                key={a.iata}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleSelect(a)}
                onMouseEnter={() => setHighlighted(i)}
                className={`w-full text-left px-3 py-2 text-sm border-b border-slate-100 last:border-b-0 ${
                i === highlighted ? "bg-cyan-600 text-white" : "text-slate-900 hover:bg-slate-50"
                }`}
            >
                <div className={i === highlighted ? "text-white" : "text-slate-900"}>
                {highlightMatch(a.city || a.name, q)}
                {a.name && a.city && (
                    <>
                    {" ("}
                    {highlightMatch(a.name, q)}
                    {")"}
                    </>
                )}
                {" — "}
                {highlightMatch(a.iata, q)}
                </div>
            </button>
            ))}
        </div>
      )}
    </div>
  )
}