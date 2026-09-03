import { useEffect, useState } from 'react'
import { ScanLine, CheckCircle2, X } from 'lucide-react'
import { randomMockPatient } from '../../data/mockData'

export default function QRScanModal({ onResolved, onClose }) {
  const [resolved, setResolved] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setResolved(true)
      const profile = randomMockPatient()
      setTimeout(() => onResolved(profile), 600)
    }, 1500)
    return () => clearTimeout(timer)
  }, [onResolved])

  return (
    <div className="fixed inset-0 z-50 bg-ink/60 backdrop-blur-sm flex items-center justify-center p-6">
      <div className="bg-surface rounded-2xl shadow-raised w-full max-w-md overflow-hidden animate-rise">
        <div className="flex items-center justify-between px-5 py-4 border-b border-line">
          <p className="font-medium text-ink">Scan ABHA QR Code</p>
          <button
            onClick={onClose}
            aria-label="Close scanner"
            className="tap w-9 h-9 grid place-items-center rounded-full hover:bg-surface-sunk"
          >
            <X size={18} className="text-ink-soft" />
          </button>
        </div>

        <div className="p-6">
          <div className="relative aspect-square w-full max-w-[280px] mx-auto rounded-xl bg-ink overflow-hidden">
            {/* corner brackets */}
            {['top-3 left-3 border-t-2 border-l-2', 'top-3 right-3 border-t-2 border-r-2', 'bottom-3 left-3 border-b-2 border-l-2', 'bottom-3 right-3 border-b-2 border-r-2'].map(
              (pos, i) => (
                <span key={i} className={`absolute w-8 h-8 border-clinic-400 rounded-sm ${pos}`} />
              )
            )}

            {!resolved ? (
              <>
                <div className="absolute left-0 right-0 h-0.5 bg-clinic-400 shadow-[0_0_12px_2px_rgba(52,211,153,0.7)] animate-scanline" />
                <div className="absolute inset-0 grid place-items-center">
                  <ScanLine size={40} className="text-ink-faint/40" />
                </div>
              </>
            ) : (
              <div className="absolute inset-0 grid place-items-center bg-clinic-500/95">
                <CheckCircle2 size={48} className="text-white" />
              </div>
            )}
          </div>

          <p className="text-center text-sm text-ink-soft mt-5">
            {resolved ? 'Verified via ABDM. Loading profile…' : 'Hold your ABHA QR steady in the frame'}
          </p>
        </div>
      </div>
    </div>
  )
}
