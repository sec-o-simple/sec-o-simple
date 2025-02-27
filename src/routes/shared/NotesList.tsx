import ComponentList from '@/components/forms/ComponentList'
import HSplit from '@/components/forms/HSplit'
import VSplit from '@/components/forms/VSplit'
import { ListState } from '@/utils/useListState'
import { Chip } from '@heroui/chip'
import { Input, Textarea } from '@heroui/input'
import { Select, SelectItem } from '@heroui/select'
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
}: {
  notesListState: ListState<TNote>
}) {
  return (
    <ComponentList
      listState={notesListState}
      title="title"
      content={(note) => (
        <NoteForm note={note} onChange={notesListState.updateDataEntry} />
      )}
      startContent={(note) => <CategoryChip note={note} />}
    />
  )
}

function CategoryChip({ note }: { note: TNote }) {
  return (
    <Chip color="secondary" variant="flat">
      {note.category}
    </Chip>
  )
}

function NoteForm({
  note,
  onChange,
}: {
  note: TNote
  onChange: (note: TNote) => void
}) {
  return (
    <VSplit>
      <HSplit>
        <Select
          label="Note category"
          selectedKeys={[note.category]}
          onSelectionChange={(selected) => {
            onChange({
              ...note,
              category: [...selected][0] as TNoteCategory,
            })
          }}
        >
          {noteCategories.map((key) => (
            <SelectItem key={key}>{key}</SelectItem>
          ))}
        </Select>
        <Input
          label="Title"
          value={note.title}
          onValueChange={(newValue) => onChange({ ...note, title: newValue })}
          autoFocus={true}
        />
      </HSplit>
      <Textarea
        label="Note Content"
        value={note.content}
        onValueChange={(newValue) => onChange({ ...note, content: newValue })}
      />
    </VSplit>
  )
}
