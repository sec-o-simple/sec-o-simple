import Select from '@/components/forms/Select'
import { ListState } from '@/utils/useListState'
import { useTranslation } from 'react-i18next'
import { TNote } from './NotesList'

export function NotesTemplates({
  notesListState,
  csafPath,
  isTouched = false,
}: {
  notesListState: ListState<TNote>
  csafPath: string
  isTouched?: boolean
}) {
  const { t } = useTranslation()

  return (
    <Select>
      <Select.Item value="description">{t('notes.description')}</Select.Item>
      <Select.Item value="details">{t('notes.details')}</Select.Item>
      <Select.Item value="faq">{t('notes.faq')}</Select.Item>
      <Select.Item value="general">{t('notes.general')}</Select.Item>
      <Select.Item value="legal_disclaimer">
        {t('notes.legal_disclaimer')}
      </Select.Item>
      <Select.Item value="other">{t('notes.other')}</Select.Item>
      <Select.Item value="summary">{t('notes.summary')}</Select.Item>
    </Select>
  )
}
