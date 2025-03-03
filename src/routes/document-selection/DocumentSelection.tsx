import { useState } from 'react'
import CategorySelection from './CategorySelection'
import CreateDocument from './CreateDocument'
import EditDocument from './EditDocument'
import { AnimatePresence } from 'framer-motion'

export type DocumentSelectionState =
  | 'selectNewOrOpen'
  | 'createDocument'
  | 'editDocument'

export default function DocumentSelection() {
  const [state, setState] = useState<DocumentSelectionState>('selectNewOrOpen')

  return (
    <div className="flex grow flex-col items-center gap-8 bg-gradient-to-b from-sky-50 to-white">
      <CategorySelection
        state={state}
        onSelect={(newState) => setState(newState)}
      />
      <div>
        <AnimatePresence>
          {state === 'createDocument' && <CreateDocument />}
          {state === 'editDocument' && <EditDocument />}
        </AnimatePresence>
      </div>
    </div>
  )
}
