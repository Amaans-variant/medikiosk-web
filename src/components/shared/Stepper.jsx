import { ChevronLeft, Check } from 'lucide-react'

const STEP_LABELS = ['Identify', 'Complaint', 'Documents', 'Summary']

export default function Stepper({ currentIndex, onBack, canGoBack }) {
  return (
    <div className="border-b border-line bg-surface">
      <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-5">
        <button
          onClick={onBack}
          disabled={!canGoBack}
          className={`tap flex items-center gap-1 h-12 px-3 rounded-lg text-sm font-medium shrink-0 ${
            canGoBack
              ? 'text-ink hover:bg-surface-sunk'
              : 'text-ink-faint/50 cursor-not-allowed'
          }`}
        >
          <ChevronLeft size={20} />
          Back
        </button>

        <ol className="flex items-center gap-2 flex-1 min-w-0">
          {STEP_LABELS.map((label, i) => {
            const state = i < currentIndex ? 'done' : i === currentIndex ? 'active' : 'upcoming'
            return (
              <li key={label} className="flex items-center gap-2 flex-1 min-w-0">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className={`w-7 h-7 shrink-0 rounded-full grid place-items-center text-xs font-semibold ${
                      state === 'done'
                        ? 'bg-clinic-500 text-white'
                        : state === 'active'
                        ? 'bg-ink text-white'
                        : 'bg-surface-sunk text-ink-faint'
                    }`}
                  >
                    {state === 'done' ? <Check size={14} /> : i + 1}
                  </span>
                  <span
                    className={`text-sm truncate hidden sm:inline ${
                      state === 'upcoming' ? 'text-ink-faint' : 'text-ink font-medium'
                    }`}
                  >
                    {label}
                  </span>
                </div>
                {i < STEP_LABELS.length - 1 && (
                  <span className={`h-px flex-1 ${i < currentIndex ? 'bg-clinic-500' : 'bg-line'}`} />
                )}
              </li>
            )
          })}
        </ol>
      </div>
    </div>
  )
}
