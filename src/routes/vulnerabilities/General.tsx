import HSplit from '@/components/forms/HSplit'
import VSplit from '@/components/forms/VSplit'
import { Input } from '@heroui/input'
import { TVulnerability } from './types/tVulnerability'
import { checkReadOnly } from '@/utils/template'

export default function General({
  vulnerability,
  onChange,
}: {
  vulnerability: TVulnerability
  onChange: (vulnerability: TVulnerability) => void
}) {
  return (
    <VSplit>
      <HSplit>
        <Input
          label="CVE ID"
          value={vulnerability.cve}
          onValueChange={(newValue) =>
            onChange({ ...vulnerability, cve: newValue })
          }
          autoFocus
          isDisabled={checkReadOnly(vulnerability, 'cve')}
        />
        <Input
          label="CWE"
          value={vulnerability.cwe}
          onValueChange={(newValue) =>
            onChange({ ...vulnerability, cwe: newValue })
          }
          isDisabled={checkReadOnly(vulnerability, 'cwe')}
        />
      </HSplit>
      <Input
        label="Title"
        value={vulnerability.title}
        onValueChange={(newValue) =>
          onChange({ ...vulnerability, title: newValue })
        }
        isDisabled={checkReadOnly(vulnerability, 'title')}
      />
    </VSplit>
  )
}
