import HSplit from '@/components/forms/HSplit'
import { Input } from '@/components/forms/Input'
import VSplit from '@/components/forms/VSplit'
import { TVulnerability } from './types/tVulnerability'
import { checkReadOnly } from '@/utils/template'

export default function General({
  vulnerability,
  vulnerabilityIndex,
  onChange,
  isTouched = false,
}: {
  vulnerability: TVulnerability,
  vulnerabilityIndex: number,
  onChange: (vulnerability: TVulnerability) => void
  isTouched?: boolean,
}) {
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
        />
        <Input
          label="CWE"
          csafPath={`/vulnerabilities/${vulnerabilityIndex}/cwe/name`}
          isTouched={isTouched}
          value={vulnerability.cwe}
          onValueChange={(newValue) =>
            onChange({ ...vulnerability, cwe: newValue })
          }
          isDisabled={checkReadOnly(vulnerability, 'cwe')}
        />
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
      />
    </VSplit>
  )
}
