import { Wifi, Siren, Cross } from 'lucide-react'
import { useKioskStore } from '../store/useKioskStore'
import { LANGUAGES } from '../data/mockData'

export default function TopBar() {
  const { state, setView } = useKioskStore()
  const lang = LANGUAGES.find((l) => l.code === state.language) ?? LANGUAGES[0]

  return (
    <header className="h-16 shrink-0 border-b border-line bg-surface flex items-center px-4 sm:px-6 gap-4">
      <div className="flex items-center gap-2 shrink-0">
        <div className="w-9 h-9 rounded-lg bg-clinic-500 grid place-items-center">
          <Cross size={18} className="text-white" strokeWidth={2.5} />
        </div>
        <div className="hidden md:block leading-tight">
          <p className="font-semibold text-ink text-sm">MediKiosk</p>
          <p className="text-xs text-ink-faint">City General OPD · Block C</p>
        </div>
      </div>

      <div className="flex-1 flex justify-center">
        <div className="inline-flex bg-surface-sunk rounded-xl p-1 gap-1">
          <button
            onClick={() => setView('kiosk')}
            className={`tap h-11 px-4 sm:px-5 rounded-lg text-sm font-medium transition-colors ${
              state.activeView === 'kiosk' ? 'bg-surface shadow-panel text-ink' : 'text-ink-soft'
            }`}
          >
            Patient Kiosk Mode
          </button>
          <button
            onClick={() => setView('physician')}
            className={`tap h-11 px-4 sm:px-5 rounded-lg text-sm font-medium transition-colors ${
              state.activeView === 'physician' ? 'bg-surface shadow-panel text-ink' : 'text-ink-soft'
            }`}
          >
            Physician Console
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <div className="hidden sm:flex items-center gap-1.5 h-9 px-3 rounded-full bg-clinic-50 text-clinic-700 text-xs font-medium">
          <Wifi size={14} />
          ABDM Online
        </div>
        <div className="hidden md:flex items-center h-9 px-3 rounded-full bg-surface-sunk text-ink-soft text-xs font-medium">
          {lang.native}
        </div>
        <button
          className="tap h-11 w-11 sm:w-auto sm:px-4 grid place-items-center sm:flex sm:items-center sm:gap-1.5 rounded-lg bg-alert-500 text-white text-sm font-semibold hover:bg-alert-600"
          aria-label="Emergency SOS"
        >
          <Siren size={18} />
          <span className="hidden sm:inline">SOS</span>
        </button>
      </div>
    </header>
  )
}
