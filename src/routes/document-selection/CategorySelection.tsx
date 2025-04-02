import { faPenToSquare, faPlus } from '@fortawesome/free-solid-svg-icons'
import {
  FontAwesomeIcon,
  FontAwesomeIconProps,
} from '@fortawesome/react-fontawesome'
import { AnimatePresence, motion } from 'motion/react'
import {
  MButtonIconFinal,
  MButtonIconInitial,
  MButtonInitial,
  MButtonLeftFinal,
  MButtonRightFinal,
} from './categorySelection.motions'
import { DocumentSelectionState } from './DocumentSelection'

export default function CategorySelection({
  state,
  onSelect,
}: {
  state: DocumentSelectionState
  onSelect?: (newState: DocumentSelectionState) => void
}) {
  return (
    <div className="flex flex-col items-center">
      <AnimatePresence>
        {state === 'selectNewOrOpen' && (
          <motion.div
            initial={{ marginTop: '2.5rem', marginBottom: '2.5rem' }}
            exit={{ height: 0, marginTop: 0, marginBottom: 0 }}
            className="overflow-hidden text-center"
          >
            <div className="mb-2 text-3xl font-bold">Select Document Type</div>
            <div>
              Choose whether you want to create a new document or edit an
              existing one
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="flex">
        <CategoryButton
          icon={faPlus}
          label="Create new document"
          state={state}
          onClick={() => onSelect?.('createDocument')}
          isActive={state === 'createDocument'}
        />
        <CategoryButton
          icon={faPenToSquare}
          label="Edit existing document"
          state={state}
          isRightButton
          onClick={() => onSelect?.('editDocument')}
          isActive={state === 'editDocument'}
        />
      </div>
    </div>
  )
}

function CategoryButton({
  icon,
  label,
  state,
  isActive,
  isRightButton,
  onClick,
}: {
  icon: FontAwesomeIconProps['icon']
  label: string
  state: DocumentSelectionState
  isActive: boolean
  isRightButton?: boolean
  onClick?: () => void
}) {
  const divMotion =
    state === 'selectNewOrOpen'
      ? MButtonInitial
      : isRightButton
        ? MButtonRightFinal
        : MButtonLeftFinal

  return (
    <motion.div
      initial={MButtonInitial}
      animate={divMotion}
      className={`flex max-w-56 cursor-pointer flex-col items-center gap-4 border-2 text-center transition-colors ${
        isActive ? 'bg-primary' : 'bg-content1'
      } ${
        state === 'selectNewOrOpen'
          ? 'hover:bg-primary hover:text-primary-foreground [&:hover_svg]:text-primary-foreground'
          : ''
      }`}
      onClick={onClick}
    >
      <motion.div
        initial={MButtonIconInitial}
        animate={
          state === 'selectNewOrOpen' ? MButtonIconInitial : MButtonIconFinal
        }
      >
        <FontAwesomeIcon
          icon={icon}
          className={`transition-colors ${
            isActive ? 'text-primary-foreground' : 'text-primary'
          }`}
        />
      </motion.div>
      {label}
    </motion.div>
  )
}
