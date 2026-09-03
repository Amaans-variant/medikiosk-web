import { useState } from 'react'
import { Pencil, Send, AlertTriangle, FileCheck2, UserRound } from 'lucide-react'
import { useKioskStore } from '../../store/useKioskStore'

export default function ConsultPanel({ onPushed }) {
  const { state, amendRecord, pushToEmr } = useKioskStore()
  const patient = state.queue.find((p) => p.id === state.selectedPatientId)
  const [amending, setAmending] = useState(false)
  const [draftHpi, setDraftHpi] = useState('')

  if (!patient) {
    return (
      <div className="flex-1 grid place-items-center text-ink-faint text-sm">
        Select a patient from the queue to view their summary
      </div>
    )
  }

  const hpiText = `${patient.complaint.symptomLabel} for ${patient.complaint.duration?.toLowerCase()}, severity ${
    patient.complaint.severity
  }/10.${patient.complaint.associated.length ? ' Associated with ' + patient.complaint.associated.join(', ').toLowerCase() + '.' : ''}`

  const startAmend = () => {
    setDraftHpi(patient.hpiOverride ?? hpiText)
    setAmending(true)
  }

  const saveAmend = () => {
    amendRecord(patient.id, 'hpiOverride', draftHpi)
    setAmending(false)
  }

  const handlePush = () => {
    pushToEmr(patient.id)
    onPushed?.(patient.name)
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="px-6 py-5 border-b border-line flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-full bg-surface-sunk grid place-items-center shrink-0">
            <UserRound size={20} className="text-ink-soft" />
          </div>
          <div>
            <p className="font-semibold text-ink">{patient.name}</p>
            <p className="text-sm text-ink-faint">
              {patient.age} yrs · {patient.gender === 'M' ? 'Male' : 'Female'} · ABHA {patient.abhaId} · Token #
              {patient.token}
            </p>
          </div>
        </div>
        {patient.status === 'pushed' && (
          <span className="flex items-center gap-1.5 text-xs font-semibold text-clinic-700 bg-clinic-100 px-2.5 py-1.5 rounded-full shrink-0">
            <FileCheck2 size={13} />
            Pushed to EMR
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-5 no-scrollbar">
        <section className="rounded-2xl border border-line bg-surface p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-ink-faint uppercase tracking-wide">
              Chief complaint &amp; HPI
            </p>
            {!amending && (
              <button
                onClick={startAmend}
                className="tap flex items-center gap-1 text-xs font-medium text-clinic-700 hover:text-clinic-600"
              >
                <Pencil size={12} />
                Amend
              </button>
            )}
          </div>

          {amending ? (
            <div>
              <textarea
                value={draftHpi}
                onChange={(e) => setDraftHpi(e.target.value)}
                rows={4}
                className="w-full rounded-lg border border-line-strong p-3 text-sm text-ink outline-none focus-visible:outline-clinic-500 resize-none"
              />
              <div className="flex justify-end gap-2 mt-2">
                <button
                  onClick={() => setAmending(false)}
                  className="tap h-9 px-3 rounded-lg text-sm text-ink-soft hover:bg-surface-sunk"
                >
                  Cancel
                </button>
                <button
                  onClick={saveAmend}
                  className="tap h-9 px-3 rounded-lg text-sm font-medium bg-ink text-white hover:bg-ink/90"
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-ink leading-relaxed">{patient.hpiOverride ?? hpiText}</p>
          )}
        </section>

        <section className="rounded-2xl border border-line bg-surface p-5">
          <p className="text-xs font-semibold text-ink-faint uppercase tracking-wide mb-3">
            Extracted medications
          </p>
          {patient.documents.medications.length > 0 ? (
            <ul className="divide-y divide-line -mx-1">
              {patient.documents.medications.map((m, i) => (
                <li key={i} className="px-1 py-2.5 flex items-center justify-between">
                  <span className="text-sm text-ink">
                    {m.name} {m.dose}
                  </span>
                  <span className="text-xs text-ink-soft">
                    {m.frequency} · {m.note}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-ink-faint">No medications on file</p>
          )}
        </section>

        <section className="rounded-2xl border border-line bg-surface p-5">
          <p className="text-xs font-semibold text-ink-faint uppercase tracking-wide mb-3">Flagged lab values</p>
          {patient.documents.labValues.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {patient.documents.labValues.map((l, i) => (
                <span
                  key={i}
                  className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-full ${
                    l.flag === 'high'
                      ? 'bg-alert-50 text-alert-600'
                      : l.flag === 'low'
                      ? 'bg-caution-50 text-caution-500'
                      : 'bg-surface-sunk text-ink-soft'
                  }`}
                >
                  {l.flag !== 'normal' && <AlertTriangle size={12} />}
                  {l.test}: {l.value}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-ink-faint">No lab reports on file</p>
          )}
        </section>
      </div>

      <div className="px-6 py-4 border-t border-line flex items-center justify-end gap-3 bg-surface">
        <button
          onClick={handlePush}
          disabled={patient.status === 'pushed'}
          className="tap h-12 px-5 rounded-xl bg-clinic-500 text-white text-sm font-semibold flex items-center gap-2 disabled:bg-line-strong disabled:text-ink-faint"
        >
          <Send size={16} />
          Push to Hospital EMR / ABDM
        </button>
      </div>
    </div>
  )
}
