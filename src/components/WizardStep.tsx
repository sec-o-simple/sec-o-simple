import { Button } from '@heroui/button'
import { PropsWithChildren } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import ProgressBar from './ProgressBar'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons'

export type WizardStepProps = PropsWithChildren<{
  title?: string
  subtitle?: string
  progress?: number
  onBack?: string | (() => void)
  backLabel?: string
  onContinue?: string | (() => void)
  continueLabel?: string
  noContentWrapper?: boolean
}>

export default function WizardStep({
  title,
  subtitle,
  progress,
  onBack,
  backLabel,
  onContinue,
  continueLabel,
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
        <div className="border-default-200 bg-content1 flex flex-col gap-2 rounded-lg border p-8">
          <div className="gap-2">
            {title && <div className="text-xl font-semibold">{title}</div>}
            {subtitle && (
              <div className="text-default-400 mb-4 text-lg">{subtitle}</div>
            )}
          </div>
          {children}
        </div>
      )}
      <div className="flex justify-between pt-6">
        <div>
          {onBack !== undefined && (
            <Button
              onPress={() =>
                typeof onBack === 'string' ? navigate(onBack) : onBack?.()
              }
              variant="bordered"
              className="bg-content1 border-1"
              startContent={<FontAwesomeIcon icon={faArrowLeft} />}
            >
              {t(backLabel ?? 'common.back')}
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
            endContent={<FontAwesomeIcon icon={faArrowRight} />}
          >
            {t(continueLabel ?? 'common.next')}
          </Button>
        )}
      </div>
    </div>
  )
}
