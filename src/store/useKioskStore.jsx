import React, { createContext, useContext, useMemo, useReducer } from 'react'
import { INITIAL_QUEUE } from '../data/mockData'

const KioskStoreContext = createContext(null)

export const KIOSK_STEPS = ['welcome', 'complaint', 'documents', 'summary']

const initialState = {
  activeView: 'kiosk', // 'kiosk' | 'physician'
  language: 'en',
  networkOnline: true,

  kioskStepIndex: 0,
  patient: null, // { name, age, gender, abhaId, mobile }
  complaint: {
    symptomId: null,
    duration: null,
    severity: 5,
    associated: [],
  },
  documents: {
    status: 'idle', // idle | scanning | done
    medications: [],
    labValues: [],
    sourceDoc: null,
  },
  lastToken: null, // { token, room, waitMinutes }

  queue: INITIAL_QUEUE,
  selectedPatientId: INITIAL_QUEUE[0]?.id ?? null,
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET_VIEW':
      return { ...state, activeView: action.payload }

    case 'SET_LANGUAGE':
      return { ...state, language: action.payload }

    case 'GO_TO_STEP':
      return { ...state, kioskStepIndex: action.payload }

    case 'NEXT_STEP':
      return { ...state, kioskStepIndex: Math.min(state.kioskStepIndex + 1, KIOSK_STEPS.length - 1) }

    case 'PREV_STEP':
      return { ...state, kioskStepIndex: Math.max(state.kioskStepIndex - 1, 0) }

    case 'SET_PATIENT':
      return { ...state, patient: action.payload }

    case 'SET_COMPLAINT_FIELD':
      return { ...state, complaint: { ...state.complaint, ...action.payload } }

    case 'TOGGLE_ASSOCIATED_SYMPTOM': {
      const has = state.complaint.associated.includes(action.payload)
      const associated = has
        ? state.complaint.associated.filter((s) => s !== action.payload)
        : [...state.complaint.associated, action.payload]
      return { ...state, complaint: { ...state.complaint, associated } }
    }

    case 'SET_DOCUMENTS_STATUS':
      return { ...state, documents: { ...state.documents, status: action.payload } }

    case 'SET_DOCUMENTS_RESULT':
      return {
        ...state,
        documents: {
          status: 'done',
          medications: action.payload.medications,
          labValues: action.payload.labValues,
          sourceDoc: action.payload.sourceDoc,
        },
      }

    case 'DISPATCH_TOKEN': {
      const newPatient = action.payload
      return {
        ...state,
        lastToken: { token: newPatient.token, room: newPatient.room, waitMinutes: newPatient.waitMinutes },
        queue: [...state.queue, newPatient],
      }
    }

    case 'RESET_KIOSK':
      return {
        ...state,
        kioskStepIndex: 0,
        patient: null,
        complaint: initialState.complaint,
        documents: initialState.documents,
        lastToken: null,
      }

    case 'SELECT_QUEUE_PATIENT':
      return { ...state, selectedPatientId: action.payload }

    case 'AMEND_RECORD': {
      const { id, field, value } = action.payload
      return {
        ...state,
        queue: state.queue.map((p) => (p.id === id ? { ...p, [field]: value } : p)),
      }
    }

    case 'PUSH_TO_EMR':
      return {
        ...state,
        queue: state.queue.map((p) => (p.id === action.payload ? { ...p, status: 'pushed' } : p)),
      }

    case 'REMOVE_FROM_QUEUE':
      return {
        ...state,
        queue: state.queue.filter((p) => p.id !== action.payload),
        selectedPatientId:
          state.selectedPatientId === action.payload
            ? state.queue.find((p) => p.id !== action.payload)?.id ?? null
            : state.selectedPatientId,
      }

    default:
      return state
  }
}

export function KioskStoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  const actions = useMemo(
    () => ({
      setView: (view) => dispatch({ type: 'SET_VIEW', payload: view }),
      setLanguage: (lang) => dispatch({ type: 'SET_LANGUAGE', payload: lang }),
      goToStep: (idx) => dispatch({ type: 'GO_TO_STEP', payload: idx }),
      nextStep: () => dispatch({ type: 'NEXT_STEP' }),
      prevStep: () => dispatch({ type: 'PREV_STEP' }),
      setPatient: (patient) => dispatch({ type: 'SET_PATIENT', payload: patient }),
      setComplaintField: (fields) => dispatch({ type: 'SET_COMPLAINT_FIELD', payload: fields }),
      toggleAssociatedSymptom: (symptom) => dispatch({ type: 'TOGGLE_ASSOCIATED_SYMPTOM', payload: symptom }),
      setDocumentsStatus: (status) => dispatch({ type: 'SET_DOCUMENTS_STATUS', payload: status }),
      setDocumentsResult: (result) => dispatch({ type: 'SET_DOCUMENTS_RESULT', payload: result }),
      dispatchToken: (patient) => dispatch({ type: 'DISPATCH_TOKEN', payload: patient }),
      resetKiosk: () => dispatch({ type: 'RESET_KIOSK' }),
      selectQueuePatient: (id) => dispatch({ type: 'SELECT_QUEUE_PATIENT', payload: id }),
      amendRecord: (id, field, value) => dispatch({ type: 'AMEND_RECORD', payload: { id, field, value } }),
      pushToEmr: (id) => dispatch({ type: 'PUSH_TO_EMR', payload: id }),
      removeFromQueue: (id) => dispatch({ type: 'REMOVE_FROM_QUEUE', payload: id }),
    }),
    []
  )

  const value = useMemo(() => ({ state, ...actions }), [state, actions])

  return <KioskStoreContext.Provider value={value}>{children}</KioskStoreContext.Provider>
}

export function useKioskStore() {
  const ctx = useContext(KioskStoreContext)
  if (!ctx) throw new Error('useKioskStore must be used within a KioskStoreProvider')
  return ctx
}
