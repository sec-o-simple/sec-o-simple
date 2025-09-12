import AddItemButton from '@/components/forms/AddItemButton'
import VSplit from '@/components/forms/VSplit'
import { useListState } from '@/utils/useListState'
import { useFieldValidation } from '@/utils/validation/useFieldValidation'
import { Alert } from '@heroui/react'
import { useEffect } from 'react'
import { TVulnerability } from './types/tVulnerability'
import {
  TVulnerabilityFlag,
  useVulnerabilityFlagGenerator,
} from './types/tVulnerabilityFlag'
import VulnerabilityFlag from './components/VulnerabilityFlag'
import { useTranslation } from 'react-i18next'

export default function Flags({
  vulnerability,
  vulnerabilityIndex,
  onChange,
}: {
  vulnerability: TVulnerability
  vulnerabilityIndex: number
  onChange: (vulnerability: TVulnerability) => void
}) {
  const { generateVulnerabilityFlag } = useVulnerabilityFlagGenerator()
  const flagsListState = useListState<TVulnerabilityFlag>({
    initialData: vulnerability.flags,
    generator: generateVulnerabilityFlag(),
  })
  const { t } = useTranslation()

  useEffect(
    () => onChange({ ...vulnerability, flags: flagsListState.data }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [flagsListState.data],
  )

  const validation = useFieldValidation(
    `/vulnerabilities/${vulnerabilityIndex}/flags`,
  )

  return (
    <VSplit className="gap-2">
      {validation.hasErrors && (
        <Alert color="danger">
          {validation.errorMessages.map((m) => (
            <p key={m.path}>{m.message}</p>
          ))}
        </Alert>
      )}

      {flagsListState.data.map((vulnerabilityFlag, index) => (
        <VulnerabilityFlag
          key={vulnerabilityFlag.id}
          vulnerabilityFlag={vulnerabilityFlag}
          csafPath={`/vulnerabilities/${vulnerabilityIndex}/flags/${index}`}
          onChange={flagsListState.updateDataEntry}
          onDelete={flagsListState.removeDataEntry}
        />
      ))}
      <AddItemButton
        label={t('common.add', {
          label: t('vulnerabilities.flag.title'),
        })}
        onPress={() => {
          flagsListState.setData((prev) => [
            ...prev,
            generateVulnerabilityFlag(),
          ])
        }}
        className="w-full"
      />
    </VSplit>
  )
}
