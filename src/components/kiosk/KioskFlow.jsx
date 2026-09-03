import { useKioskStore, KIOSK_STEPS } from '../../store/useKioskStore'
import Stepper from '../shared/Stepper'
import WelcomeStep from './WelcomeStep'
import ComplaintStep from './ComplaintStep'
import DocumentStep from './DocumentStep'
import SummaryStep from './SummaryStep'

const STEP_COMPONENTS = {
  welcome: WelcomeStep,
  complaint: ComplaintStep,
  documents: DocumentStep,
  summary: SummaryStep,
}

export default function KioskFlow() {
  const { state, prevStep } = useKioskStore()
  const currentKey = KIOSK_STEPS[state.kioskStepIndex]
  const StepComponent = STEP_COMPONENTS[currentKey]

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-y-auto no-scrollbar">
      <Stepper currentIndex={state.kioskStepIndex} onBack={prevStep} canGoBack={state.kioskStepIndex > 0} />
      <StepComponent />
    </div>
  )
}
