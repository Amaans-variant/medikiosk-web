import { useEffect, useRef, useState } from 'react'
import { FileScan, ArrowRight, Pill, FlaskConical, AlertTriangle } from 'lucide-react'
import { useKioskStore } from '../../store/useKioskStore'
import { MOCK_OCR_RESULT } from '../../data/mockData'

const SCAN_MESSAGES = [
  'Reading document layout…',
  'Running OCR on handwritten prescription…',
  'Extracting medications with NER…',
  'Cross-checking lab reference ranges…',
]

export default function DocumentStep() {
  const { state, setDocumentsStatus, setDocumentsResult, nextStep } = useKioskStore()
  const { status, medications, labValues, sourceDoc } = state.documents
  const [progress, setProgress] = useState(0)
  const [messageIdx, setMessageIdx] = useState(0)
  const progressTimer = useRef(null)
  const messageTimer = useRef(null)

  const startScan = () => {
    setDocumentsStatus('scanning')
    setProgress(0)
    setMessageIdx(0)

    const start = Date.now()
    const duration = 2000

    progressTimer.current = setInterval(() => {
      const pct = Math.min(100, Math.round(((Date.now() - start) / duration) * 100))
      setProgress(pct)
      if (pct >= 100) clearInterval(progressTimer.current)
    }, 50)

    messageTimer.current = setInterval(() => {
      setMessageIdx((i) => Math.min(i + 1, SCAN_MESSAGES.length - 1))
    }, duration / SCAN_MESSAGES.length)

    setTimeout(() => {
      clearInterval(progressTimer.current)
      clearInterval(messageTimer.current)
      setDocumentsResult(MOCK_OCR_RESULT)
    }, duration)
  }

  useEffect(() => {
    return () => {
      clearInterval(progressTimer.current)
      clearInterval(messageTimer.current)
    }
  }, [])

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold text-ink mb-1">Scan prior prescriptions & lab reports</h1>
      <p className="text-ink-soft mb-8">This helps your physician review your history before you're seen.</p>

      {status === 'idle' && (
        <button
          onClick={startScan}
          className="tap w-full rounded-2xl border-2 border-dashed border-line-strong bg-surface p-12 flex flex-col items-center gap-4 hover:border-clinic-500 hover:bg-clinic-50/40"
        >
          <div className="w-16 h-16 rounded-2xl bg-clinic-50 grid place-items-center">
            <FileScan size={30} className="text-clinic-600" />
          </div>
          <div className="text-center">
            <p className="font-semibold text-ink">Tap to scan documents</p>
            <p className="text-sm text-ink-soft mt-1">Place papers under the kiosk camera</p>
          </div>
        </button>
      )}

      {status === 'scanning' && (
        <div className="rounded-2xl border border-line bg-surface p-10 flex flex-col items-center gap-6 animate-rise">
          <div className="relative w-full max-w-xs aspect-[3/4] rounded-xl bg-surface-sunk overflow-hidden">
            <div className="absolute inset-x-4 top-6 space-y-2">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-2 rounded-full bg-line-strong/60" style={{ width: `${70 + (i % 3) * 10}%` }} />
              ))}
            </div>
            <div
              className="absolute left-0 right-0 h-1 bg-clinic-400 shadow-[0_0_10px_2px_rgba(52,211,153,0.6)]"
              style={{ top: `${progress}%`, transition: 'top 50ms linear' }}
            />
          </div>
          <div className="w-full max-w-sm">
            <div className="h-2 rounded-full bg-surface-sunk overflow-hidden mb-3">
              <div
                className="h-full bg-clinic-500 rounded-full"
                style={{ width: `${progress}%`, transition: 'width 50ms linear' }}
              />
            </div>
            <p className="text-sm text-ink-soft text-center">{SCAN_MESSAGES[messageIdx]}</p>
          </div>
        </div>
      )}

      {status === 'done' && (
        <div className="space-y-5 animate-rise">
          <p className="text-xs font-medium text-ink-faint">Source: {sourceDoc}</p>

          <div className="rounded-2xl border border-line bg-surface overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-3 border-b border-line bg-surface-sunk/60">
              <Pill size={16} className="text-clinic-600" />
              <p className="text-sm font-semibold text-ink">Detected medications</p>
            </div>
            <ul className="divide-y divide-line">
              {medications.map((m, i) => (
                <li key={i} className="px-5 py-3 flex items-center justify-between">
                  <span className="text-sm text-ink">
                    {m.name} {m.dose}
                  </span>
                  <span className="text-xs text-ink-soft">
                    {m.frequency} · {m.note}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-line bg-surface overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-3 border-b border-line bg-surface-sunk/60">
              <FlaskConical size={16} className="text-clinic-600" />
              <p className="text-sm font-semibold text-ink">Lab values</p>
            </div>
            <ul className="divide-y divide-line">
              {labValues.map((l, i) => (
                <li key={i} className="px-5 py-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm text-ink">{l.test}</p>
                    <p className="text-xs text-ink-faint">Reference {l.range}</p>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${
                      l.flag === 'high'
                        ? 'bg-alert-50 text-alert-600'
                        : l.flag === 'low'
                        ? 'bg-caution-50 text-caution-500'
                        : 'bg-clinic-50 text-clinic-700'
                    }`}
                  >
                    {l.flag !== 'normal' && <AlertTriangle size={12} />}
                    {l.value}
                    {l.flag !== 'normal' ? ` [${l.flag === 'high' ? 'High' : 'Low'}]` : ''}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mt-8">
        <button onClick={nextStep} className="text-sm text-ink-faint hover:text-ink-soft font-medium">
          Skip — no documents to scan
        </button>
        <button
          onClick={nextStep}
          disabled={status !== 'done'}
          className="tap h-14 px-6 rounded-xl bg-clinic-500 text-white font-semibold flex items-center gap-2 disabled:bg-line-strong disabled:text-ink-faint"
        >
          Continue
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  )
}
