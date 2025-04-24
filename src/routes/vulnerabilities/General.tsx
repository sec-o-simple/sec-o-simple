import HSplit from '@/components/forms/HSplit'
import { Input } from '@/components/forms/Input'
import VSplit from '@/components/forms/VSplit'
import { TVulnerability } from './types/tVulnerability'
import { checkReadOnly } from '@/utils/template'

export default function General({
  vulnerability,
  vulnerabilityIndex,
  onChange,
}: {
  vulnerability: TVulnerability,
  vulnerabilityIndex: number
  onChange: (vulnerability: TVulnerability) => void
}) {
  return (
    <VSplit>
      <HSplit>
        <Input
          label="CVE ID"
          csafPath={`/vulnerabilities/${vulnerabilityIndex}/cve`}
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
        value={vulnerability.title}
        onValueChange={(newValue) =>
          onChange({ ...vulnerability, title: newValue })
        }
        isDisabled={checkReadOnly(vulnerability, 'title')}
      />
    </VSplit>
  )
}
