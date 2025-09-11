import { Button } from '@heroui/button'
import { PropsWithChildren } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import ProgressBar from './ProgressBar'

export type WizardStepProps = PropsWithChildren<{
  title?: string
  subtitle?: string
  progress?: number
  onBack?: string | (() => void)
  onContinue?: string | (() => void)
  noContentWrapper?: boolean
}>

export default function WizardStep({
  title,
  subtitle,
  progress,
  onBack,
  onContinue,
  children,
  noContentWrapper,
}: WizardStepProps) {
  const navigate = useNavigate()
  const { t } = useTranslation()

  return (
    <div className="flex max-w-5xl flex-col gap-4 p-8">
      <ProgressBar
        sections={[
          t('nav.document'),
          t('nav.productManagement.title'),
          t('nav.vulnerabilities'),
          t('nav.tracking'),
        ]}
        progress={progress ?? 1}
      />
      {(noContentWrapper && <>{children}</>) || (
        <div className="border-default-200 bg-content1 border-default-200 flex flex-col gap-2 rounded-lg border p-8">
          <div className="gap-2">
            {title && <div className="text-xl font-semibold">{title}</div>}
            {subtitle && (
              <div className="text-default-400 mb-4 text-lg">{subtitle}</div>
            )}
          </div>
          {children}
        </div>
      )}
      <div className="flex justify-between">
        <div>
          {onBack !== undefined && (
            <Button
              onPress={() =>
                typeof onBack === 'string' ? navigate(onBack) : onBack?.()
              }
              variant="bordered"
              className="bg-content1 border-1"
            >
              {t('common.back')}
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
            {t('common.next')}
          </Button>
        )}
      </div>
    </div>
  )
}
