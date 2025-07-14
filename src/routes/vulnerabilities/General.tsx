import { Autocomplete } from '@/components/forms/Autocomplete'
import HSplit from '@/components/forms/HSplit'
import { Input } from '@/components/forms/Input'
import VSplit from '@/components/forms/VSplit'
import { checkReadOnly, getPlaceholder } from '@/utils/template'
import { useConfigStore } from '@/utils/useConfigStore'
import useDocumentStore from '@/utils/useDocumentStore'
import { addToast, AutocompleteItem, Button, Tooltip } from '@heroui/react'
import { weaknesses } from '@secvisogram/csaf-validator-lib/cwe.js'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { uid } from 'uid'
import { TCwe, TVulnerability } from './types/tVulnerability'

interface CNADescription {
  lang: string
  value: string
}

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
  const docLanguage = useDocumentStore((state) =>
    state.documentInformation.language.toLowerCase(),
  )
  const [cveError, setCVEError] = useState(false)

  let apiUrl = 'https://cveawg.mitre.org/api/cve'
  if (config && config?.cveApiUrl) {
    apiUrl = config?.cveApiUrl
  }
  const [fetchingCve, setFetchingCve] = useState(false)

  const fetchCveDescription = async () => {
    try {
      setFetchingCve(true)
      const response = await fetch(`${apiUrl}/${vulnerability.cve}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      if (data.containers && data.containers.cna) {
        onChange({ ...vulnerability, title: data.containers.cna.title })

        if (
          !data.containers.cna.descriptions ||
          data.containers.cna.descriptions.length === 0
        ) {
          addToast({
            title: t('vulnerabilities.general.noCveNotesFound'),
            description: t(
              'vulnerabilities.general.noCveNotesFoundDescription',
            ),
            color: 'warning',
          })
          return
        }

        let descriptions = data.containers?.cna.descriptions?.filter(
          (desc: CNADescription) =>
            (desc.lang as string).toLowerCase() === docLanguage,
        )

        if (!descriptions || descriptions.length === 0) {
          descriptions = data.containers?.cna.descriptions?.filter(
            (desc: CNADescription) => desc.lang === 'en',
          )
        }

        descriptions?.map((desc: CNADescription, index: number) => {
          vulnerability.notes.push({
            id: uid(),
            title: `${t('vulnerabilities.general.description')} - ${
              vulnerability.cve
            } - ${index + 1}`,
            content: desc.value,
            category: 'description',
          })
        })

        addToast({
          title: t('vulnerabilities.general.cveNotesFetched'),
          description: t('vulnerabilities.general.cveNotesFetchedDescription', {
            count: descriptions.length,
          }),
          color: 'success',
        })
      }
    } catch (error) {
      setCVEError(true)
      console.error('Error fetching CVE description:', error)
      addToast({
        title: t('vulnerabilities.general.cveFetchError'),
        description: t('vulnerabilities.general.cveFetchErrorDescription'),
        color: 'danger',
      })
    } finally {
      setFetchingCve(false)
    }
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
            onValueChange={(newValue) => {
              onChange({ ...vulnerability, cve: newValue })
              setCVEError(false)
            }}
            autoFocus
            isDisabled={checkReadOnly(vulnerability, 'cve')}
            placeholder={getPlaceholder(vulnerability, 'cve')}
            isInvalid={cveError}
            onClear={() => {
              onChange({ ...vulnerability, cve: '' })
              setCVEError(false)
            }}
          />

          {!!apiUrl && (
            <Tooltip
              content={t('vulnerabilities.general.fetchCveDescription')}
              showArrow
              isDisabled={!vulnerability.cve || !apiUrl}
            >
              <Button
                color={!vulnerability.cve || !apiUrl ? 'default' : 'primary'}
                onPress={fetchCveDescription}
                disabled={!vulnerability.cve || !apiUrl}
                isLoading={fetchingCve}
              >
                {t('vulnerabilities.general.fetchCve')}
              </Button>
            </Tooltip>
          )}
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
