import { Autocomplete } from '@/components/forms/Autocomplete'
import HSplit from '@/components/forms/HSplit'
import { Input } from '@/components/forms/Input'
import VSplit from '@/components/forms/VSplit'
import { checkReadOnly, getPlaceholder } from '@/utils/template'
import { useConfigStore } from '@/utils/useConfigStore'
import { AutocompleteItem, Button, Tooltip } from '@heroui/react'
import { weaknesses } from '@secvisogram/csaf-validator-lib/cwe.js'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { TCwe, TVulnerability } from './types/tVulnerability'

export default function General({
  vulnerability,
  vulnerabilityIndex,
  onChange,
  isTouched = false,
}: {
  vulnerability: TVulnerability
  vulnerabilityIndex: number
  onChange: (vulnerability: TVulnerability) => void
  isTouched?: boolean
}) {
  const { t } = useTranslation()
  const cwes = useMemo<TCwe[]>(() => weaknesses, [])
  const config = useConfigStore((state) => state.config)

  let apiUrl = ''
  if (config?.configuration && config?.configuration?.cveApiUrl) {
    apiUrl = `${config.configuration?.cveApiUrl}/api/v1`
  }

  const fetchCveDescription = () => {
    fetch(`${apiUrl}${vulnerability.cve}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.summary) {
          onChange({ ...vulnerability, title: data.summary })
        }
      })
      .catch((error) => {
        console.error('Error fetching CVE description:', error)
      })
  }

  return (
    <VSplit>
      <HSplit>
        <HSplit className="w-full items-end gap-2">
          <Input
            label="CVE ID"
            csafPath={`/vulnerabilities/${vulnerabilityIndex}/cve`}
            isTouched={isTouched}
            value={vulnerability.cve}
            onValueChange={(newValue) =>
              onChange({ ...vulnerability, cve: newValue })
            }
            autoFocus
            isDisabled={checkReadOnly(vulnerability, 'cve')}
            placeholder={getPlaceholder(vulnerability, 'cve')}
          />

          <Tooltip
            content={t('vulnerabilities.general.fetchCveDescription')}
            showArrow
          >
            <Button color="primary" onPress={fetchCveDescription}>
              {t('vulnerabilities.general.fetchCve')}
            </Button>
          </Tooltip>
        </HSplit>
        <Autocomplete
          label="CWE"
          csafPath={`/vulnerabilities/${vulnerabilityIndex}/cwe/name`}
          isTouched={isTouched}
          defaultSelectedKey={vulnerability.cwe?.id}
          onSelectionChange={(selected) => {
            onChange({
              ...vulnerability,
              cwe: cwes.find((x) => x.id === (selected as string)),
            })
          }}
          isDisabled={checkReadOnly(vulnerability, 'cwe')}
          placeholder={getPlaceholder(vulnerability, 'cwe')}
          maxListboxHeight={400}
          itemHeight={48}
        >
          {cwes.map((cwe) => (
            <AutocompleteItem
              key={cwe.id}
              textValue={`${cwe.id} - ${cwe.name}`}
            >
              {cwe.id} - {cwe.name}
            </AutocompleteItem>
          ))}
        </Autocomplete>
      </HSplit>
      <Input
        label={t('vulnerabilities.general.title')}
        csafPath={`/vulnerabilities/${vulnerabilityIndex}/title`}
        isTouched={isTouched}
        isRequired
        value={vulnerability.title}
        onValueChange={(newValue) =>
          onChange({ ...vulnerability, title: newValue })
        }
        isDisabled={checkReadOnly(vulnerability, 'title')}
        placeholder={getPlaceholder(vulnerability, 'title')}
      />
    </VSplit>
  )
}
