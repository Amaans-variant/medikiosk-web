import { ArrowRight, Check } from 'lucide-react'
import { useKioskStore } from '../../store/useKioskStore'
import { SYMPTOMS, DURATION_OPTIONS, SEVERITY_ANCHORS, ASSOCIATED_SYMPTOMS } from '../../data/mockData'

function nearestAnchor(value) {
  const keys = Object.keys(SEVERITY_ANCHORS).map(Number)
  return keys.reduce((closest, k) => (Math.abs(k - value) < Math.abs(closest - value) ? k : closest))
}

export default function ComplaintStep() {
  const { state, setComplaintField, toggleAssociatedSymptom, nextStep } = useKioskStore()
  const { symptomId, duration, severity, associated } = state.complaint
  const selectedSymptom = SYMPTOMS.find((s) => s.id === symptomId)
  const canContinue = Boolean(symptomId && duration)

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold text-ink mb-1">What brings you in today?</h1>
      <p className="text-ink-soft mb-8">Select the symptom that best matches your main concern.</p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {SYMPTOMS.map((s) => {
          const Icon = s.icon
          const active = s.id === symptomId
          return (
            <button
              key={s.id}
              onClick={() => setComplaintField({ symptomId: s.id, duration: null, associated: [] })}
              className={`tap flex flex-col items-center justify-center text-center gap-3 rounded-2xl border p-5 min-h-[132px] ${
                active
                  ? 'border-clinic-500 bg-clinic-50 ring-1 ring-clinic-500'
                  : 'border-line bg-surface hover:border-line-strong'
              }`}
            >
              <div
                className={`w-12 h-12 rounded-xl grid place-items-center ${
                  active ? 'bg-clinic-500 text-white' : 'bg-surface-sunk text-ink-soft'
                }`}
              >
                <Icon size={22} />
              </div>
              <span className="text-sm font-medium text-ink leading-tight">{s.label}</span>
            </button>
          )
        })}
      </div>

      {selectedSymptom && (
        <div className="rounded-2xl border border-line bg-surface p-6 space-y-8 animate-rise">
          <div>
            <p className="text-sm font-medium text-ink-soft mb-3">How long has this been going on?</p>
            <div className="flex flex-wrap gap-2">
              {DURATION_OPTIONS.map((d) => (
                <button
                  key={d}
                  onClick={() => setComplaintField({ duration: d })}
                  className={`tap h-12 px-6 rounded-full text-sm font-medium border ${
                    duration === d
                      ? 'bg-ink text-white border-ink'
                      : 'bg-surface text-ink-soft border-line hover:border-line-strong'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-baseline justify-between mb-3">
              <p className="text-sm font-medium text-ink-soft">How severe is it right now?</p>
              <span className="text-2xl font-semibold text-ink tabular-nums">{severity}</span>
            </div>
            <input
              type="range"
              min={1}
              max={10}
              step={1}
              value={severity}
              onChange={(e) => setComplaintField({ severity: Number(e.target.value) })}
              className="w-full h-3 accent-clinic-500 cursor-pointer"
            />
            <div className="flex justify-between text-xs text-ink-faint mt-2">
              <span>1 · Mild</span>
              <span>10 · Severe</span>
            </div>
            <p className="text-sm text-clinic-700 font-medium mt-3">{SEVERITY_ANCHORS[nearestAnchor(severity)]}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-ink-soft mb-3">Any associated symptoms? (optional)</p>
            <div className="flex flex-wrap gap-2">
              {ASSOCIATED_SYMPTOMS[symptomId].map((sym) => {
                const on = associated.includes(sym)
                return (
                  <button
                    key={sym}
                    onClick={() => toggleAssociatedSymptom(sym)}
                    className={`tap flex items-center gap-1.5 h-11 px-4 rounded-full text-sm font-medium border ${
                      on
                        ? 'bg-clinic-500 border-clinic-500 text-white'
                        : 'bg-surface border-line text-ink-soft hover:border-line-strong'
                    }`}
                  >
                    {on && <Check size={14} />}
                    {sym}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end mt-8">
        <button
          onClick={nextStep}
          disabled={!canContinue}
          className="tap h-14 px-6 rounded-xl bg-clinic-500 text-white font-semibold flex items-center gap-2 disabled:bg-line-strong disabled:text-ink-faint"
        >
          Continue
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  )
}
