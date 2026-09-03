import { useState } from 'react'
import { QrCode, Smartphone, ArrowRight, CheckCircle2 } from 'lucide-react'
import { useKioskStore } from '../../store/useKioskStore'
import { LANGUAGES, randomMockPatient } from '../../data/mockData'
import VitalsPulse from '../shared/VitalsPulse'
import QRScanModal from '../shared/QRScanModal'

export default function WelcomeStep() {
  const { state, setLanguage, setPatient, nextStep } = useKioskStore()
  const [mode, setMode] = useState(null) // null | 'qr' | 'mobile'
  const [mobile, setMobile] = useState('')
  const [verifying, setVerifying] = useState(false)

  const handleQrResolved = (profile) => {
    setPatient(profile)
    setMode(null)
  }

  const handleMobileVerify = () => {
    if (mobile.replace(/\D/g, '').length < 10) return
    setVerifying(true)
    setTimeout(() => {
      const profile = randomMockPatient()
      setPatient({ ...profile, mobile: `+91 ${mobile}` })
      setVerifying(false)
    }, 900)
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="mb-10">
        <VitalsPulse className="w-full h-16" />
      </div>

      <h1 className="text-2xl sm:text-3xl font-semibold text-ink mb-1">Welcome to City General OPD</h1>
      <p className="text-ink-soft mb-8">Select your language, then verify your identity to begin intake.</p>

      <div className="mb-8">
        <p className="text-sm font-medium text-ink-soft mb-3">Language</p>
        <div className="flex flex-wrap gap-2">
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              onClick={() => setLanguage(l.code)}
              className={`tap h-12 px-5 rounded-full text-sm font-medium border ${
                state.language === l.code
                  ? 'bg-ink text-white border-ink'
                  : 'bg-surface text-ink-soft border-line hover:border-line-strong'
              }`}
            >
              {l.native}
            </button>
          ))}
        </div>
      </div>

      {!state.patient ? (
        <div className="grid sm:grid-cols-2 gap-4">
          <button
            onClick={() => setMode('qr')}
            className="tap group text-left rounded-2xl border border-line bg-surface p-6 hover:border-clinic-500 hover:shadow-panel"
          >
            <div className="w-12 h-12 rounded-xl bg-clinic-50 grid place-items-center mb-4">
              <QrCode size={24} className="text-clinic-600" />
            </div>
            <p className="font-semibold text-ink mb-1">Scan ABHA QR Code</p>
            <p className="text-sm text-ink-soft">Use your ABHA health card or app to verify instantly</p>
          </button>

          <button
            onClick={() => setMode('mobile')}
            className="tap group text-left rounded-2xl border border-line bg-surface p-6 hover:border-clinic-500 hover:shadow-panel"
          >
            <div className="w-12 h-12 rounded-xl bg-clinic-50 grid place-items-center mb-4">
              <Smartphone size={24} className="text-clinic-600" />
            </div>
            <p className="font-semibold text-ink mb-1">Enter Mobile Number</p>
            <p className="text-sm text-ink-soft">We'll match your registered patient record</p>
          </button>
        </div>
      ) : (
        <div className="rounded-2xl border border-clinic-100 bg-clinic-50 p-6 flex items-center gap-4 animate-rise">
          <CheckCircle2 size={28} className="text-clinic-600 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-ink">{state.patient.name} verified</p>
            <p className="text-sm text-ink-soft">
              {state.patient.age} yrs · {state.patient.gender === 'M' ? 'Male' : 'Female'} · ABHA{' '}
              {state.patient.abhaId}
            </p>
          </div>
          <button
            onClick={nextStep}
            className="tap h-12 px-5 rounded-xl bg-clinic-500 text-white text-sm font-semibold flex items-center gap-2 hover:bg-clinic-600"
          >
            Continue
            <ArrowRight size={16} />
          </button>
        </div>
      )}

      {mode === 'mobile' && !state.patient && (
        <div className="mt-4 rounded-2xl border border-line bg-surface p-6 animate-rise">
          <label className="text-sm font-medium text-ink-soft block mb-2" htmlFor="mobile-input">
            Registered mobile number
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 flex items-center gap-2 h-14 rounded-xl border border-line-strong px-4">
              <span className="text-ink-faint text-sm">+91</span>
              <input
                id="mobile-input"
                inputMode="numeric"
                maxLength={10}
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                placeholder="98XXXXXXXX"
                className="flex-1 bg-transparent outline-none text-ink text-base tracking-wide"
              />
            </div>
            <button
              onClick={handleMobileVerify}
              disabled={mobile.length < 10 || verifying}
              className="tap h-14 px-6 rounded-xl bg-clinic-500 text-white font-semibold disabled:bg-line-strong disabled:text-ink-faint"
            >
              {verifying ? 'Verifying…' : 'Verify & Continue'}
            </button>
          </div>
        </div>
      )}

      {mode === 'qr' && <QRScanModal onResolved={handleQrResolved} onClose={() => setMode(null)} />}
    </div>
  )
}
