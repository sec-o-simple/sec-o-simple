import { Button } from '@heroui/button'
import { PropsWithChildren } from 'react'
import { useNavigate } from 'react-router'
import ProgressBar from './ProgressBar'

export type WizardStepProps = PropsWithChildren<{
  title?: string
  progress?: number
  onBack?: string | (() => void)
  onContinue?: string | (() => void)
}>

export default function WizardStep({
  title,
  progress,
  onBack,
  onContinue,
  children,
}: WizardStepProps) {
  const navigate = useNavigate()
  return (
    <div className="flex max-w-5xl flex-col gap-4 p-8">
      <ProgressBar
        sections={['Documents', 'Products', 'Vulnerabilities']}
        progress={progress ?? 1}
      />
      <div className="flex flex-col gap-4 rounded-lg bg-content1 p-8 shadow">
        {title && <div className="mb-2 text-xl font-semibold">{title}</div>}
        {children}
      </div>
      <div className="flex justify-between">
        <div>
          {onBack !== undefined && (
            <Button
              onPress={() =>
                typeof onBack === 'string' ? navigate(onBack) : onBack?.()
              }
              variant="bordered"
              className="border-1 bg-content1"
            >
              Back
            </Button>
          )}
        </div>
        {onContinue !== undefined && (
          <Button
            onPress={() =>
              typeof onContinue === 'string'
                ? navigate(onContinue)
                : onContinue?.()
            }
            color="primary"
          >
            Next
          </Button>
        )}
      </div>
    </div>
  )
}
