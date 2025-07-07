import { Input } from '@/components/forms/Input'
import {
  getDefaultDocumentAcknowledgmentName,
  TAcknowledgment,
  TAcknowledgmentName,
} from '@/routes/document-information/types/tDocumentAcknowledgments'
import { useListState } from '@/utils/useListState'
import { faAdd, faTrash } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Button } from '@heroui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from '@heroui/table'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import IconButton from './IconButton'

export default function AcknowledgmentNamesTable({
  acknowledgment,
  acknowledgmentIndex,
  onChange,
}: {
  acknowledgment: TAcknowledgment
  acknowledgmentIndex: number
  onChange: (acknowledgment: TAcknowledgment) => void
}) {
  const { t } = useTranslation()
  const acknowledgmentNames = useListState<TAcknowledgmentName>({
    initialData: acknowledgment.names,
    generator: getDefaultDocumentAcknowledgmentName,
  })

  useEffect(
    () =>
      onChange({
        ...acknowledgment,
        names: acknowledgmentNames.data,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [acknowledgmentNames.data],
  )

  const handleAddRevision = () => acknowledgmentNames.addDataEntry()
  const handleRevisionChange = (updatedName: TAcknowledgmentName) =>
    acknowledgmentNames.updateDataEntry(updatedName)
  const handleDeleteName = (name: TAcknowledgmentName) =>
    acknowledgmentNames.removeDataEntry(name)

  return (
    <div className="mt-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          {t('document.acknowledgments.names')}
        </h2>
        <Button variant="light" color="primary" onPress={handleAddRevision}>
          <FontAwesomeIcon icon={faAdd} />
          {t('common.add', {
            label: t('document.acknowledgments.name'),
          })}
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableColumn width="20%">
            {t('document.acknowledgments.name')}
          </TableColumn>
          <TableColumn width="10%">{t('common.actions')}</TableColumn>
        </TableHeader>
        <TableBody emptyContent={t('document.acknowledgments.empty')}>
          {acknowledgmentNames.data?.map((name, index) => (
            <TableRow key={name.name}>
              <TableCell>
                <Input
                  value={name.name}
                  csafPath={`/document/acknowledgments/${acknowledgmentIndex}/names/${index}`}
                  onValueChange={(value) =>
                    handleRevisionChange({
                      ...acknowledgmentNames.data[index],
                      name: value,
                    })
                  }
                  placeholder={t('common.placeholder', {
                    label: t('document.acknowledgments.name'),
                  })}
                />
              </TableCell>
              <TableCell>
                <IconButton
                  icon={faTrash}
                  onPress={() => handleDeleteName(name)}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
