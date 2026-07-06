import i18n from "i18next"
import { initReactI18next } from "react-i18next"
import LanguageDetector from "i18next-browser-languagedetector"

import en from "./locales/en.json"
import fr from "./locales/fr.json"
import es from "./locales/es.json"
import pt from "./locales/pt.json"
import ar from "./locales/ar.json"
import zh from "./locales/zh.json"
import de from "./locales/de.json"
import ja from "./locales/ja.json"
import ru from "./locales/ru.json"
import it from "./locales/it.json"
import ko from "./locales/ko.json"
import nl from "./locales/nl.json"
import tr from "./locales/tr.json"

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      "en-US": { translation: en },
      "en-GB": { translation: en },
      fr: { translation: fr },
      es: { translation: es },
      pt: { translation: pt },
      ar: { translation: ar },
      zh: { translation: zh },
      de: { translation: de },
      ja: { translation: ja },
      ru: { translation: ru },
      it: { translation: it },
      ko: { translation: ko },
      nl: { translation: nl },
      tr: { translation: tr },
    },
    fallbackLng: "en-US",
    interpolation: {
      escapeValue: false, // React already escapes output
    },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
    },
  })

export default i18n