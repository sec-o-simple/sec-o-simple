import { TNote, TNoteCategory } from '@/routes/shared/NotesList'

export type TParsedNote = {
  category: TNoteCategory
  text: string
  title: string
}

export function parseNote(note: TNote): TParsedNote {
  return {
    category: note.category,
    text: note.content,
    title: note.title,
  }
}
