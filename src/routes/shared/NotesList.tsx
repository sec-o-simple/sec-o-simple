import ComponentList from '@/components/forms/ComponentList'
import HSplit from '@/components/forms/HSplit'
import { Input, Textarea } from '@/components/forms/Input'
import Select from '@/components/forms/Select'
import VSplit from '@/components/forms/VSplit'
import StatusIndicator from '@/components/StatusIndicator'
import { checkReadOnly, getPlaceholder, useTemplate } from '@/utils/template'
import { ListState } from '@/utils/useListState'
import { usePrefixValidation } from '@/utils/validation/usePrefixValidation'
import useValidationStore from '@/utils/validation/useValidationStore'
import { Chip } from '@heroui/chip'
import { Alert } from '@heroui/react'
import { SelectItem } from '@heroui/select'
import { useTranslation } from 'react-i18next'
import { uid } from 'uid'

export const noteCategories = [
  'description',
  'details',
  'faq',
  'general',
  'legal_disclaimer',
  'other',
  'summary',
] as const

export type TNoteCategory = (typeof noteCategories)[number]

export type TNote = {
  id: string
  category: TNoteCategory
  content: string
  title: string
}

export function useNoteGenerator(): TNote {
  const { getTemplateDefaultObject } = useTemplate()
  const defaultNote = getTemplateDefaultObject<TNote>(
    'document-information.notes',
  )

  return {
    id: uid(),
    title: defaultNote.title || '',
    category: defaultNote.category || 'description',
    content: defaultNote.content || '',
  }
}

export function useVulnerabilityNoteGenerator(): TNote {
  const { getTemplateDefaultObject } = useTemplate()
  const defaultNote = getTemplateDefaultObject<TNote>('vulnerabilities.notes')

  return {
    id: uid(),
    title: defaultNote.title || '',
    category: defaultNote.category || 'description',
    content: defaultNote.content || '',
  }
}

export function NotesList({
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
    <ComponentList
      listState={notesListState}
      title="title"
      itemLabel={t('notes.note')}
      itemBgColor="bg-zinc-50"
      content={(note, index) => (
        <NoteForm
          note={note}
          noteIndex={index}
          csafPath={`${csafPath}/${index}`}
          isTouched={isTouched}
          onChange={notesListState.updateDataEntry}
        />
      )}
      startContent={({ item, index }) => (
        <NoteStartContent item={item} csafPath={`${csafPath}/${index}`} />
      )}
    />
  )
}

function NoteStartContent({
  item,
  csafPath,
}: {
  item: TNote
  csafPath: string
}) {
  const { t } = useTranslation()
  const { hasErrors } = usePrefixValidation(csafPath)

  // Check if there is a validation message for this path
  const message = useValidationStore((state) =>
    state.messages.find((m) => m.path === csafPath),
  )

  return (
    <>
      <StatusIndicator hasErrors={hasErrors || !!message} hasVisited={true} />
      <Chip color="primary" variant="flat" radius="md" size="lg">
        {t(`notes.categories.${item.category}`)}
      </Chip>
    </>
  )
}

function NoteForm({
  note,
  noteIndex,
  csafPath,
  onChange,
  isTouched = false,
}: {
  note: TNote
  noteIndex?: number
  csafPath: string
  onChange: (note: TNote) => void
  isTouched?: boolean
}) {
  const { t } = useTranslation()

  const message = useValidationStore((state) => state.messages).filter(
    (m) => m.path === `/document/notes/${noteIndex}`,
  )?.[0]

  return (
    <VSplit className="pt-4">
      {message?.severity === 'error' && (
        <Alert color="danger" className="mb-4">
          <p>{message.message}</p>
        </Alert>
      )}

      <HSplit className="items-start">
        <Select
          label={t('notes.category')}
          csafPath={`${csafPath}/category`}
          isTouched={isTouched}
          isRequired
          selectedKeys={[note.category]}
          onSelectionChange={(selected) => {
            if (!selected.anchorKey) return

            onChange({
              ...note,
              category: [...selected][0] as TNoteCategory,
            })
          }}
          isDisabled={checkReadOnly(note, 'category')}
          placeholder={getPlaceholder(note, 'category')}
        >
          {noteCategories.map((key) => (
            <SelectItem key={key}>{t(`notes.categories.${key}`)}</SelectItem>
          ))}
        </Select>
        <Input
          label={t('notes.title')}
          isTouched={isTouched}
          csafPath={`${csafPath}/title`}
          value={note.title}
          onValueChange={(newValue) => onChange({ ...note, title: newValue })}
          autoFocus={true}
          placeholder={getPlaceholder(note, 'title')}
          isDisabled={checkReadOnly(note, 'title')}
          isRequired
        />
      </HSplit>
      <Textarea
        label={t('notes.content')}
        isTouched={isTouched}
        csafPath={`${csafPath}/text`}
        value={note.content}
        onValueChange={(newValue) => onChange({ ...note, content: newValue })}
        placeholder={getPlaceholder(note, 'content')}
        isDisabled={checkReadOnly(note, 'content')}
        isRequired
      />
    </VSplit>
  )
}
