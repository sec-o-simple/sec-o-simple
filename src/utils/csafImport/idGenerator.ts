import { uid } from 'uid'

export class IdGenerator {
  previousGeneratedIds: { [key: string]: string } = {}

  getId(csafPid?: string): string {
    if (
      csafPid &&
      csafPid !== '' &&
      this.previousGeneratedIds[csafPid] !== undefined
    ) {
      return this.previousGeneratedIds[csafPid]
    } else {
      const newId = uid()
      if (csafPid) {
        this.previousGeneratedIds[csafPid] = newId
      }
      return newId
    }
  }
}
