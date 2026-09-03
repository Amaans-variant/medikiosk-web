import { useState } from 'react'
import { CheckCircle2, Clock, DoorOpen, Ticket, RotateCcw, Pill, FlaskConical } from 'lucide-react'
import { useKioskStore } from '../../store/useKioskStore'
import { SYMPTOMS } from '../../data/mockData'

let tokenCounter = 42

export default function SummaryStep() {
  const { state, dispatchToken, resetKiosk } = useKioskStore()
  const { patient, complaint, documents, lastToken } = state
  const [confirmed, setConfirmed] = useState(Boolean(lastToken))

  const symptom = SYMPTOMS.find((s) => s.id === complaint.symptomId)

  const handleConfirm = () => {
    const token = tokenCounter++
    const waitMinutes = 8 + Math.floor(Math.random() * 20)
    dispatchToken({
      id: `p-${Date.now()}`,
      token,
      room: symptom?.room ?? 'Room 1',
      waitMinutes,
      name: patient.name,
      age: patient.age,
      gender: patient.gender,
      abhaId: patient.abhaId,
      waitSince: Date.now(),
      complaint: {
        symptomLabel: symptom?.label,
        duration: complaint.duration,
        severity: complaint.severity,
        associated: complaint.associated,
      },
      documents: {
        scanned: documents.status === 'done',
        medications: documents.medications,
        labValues: documents.labValues,
      },
      status: 'waiting',
    })
    setConfirmed(true)
  }

  if (confirmed && state.lastToken) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-14 text-center">
        <div className="w-16 h-16 rounded-full bg-clinic-500 grid place-items-center mx-auto mb-6 animate-rise">
          <CheckCircle2 size={32} className="text-white" />
        </div>
        <h1 className="text-2xl font-semibold text-ink mb-1">You're checked in</h1>
        <p className="text-ink-soft mb-8">Please take a seat in the waiting area. Your token will be called.</p>

        <div className="rounded-2xl border border-line bg-surface p-8 grid grid-cols-3 divide-x divide-line">
          <div className="px-2">
            <Ticket size={18} className="text-clinic-600 mx-auto mb-2" />
            <p className="text-2xl font-semibold text-ink tabular-nums">#{state.lastToken.token}</p>
            <p className="text-xs text-ink-faint mt-1">Token</p>
          </div>
          <div className="px-2">
            <DoorOpen size={18} className="text-clinic-600 mx-auto mb-2" />
            <p className="text-2xl font-semibold text-ink">{state.lastToken.room}</p>
            <p className="text-xs text-ink-faint mt-1">Assigned room</p>
          </div>
          <div className="px-2">
            <Clock size={18} className="text-clinic-600 mx-auto mb-2" />
            <p className="text-2xl font-semibold text-ink tabular-nums">~{state.lastToken.waitMinutes}m</p>
            <p className="text-xs text-ink-faint mt-1">Estimated wait</p>
          </div>
        </div>

        <button
          onClick={() => {
            setConfirmed(false)
            resetKiosk()
          }}
          className="tap mt-10 h-14 px-6 rounded-xl border border-line text-ink font-semibold inline-flex items-center gap-2 hover:bg-surface-sunk"
        >
          <RotateCcw size={18} />
          Start next patient
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold text-ink mb-1">Review your details</h1>
      <p className="text-ink-soft mb-8">Confirm everything looks right before we generate your token.</p>

      <div className="space-y-4">
        <section className="rounded-2xl border border-line bg-surface p-5">
          <p className="text-xs font-semibold text-ink-faint uppercase tracking-wide mb-3">Patient</p>
          <p className="font-medium text-ink">{patient?.name}</p>
          <p className="text-sm text-ink-soft">
            {patient?.age} yrs · {patient?.gender === 'M' ? 'Male' : 'Female'} · ABHA {patient?.abhaId}
          </p>
        </section>

        <section className="rounded-2xl border border-line bg-surface p-5">
          <p className="text-xs font-semibold text-ink-faint uppercase tracking-wide mb-3">Chief complaint</p>
          <p className="font-medium text-ink">
            {symptom?.label} · {complaint.duration} · severity {complaint.severity}/10
          </p>
          {complaint.associated.length > 0 && (
            <p className="text-sm text-ink-soft mt-1">With {complaint.associated.join(', ').toLowerCase()}</p>
          )}
          <p className="text-sm text-ink-faint mt-1">Routed to {symptom?.department} · {symptom?.room}</p>
        </section>

        <section className="rounded-2xl border border-line bg-surface p-5">
          <p className="text-xs font-semibold text-ink-faint uppercase tracking-wide mb-3">Documents</p>
          {documents.status === 'done' ? (
            <div className="flex flex-wrap gap-4 text-sm text-ink-soft">
              <span className="flex items-center gap-1.5">
                <Pill size={14} className="text-clinic-600" /> {documents.medications.length} medications extracted
              </span>
              <span className="flex items-center gap-1.5">
                <FlaskConical size={14} className="text-clinic-600" />{' '}
                {documents.labValues.filter((l) => l.flag !== 'normal').length} flagged lab values
              </span>
            </div>
          ) : (
            <p className="text-sm text-ink-faint">No documents scanned</p>
          )}
        </section>
      </div>

      <button
        onClick={handleConfirm}
        className="tap mt-8 w-full h-14 rounded-xl bg-clinic-500 text-white font-semibold flex items-center justify-center gap-2 hover:bg-clinic-600"
      >
        <CheckCircle2 size={18} />
        Confirm & generate token
      </button>
    </div>
  )
}
