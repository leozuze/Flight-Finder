import fs from "fs"
import path from "path"
import * as deepl from "deepl-node"
import dotenv from "dotenv"

dotenv.config()

const authKey = process.env.DEEPL_API_KEY
if (!authKey) {
  console.error("Missing DEEPL_API_KEY in .env")
  process.exit(1)
}

const translator = new deepl.Translator(authKey)

const SOURCE_PATH = path.resolve("src/i18n/locales/en.json")
const LOCALES_DIR = path.resolve("src/i18n/locales")

// DeepL target language codes mapped to your locale file names
const DEEPL_SUPPORTED = {
  fr: "fr",
  es: "es",
  pt: "pt-PT",
  ar: "ar",
  zh: "zh",
  de: "de",
  ja: "ja",
  ru: "ru",
  it: "it",
  ko: "ko",
  nl: "nl",
  tr: "tr",
}

const source = JSON.parse(fs.readFileSync(SOURCE_PATH, "utf-8"))

// Flatten nested JSON into { "namespace.key": "value" } pairs
function flatten(obj, prefix = "") {
  const result = {}
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key
    if (typeof value === "object" && value !== null) {
      Object.assign(result, flatten(value, fullKey))
    } else {
      result[fullKey] = value
    }
  }
  return result
}

// Rebuild nested JSON from { "namespace.key": "value" } pairs
function unflatten(flat) {
  const result = {}
  for (const [flatKey, value] of Object.entries(flat)) {
    const parts = flatKey.split(".")
    let cursor = result
    parts.forEach((part, i) => {
      if (i === parts.length - 1) {
        cursor[part] = value
      } else {
        cursor[part] = cursor[part] || {}
        cursor = cursor[part]
      }
    })
  }
  return result
}

async function translateLocale(localeCode, deeplTarget) {
  const flatSource = flatten(source)
  const keys = Object.keys(flatSource)
  const texts = Object.values(flatSource)

  console.log(`Translating ${keys.length} strings into ${localeCode}...`)

  const results = await translator.translateText(texts, "en", deeplTarget)

  const flatTranslated = {}
  keys.forEach((key, i) => {
    flatTranslated[key] = results[i].text
  })

  const nested = unflatten(flatTranslated)
  const outputPath = path.join(LOCALES_DIR, `${localeCode}.json`)
  fs.writeFileSync(outputPath, JSON.stringify(nested, null, 2))
  console.log(`Wrote ${outputPath}`)
}

async function main() {
  for (const [localeCode, deeplTarget] of Object.entries(DEEPL_SUPPORTED)) {
    try {
      await translateLocale(localeCode, deeplTarget)
    } catch (err) {
      console.error(`Failed to translate ${localeCode}:`, err.message)
    }
  }

  console.log("\nDone. Review all generated files before committing.")
}

main()