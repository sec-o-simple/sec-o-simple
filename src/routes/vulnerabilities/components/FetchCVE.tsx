import HSplit from '@/components/forms/HSplit'
import { Input } from '@/components/forms/Input'
import { checkReadOnly, getPlaceholder } from '@/utils/template'
import { useConfigStore } from '@/utils/useConfigStore'
import useDocumentStore from '@/utils/useDocumentStore'
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from '@heroui/modal'
import { addToast, Button, Tooltip } from '@heroui/react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { uid } from 'uid'
import { TCwe, TVulnerability } from '../types/tVulnerability'

interface CNADescription {
  lang: string
  value: string
}

interface CNAMetric {
  cvssV3_1?: { vectorString: string }
  cvssV4_0?: { vectorString: string }
}

export default function FetchCVE({
  onChange,
  vulnerability,
  vulnerabilityIndex,
  cwes,
  isTouched = false,
}: {
  onChange: (vulnerability: TVulnerability) => void
  vulnerability: TVulnerability
  vulnerabilityIndex: number
  cwes: TCwe[]
  isTouched?: boolean
}) {
  const { t } = useTranslation()
  const [fetchingCve, setFetchingCve] = useState(false)
  const [cveError, setCVEError] = useState(false)
  const { isOpen, onOpen, onOpenChange } = useDisclosure()
  const [pendingOverrideFields, setPendingOverrideFields] = useState<string[]>(
    [],
  )

  const config = useConfigStore((state) => state.config)
  const docLanguage = useDocumentStore((state) =>
    state.documentInformation.lang.toLowerCase(),
  )

  let apiUrl = 'https://cveawg.mitre.org/api/cve'
  if (config && config?.cveApiUrl) {
    apiUrl = config?.cveApiUrl
  }

  const checkForExistingData = () => {
    const fieldsToOverride: string[] = []

    if (vulnerability.title?.trim()) fieldsToOverride.push('Title')
    if (vulnerability.cwe?.id) fieldsToOverride.push('CWE')

    return fieldsToOverride
  }

  const handleFetchCVE = () => {
    const overrideFields = checkForExistingData()

    if (overrideFields.length > 0) {
      setPendingOverrideFields(overrideFields)
      onOpen()
    } else {
      fetchCVEData()
    }
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

        // Fallback to English
        if (!descriptions || descriptions.length === 0) {
          descriptions = cna.descriptions?.filter(
            (desc: CNADescription) => desc.lang === 'en',
          )
        }

        descriptions?.map((desc: CNADescription, index: number) => {
          vulnerability.notes.push({
            id: uid(),
            title: `${t('vulnerabilities.general.description', {
              lng: docLanguage,
            })} - ${vulnerability.cve} - ${index + 1}`,
            content: desc.value,
            category: 'description',
          })
        })

        const initialScoreCount = vulnerability.scores.length
        cna.metrics?.map((metric: CNAMetric) => {
          if (metric.cvssV3_1) {
            vulnerability.scores.push({
              id: uid(),
              cvssVersion: '3.1',
              vectorString: metric.cvssV3_1.vectorString,
              productIds: [],
            })
          }

          if (metric.cvssV4_0) {
            vulnerability.scores.push({
              id: uid(),
              cvssVersion: '4.0',
              vectorString: metric.cvssV4_0.vectorString,
              productIds: [],
            })
          }
        })

        if (descriptions.length > 0) {
          addToast({
            title: t('vulnerabilities.general.cveNotesFetched'),
            description: t(
              'vulnerabilities.general.cveNotesFetchedDescription',
              {
                count: descriptions.length,
              },
            ),
            color: 'success',
          })
        }

        // Show warning if notes were added to existing notes
        const initialNoteCount =
          vulnerability.notes.length - descriptions.length
        if (initialNoteCount > 0 && descriptions.length > 0) {
          addToast({
            title: t('vulnerabilities.general.dataAddedWarning'),
            description: t(
              'vulnerabilities.general.dataAddedWarningDescription',
              {
                count: descriptions.length,
                type: 'notes',
              },
            ),
            color: 'warning',
          })
        }

        // Show warning if scores were added to existing scores
        const newScoreCount = vulnerability.scores.length - initialScoreCount
        if (initialScoreCount > 0 && newScoreCount > 0) {
          addToast({
            title: t('vulnerabilities.general.dataAddedWarning'),
            description: t(
              'vulnerabilities.general.dataAddedWarningDescription',
              {
                count: newScoreCount,
                type: 'scores',
              },
            ),
            color: 'warning',
          })
        }

        let cweID = undefined
        for (const pt of cna.problemTypes ?? []) {
          for (const d of pt?.descriptions ?? []) {
            if (d?.type === 'CWE' && d?.cweId && cweID === undefined) {
              cweID = d.cweId
            }
          }
        }

        let cweName = {}
        if (cweID) {
          cweName = {
            cwe: {
              id: cweID,
              name: cwes.find((x) => x.id === cweID)?.name || '',
            },
          }
        }

        onChange({
          ...vulnerability,
          ...cweName,
          title: cna.title ?? '',
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

  const fetchDisabled = useMemo(() => {
    return !vulnerability.cve || !apiUrl || fetchingCve
  }, [vulnerability.cve, apiUrl, fetchingCve])

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
          isDisabled={fetchDisabled}
        >
          <Button
            color={fetchDisabled ? 'default' : 'primary'}
            onPress={handleFetchCVE}
            disabled={fetchDisabled}
            isLoading={fetchingCve}
          >
            {t('vulnerabilities.general.fetchCve')}
          </Button>
        </Tooltip>
      )}

      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {t('vulnerabilities.general.dataOverrideWarning')}
              </ModalHeader>
              <ModalBody>
                <p>
                  {t('vulnerabilities.general.dataOverrideWarningDescription', {
                    fields: pendingOverrideFields.join(', '),
                  })}
                </p>
              </ModalBody>
              <ModalFooter>
                <Button
                  color="danger"
                  variant="light"
                  onPress={onClose}
                  data-testid="modal-cancel-button"
                >
                  {t('common.cancel')}
                </Button>
                <Button
                  color="primary"
                  onPress={() => {
                    onClose()
                    fetchCVEData()
                  }}
                  data-testid="modal-confirm-button"
                >
                  {t('common.confirm')}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </HSplit>
  )
}
