import { useEffect, useState } from 'react'
import { Clock, Users } from 'lucide-react'
import { useKioskStore } from '../../store/useKioskStore'

const PRIORITY_DOT = {
  'Chest Pain': 'bg-alert-500',
  'High Fever / Chills': 'bg-caution-500',
  'Abdominal Discomfort': 'bg-caution-500',
  'Severe Cough': 'bg-signal-500',
}

function useMinutesAgo(ts) {
  const [, setTick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 30000)
    return () => clearInterval(id)
  }, [])
  return Math.max(0, Math.round((Date.now() - ts) / 60000))
}

function QueueRow({ patient, active, onSelect }) {
  const minutes = useMinutesAgo(patient.waitSince)
  const dot = PRIORITY_DOT[patient.complaint.symptomLabel] ?? 'bg-ink-faint'

  return (
    <button
      onClick={onSelect}
      className={`tap w-full text-left rounded-xl border p-3.5 transition-colors ${
        active ? 'border-clinic-500 bg-clinic-50' : 'border-line bg-surface hover:border-line-strong'
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm font-semibold text-ink shrink-0">#{patient.token}</span>
          <span className="text-sm text-ink truncate">{patient.name}</span>
        </div>
        {patient.status === 'pushed' && (
          <span className="text-[10px] font-semibold text-clinic-700 bg-clinic-100 px-1.5 py-0.5 rounded shrink-0">
            SENT
          </span>
        )}
      </div>
      <p className="text-xs text-ink-faint mb-2">
        {patient.age} yrs · {patient.gender === 'M' ? 'Male' : 'Female'} · {patient.room}
      </p>
      <div className="flex items-center justify-between gap-2">
        <span className={`inline-flex items-center gap-1.5 text-xs font-medium text-ink-soft`}>
          <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
          {patient.complaint.symptomLabel}
        </span>
        <span className="flex items-center gap-1 text-xs text-ink-faint tabular-nums">
          <Clock size={11} />
          {minutes}m
        </span>
      </div>
    </button>
  )
}

export default function QueueSidebar() {
  const { state, selectQueuePatient } = useKioskStore()
  const sortedByWait = [...state.queue].sort((a, b) => a.waitSince - b.waitSince)

  return (
    <aside className="w-full sm:w-80 shrink-0 border-r border-line bg-surface flex flex-col min-h-0">
      <div className="px-4 py-4 border-b border-line flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users size={16} className="text-ink-soft" />
          <p className="text-sm font-semibold text-ink">Live queue</p>
        </div>
        <span className="text-xs font-medium text-ink-faint bg-surface-sunk px-2 py-1 rounded-full">
          {state.queue.length} waiting
        </span>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2 no-scrollbar">
        {sortedByWait.map((p) => (
          <QueueRow
            key={p.id}
            patient={p}
            active={p.id === state.selectedPatientId}
            onSelect={() => selectQueuePatient(p.id)}
          />
        ))}
        {sortedByWait.length === 0 && (
          <p className="text-sm text-ink-faint text-center py-10">No patients in queue yet</p>
        )}
      </div>
    </aside>
  )
}
