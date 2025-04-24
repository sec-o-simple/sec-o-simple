import ComponentList from '@/components/forms/ComponentList'
import HSplit from '@/components/forms/HSplit'
import { Input, Textarea } from '@/components/forms/Input'
import Select from '@/components/forms/Select'
import VSplit from '@/components/forms/VSplit'
import { checkReadOnly } from '@/utils/template'
import { ListState } from '@/utils/useListState'
import { Chip } from '@heroui/chip'
import { SelectItem } from '@heroui/select'
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

export const NoteGenerator = (): TNote => ({
  id: uid(),
  title: '',
  category: 'description',
  content: '',
})

export function NotesList({
  notesListState,
  csafPath,
}: {
  notesListState: ListState<TNote>,
  csafPath: string,
}) {
  return (
    <ComponentList
      listState={notesListState}
      title="title"
      content={(note, index) => (
        <NoteForm note={note} csafPath={`${csafPath}/${index}`} onChange={notesListState.updateDataEntry} />
      )}
      startContent={(note) => <CategoryChip note={note} />}
    />
  )
}

function CategoryChip({ note }: { note: TNote }) {
  return (
    <Chip color="primary" variant="flat" radius="md" size="lg">
      {note.category}
    </Chip>
  )
}

function NoteForm({
  note,
  csafPath,
  onChange,
}: {
  note: TNote
  csafPath: string
  onChange: (note: TNote) => void
}) {
  return (
    <VSplit className="pt-4">
      <HSplit className="items-start">
        <Select
          label="Note category"
          csafPath={`${csafPath}/category`}
          selectedKeys={[note.category]}
          onSelectionChange={(selected) => {
            onChange({
              ...note,
              category: [...selected][0] as TNoteCategory,
            })
          }}
          isDisabled={checkReadOnly(note, 'category')}
        >
          {noteCategories.map((key) => (
            <SelectItem key={key}>{key}</SelectItem>
          ))}
        </Select>
        <Input
          label="Title"
          csafPath={`${csafPath}/title`}
          value={note.title}
          onValueChange={(newValue) => onChange({ ...note, title: newValue })}
          autoFocus={true}
          isDisabled={checkReadOnly(note, 'title')}
        />
      </HSplit>
      <Textarea
        label="Note Content"
        csafPath={`${csafPath}/text`}
        value={note.content}
        onValueChange={(newValue) => onChange({ ...note, content: newValue })}
        isDisabled={checkReadOnly(note, 'content')}
      />
    </VSplit>
  )
}
