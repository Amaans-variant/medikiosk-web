import { KioskStoreProvider, useKioskStore } from './store/useKioskStore'
import TopBar from './components/TopBar'
import KioskFlow from './components/kiosk/KioskFlow'
import PhysicianConsole from './components/physician/PhysicianConsole'

function Shell() {
  const { state } = useKioskStore()

  return (
    <div className="h-full flex flex-col bg-canvas">
      <TopBar />
      {state.activeView === 'kiosk' ? <KioskFlow /> : <PhysicianConsole />}
    </div>
  )
}

export default function App() {
  return (
    <KioskStoreProvider>
      <Shell />
    </KioskStoreProvider>
  )
}
