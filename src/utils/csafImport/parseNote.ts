import { TNote } from '@/routes/shared/NotesList'
import { TParsedNote } from '../csafExport/parseNote'
import { uid } from 'uid'

export function parseNote(csafNote: TParsedNote): TNote {
  return {
    id: uid(),
    category: csafNote.category,
    title: csafNote.title,
    content: csafNote.text,
  }
}
