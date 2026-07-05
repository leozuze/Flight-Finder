import fs from "fs"
import path from "path"

// Adjust this path to wherever your raw CSV actually landed in src/assets
const RAW_CSV_PATH = path.resolve("src/assets/airports.csv")
const OUTPUT_PATH = path.resolve("src/data/airports.json")

const raw = fs.readFileSync(RAW_CSV_PATH, "utf-8")
const lines = raw.split("\n").filter(Boolean)
const headers = lines[0].split(",").map((h) => h.replace(/"/g, "").trim())

function parseCsvLine(line) {
  // handles simple quoted commas in fields
  const result = []
  let cur = ""
  let inQuotes = false
  for (const char of line) {
    if (char === '"') inQuotes = !inQuotes
    else if (char === "," && !inQuotes) {
      result.push(cur)
      cur = ""
    } else cur += char
  }
  result.push(cur)
  return result
}

const idx = (name) => headers.indexOf(name)

const typeIdx = idx("type")
const iataIdx = idx("iata_code")
const nameIdx = idx("name")
const cityIdx = idx("municipality")
const countryIdx = idx("iso_country")

const KEEP_TYPES = new Set(["large_airport", "medium_airport"])

const airports = []

for (let i = 1; i < lines.length; i++) {
  const cols = parseCsvLine(lines[i])
  const type = cols[typeIdx]?.replace(/"/g, "").trim()
  const iata = cols[iataIdx]?.replace(/"/g, "").trim()

  if (!KEEP_TYPES.has(type)) continue
  if (!iata) continue

  airports.push({
    iata,
    name: cols[nameIdx]?.replace(/"/g, "").trim() || "",
    city: cols[cityIdx]?.replace(/"/g, "").trim() || "",
    country: cols[countryIdx]?.replace(/"/g, "").trim() || "",
  })
}

fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true })
fs.writeFileSync(OUTPUT_PATH, JSON.stringify(airports))
console.log(`Wrote ${airports.length} airports to ${OUTPUT_PATH}`)