import { Input } from '@/components/forms/Input'
import { TDocumentInformation } from '@/routes/document-information/types/tDocumentInformation'
import {
  getDefaultRevisionHistoryEntry,
  TRevisionHistoryEntry,
} from '@/routes/document-information/types/tRevisionHistoryEntry'
import { retrieveLatestVersion } from '@/utils/csafExport/latestVersion'
import useDocumentStoreUpdater from '@/utils/useDocumentStoreUpdater'
import { useListState } from '@/utils/useListState'
import { useListValidation } from '@/utils/validation/useListValidation'
import { faTrash } from '@fortawesome/free-solid-svg-icons'
import { Button } from '@heroui/button'
import { Alert } from '@heroui/react'
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from '@heroui/table'
import { useTranslation } from 'react-i18next'
import semver from 'semver'
import DatePicker from './DatePicker'
import IconButton from './IconButton'

export default function RevisionHistoryTable() {
  const { t } = useTranslation()

  const revisionHistoryState = useListState<TRevisionHistoryEntry>({
    generator: () => {
      const latestRevision: string = revisionHistoryState.data.length
        ? retrieveLatestVersion(revisionHistoryState.data)
        : '0'
      let nextVersion: string = ''

      // If using semver, increment the version number patch version
      // If using integer versioning, increment the version number by 1
      if (semver.valid(latestRevision)) {
        nextVersion = semver.inc(latestRevision, 'patch') || ''
      } else if (!isNaN(parseInt(latestRevision))) {
        nextVersion = (parseInt(latestRevision) + 1).toString()
      }

      return {
        ...getDefaultRevisionHistoryEntry(),
        number: nextVersion,
      }
    },
  })

  useDocumentStoreUpdater<TDocumentInformation>({
    localState: [
      revisionHistoryState.data,
      () => ({ revisionHistory: revisionHistoryState.data }),
    ],
    valueField: 'documentInformation',
    valueUpdater: 'updateDocumentInformation',
    init: (initialData) =>
      revisionHistoryState.setData(initialData.revisionHistory),
  })

  const handleAddRevision = () => {
    revisionHistoryState.addDataEntry()
  }

  const handleRevisionChange = (updatedRevision: TRevisionHistoryEntry) => {
    revisionHistoryState.updateDataEntry(updatedRevision)
  }

  const handleDeleteRevision = (revision: TRevisionHistoryEntry) => {
    revisionHistoryState.removeDataEntry(revision)
  }

  const listValidation = useListValidation(
    `/document/tracking/revision_history`,
    revisionHistoryState.data,
  )

  return (
    <div className="mt-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          {t('document.general.revisionHistory.history')}
        </h2>
        <Button variant="light" color="primary" onPress={handleAddRevision}>
          {t('common.add', {
            label: t('document.general.revisionHistory.label'),
          })}
        </Button>
      </div>
      {listValidation.hasErrors && (
        <Alert color="danger" className="mb-4">
          {listValidation.errorMessages.map((m) => (
            <p key={m.path}>{m.message}</p>
          ))}
        </Alert>
      )}
      <Table>
        <TableHeader>
          <TableColumn width="20%">
            {t('document.general.revisionHistory.version')}
          </TableColumn>
          <TableColumn width="20%">
            {t('document.general.revisionHistory.date')}
          </TableColumn>
          <TableColumn width="30%">
            {t('document.general.revisionHistory.description')}
          </TableColumn>
          <TableColumn width="10%">{t('common.actions')}</TableColumn>
        </TableHeader>
        <TableBody emptyContent={t('document.general.revisionHistory.empty')}>
          {revisionHistoryState.data.map((revision, index) => (
            <TableRow key={revision.id}>
              <TableCell>
                <Input
                  csafPath={`/document/tracking/revision_history/${index}/number`}
                  value={revision.number}
                  onValueChange={(value) =>
                    handleRevisionChange({
                      ...revision,
                      number: value,
                    })
                  }
                  placeholder={t('common.placeholder', {
                    label: t('document.general.revisionHistory.version'),
                  })}
                />
              </TableCell>
              <TableCell>
                <DatePicker
                  csafPath={`/document/tracking/revision_history/${index}/date`}
                  value={revision.date}
                  onChange={(newValue) =>
                    handleRevisionChange({ ...revision, date: newValue })
                  }
                />
              </TableCell>
              <TableCell>
                <Input
                  value={revision.summary}
                  csafPath={`/document/tracking/revision_history/${index}/summary`}
                  onValueChange={(value) =>
                    handleRevisionChange({
                      ...revision,
                      summary: value,
                    })
                  }
                  placeholder={t('common.placeholder', {
                    label: t('document.general.revisionHistory.description'),
                  })}
                />
              </TableCell>
              <TableCell>
                <IconButton
                  icon={faTrash}
                  onPress={() => handleDeleteRevision(revision)}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
