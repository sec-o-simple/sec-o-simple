import { Input } from '@/components/forms/Input'
import { Button } from '@heroui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from '@heroui/table'
import IconButton from './IconButton'
import { faTrash } from '@fortawesome/free-solid-svg-icons'
import { useListState } from '@/utils/useListState'
import {
  getDefaultRevisionHistoryEntry,
  TRevisionHistoryEntry,
} from '@/routes/document-information/types/tRevisionHistoryEntry'
import useDocumentStoreUpdater from '@/utils/useDocumentStoreUpdater'
import { TDocumentInformation } from '@/routes/document-information/types/tDocumentInformation'
import { useListValidation } from '@/utils/validation/useListValidation'
import { Alert } from '@heroui/react'
import DatePicker from './DatePicker'

export default function RevisionHistoryTable() {
  const revisionHistoryState = useListState<TRevisionHistoryEntry>({
    generator: () => getDefaultRevisionHistoryEntry(),
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
        <h2 className="text-lg font-semibold">Revision History</h2>
        <Button variant="light" color="primary" onPress={handleAddRevision}>
          Add Revision
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
          <TableColumn width="20%">Version</TableColumn>
          <TableColumn width="20%">Date</TableColumn>
          <TableColumn width="30%">Description</TableColumn>
          <TableColumn width="10%">Actions</TableColumn>
        </TableHeader>
        <TableBody emptyContent={'No revisions added yet'}>
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
                  placeholder="Enter version"
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
                  placeholder="Enter description"
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
