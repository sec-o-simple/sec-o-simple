import HSplit from '@/components/forms/HSplit'
import { Input } from '@/components/forms/Input'
import { checkReadOnly, getPlaceholder } from '@/utils/template'
import { useConfigStore } from '@/utils/useConfigStore'
import useDocumentStore from '@/utils/useDocumentStore'
import { addToast, Button, Tooltip } from '@heroui/react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { uid } from 'uid'
import { TVulnerability } from '../types/tVulnerability'

interface CNADescription {
  lang: string
  value: string
}

export default function FetchCVE({
  onChange,
  vulnerability,
  vulnerabilityIndex,
  isTouched = false,
}: {
  onChange: (vulnerability: TVulnerability) => void
  vulnerability: TVulnerability
  vulnerabilityIndex: number
  isTouched?: boolean
}) {
  const { t } = useTranslation()
  const [fetchingCve, setFetchingCve] = useState(false)
  const [cveError, setCVEError] = useState(false)

  const config = useConfigStore((state) => state.config)
  const docLanguage = useDocumentStore((state) =>
    state.documentInformation.lang.toLowerCase(),
  )

  let apiUrl = 'https://cveawg.mitre.org/api/cve'
  if (config && config?.cveApiUrl) {
    apiUrl = config?.cveApiUrl
  }

  const fetchCVEData = async () => {
    try {
      setFetchingCve(true)
      const response = await fetch(`${apiUrl}/${vulnerability.cve}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      if (data.containers && data.containers.cna) {
        const cna = data.containers.cna

        onChange({ ...vulnerability, title: cna.title })

        if (!cna.descriptions || cna.descriptions.length === 0) {
          addToast({
            title: t('vulnerabilities.general.noCveNotesFound'),
            description: t(
              'vulnerabilities.general.noCveNotesFoundDescription',
            ),
            color: 'warning',
          })
          return
        }

        let descriptions = cna.descriptions?.filter(
          (desc: CNADescription) =>
            (desc.lang as string).toLowerCase() === docLanguage,
        )

        if (!descriptions || descriptions.length === 0) {
          descriptions = cna.descriptions?.filter(
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

        cna.metrics?.map((metric: any) => {
          if (metric.cvssV4_0) {
            vulnerability.scores.push({
              id: uid(),
              cvssVersion: '4.0',
              vectorString: metric.cvssV4_0.vectorString,
              productIds: [],
            })
          }

          if (metric.cvssV3_0) {
            vulnerability.scores.push({
              id: uid(),
              cvssVersion: '3.0',
              vectorString: metric.cvssV3_0.vectorString,
              productIds: [],
            })
          }
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
          content={t('vulnerabilities.general.fetchCVEData')}
          showArrow
          isDisabled={!vulnerability.cve || !apiUrl}
        >
          <Button
            color={!vulnerability.cve || !apiUrl ? 'default' : 'primary'}
            onPress={fetchCVEData}
            disabled={!vulnerability.cve || !apiUrl}
            isLoading={fetchingCve}
          >
            {t('vulnerabilities.general.fetchCve')}
          </Button>
        </Tooltip>
      )}
    </HSplit>
  )
}
