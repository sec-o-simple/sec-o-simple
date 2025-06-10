import HSplit from '@/components/forms/HSplit'
import { Input } from '@/components/forms/Input'
import VSplit from '@/components/forms/VSplit'
import { TCwe, TVulnerability } from './types/tVulnerability'
import { checkReadOnly, getPlaceholder } from '@/utils/template'
import { Autocomplete } from '@/components/forms/Autocomplete'
import { useMemo } from 'react'
import { weaknesses } from '@secvisogram/csaf-validator-lib/cwe.js'
import { AutocompleteItem } from '@heroui/react'

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
  const cwes = useMemo<TCwe[]>(() => weaknesses, [])

  return (
    <VSplit>
      <HSplit>
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
        label="Title"
        csafPath={`/vulnerabilities/${vulnerabilityIndex}/title`}
        isTouched={isTouched}
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
