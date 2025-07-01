import { Input } from '@/components/forms/Input'
import { Button } from '@heroui/button'
import { Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from '@heroui/table'

export interface RevisionHistoryEntry {
  version: string
  date: string
  description: string
}

interface RevisionHistoryTableProps {
  revisions: RevisionHistoryEntry[]
  onChange: (revisions: RevisionHistoryEntry[]) => void
}

export default function RevisionHistoryTable({ revisions, onChange }: RevisionHistoryTableProps) {
  const handleAddRevision = () => {
    const newRevision: RevisionHistoryEntry = {
      version: '',
      date: new Date().toISOString().split('T')[0],
      description: ''
    }
    onChange([...(revisions || []), newRevision])
  }

  const handleRevisionChange = (index: number, field: keyof RevisionHistoryEntry, value: string) => {
    const updatedHistory = [...(revisions || [])]
    updatedHistory[index] = { ...updatedHistory[index], [field]: value }
    onChange(updatedHistory)
  }

  const handleDeleteRevision = (index: number) => {
    const updatedHistory = [...(revisions || [])]
    updatedHistory.splice(index, 1)
    onChange(updatedHistory)
  }

  return (
    <div className="mt-4">
        <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Revision History</h2>
            <Button
              variant='flat'
              onPress={handleAddRevision}
            >
                Add Revision
            </Button>
        </div>
      <Table>
        <TableHeader>
            <TableColumn>Version</TableColumn>
            <TableColumn>Date</TableColumn>
            <TableColumn>Description</TableColumn>
            <TableColumn>Actions</TableColumn>
        </TableHeader>
        <TableBody>
          {(revisions || []).map((revision, index) => (
            <TableRow key={index}>
              <TableCell>
                <Input
                  value={revision.version}
                  onValueChange={(value) => handleRevisionChange(index, 'version', value)}
                  placeholder="Enter version"
                />
              </TableCell>
              <TableCell>
                <Input
                  type="date"
                  value={revision.date}
                  onValueChange={(value) => handleRevisionChange(index, 'date', value)}
                />
              </TableCell>
              <TableCell>
                <Input
                  value={revision.description}
                  onValueChange={(value) => handleRevisionChange(index, 'description', value)}
                  placeholder="Enter description"
                />
              </TableCell>
              <TableCell>
                <Button
                  color="danger"
                  variant="ghost"
                  onPress={() => handleDeleteRevision(index)}
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}