import { useState } from 'react'
import CategorySelection from './CategorySelection'
import CreateDocument from './CreateDocument'
import EditDocument from './EditDocument'
import { AnimatePresence } from 'framer-motion'
import { LanguageSwitcher } from '@/components/forms/LanguageSwitcher'

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

      <div className="absolute bottom-4 left-0 right-0 flex justify-center">
        <LanguageSwitcher />
      </div>
    </div>
  )
}
