import { useEffect, useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import QueueSidebar from './QueueSidebar'
import ConsultPanel from './ConsultPanel'

export default function PhysicianConsole() {
  const [toast, setToast] = useState(null)

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 3200)
    return () => clearTimeout(t)
  }, [toast])

  return (
    <div className="flex-1 flex min-h-0 relative">
      <QueueSidebar />
      <ConsultPanel onPushed={(name) => setToast(`${name}'s record pushed. Session cleared for next visit.`)} />

      {toast && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2.5 bg-ink text-white text-sm font-medium px-4 py-3 rounded-xl shadow-raised animate-rise">
          <CheckCircle2 size={16} className="text-clinic-400" />
          {toast}
        </div>
      )}
    </div>
  )
}
