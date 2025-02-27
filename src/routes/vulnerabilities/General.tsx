import HSplit from '@/components/forms/HSplit'
import VSplit from '@/components/forms/VSplit'
import { Input } from '@heroui/input'
import { TVulnerability } from './Vulnerabilities'

export default function General({
  vulnerability,
  onChange,
}: {
  vulnerability: TVulnerability
  onChange: (vulnerability: TVulnerability) => void
}) {
  return (
    <VSplit>
      <Input
        label="Title"
        value={vulnerability.title}
        onValueChange={(newValue) =>
          onChange({ ...vulnerability, title: newValue })
        }
        autoFocus={true}
      />
      <HSplit>
        <Input
          label="CVE ID"
          value={vulnerability.cve}
          onValueChange={(newValue) =>
            onChange({ ...vulnerability, cve: newValue })
          }
        />
        <Input
          label="CWE"
          value={vulnerability.cwe}
          onValueChange={(newValue) =>
            onChange({ ...vulnerability, cwe: newValue })
          }
        />
      </HSplit>
    </VSplit>
  )
}
