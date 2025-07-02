import { uid } from "uid"

export type TRevisionHistoryEntry = {
    id: string
    date: string
    number: string
    summary: string
}

export function getDefaultRevisionHistoryEntry(): TRevisionHistoryEntry {
  return {
    id: uid(),
    date: new Date().toISOString(),
    number: '',
    summary: '',
  }
}