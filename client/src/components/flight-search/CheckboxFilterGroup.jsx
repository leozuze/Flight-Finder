import { useTranslation } from "react-i18next"

export default function CheckboxFilterGroup({ label, options, selected, setSelected, hideShowAll }) {
  const { t } = useTranslation()
  if (!options.length) return null
  const allSelected = selected.length === options.length

  const toggleOption = (opt) => {
    setSelected(selected.includes(opt) ? selected.filter((v) => v !== opt) : [...selected, opt])
  }

  return (
    <div>
      <div className="text-xs font-semibold text-orange-500 tracking-wide mb-2">{label}</div>
      <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
        {!hideShowAll && (
          <label className="flex items-center gap-2 text-sm text-slate-700 font-medium">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={() => setSelected(allSelected ? [] : options)}
              className="accent-cyan-500"
            />
            {t("filters.show_all")}
          </label>
        )}
        {options.map((opt) => (
          <div key={opt} className="flex items-center justify-between gap-2">
            <label className="flex items-center gap-2 text-sm text-slate-700 min-w-0">
              <input
                type="checkbox"
                checked={selected.includes(opt)}
                onChange={() => toggleOption(opt)}
                className="accent-cyan-500 shrink-0"
              />
              <span className="truncate">{opt}</span>
            </label>
            <button
              type="button"
              onClick={() => setSelected([opt])}
              className="text-xs text-cyan-600 underline shrink-0"
            >
              {t("filters.only")}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}