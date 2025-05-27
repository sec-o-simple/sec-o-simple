export class PidGenerator {
  counter = 1
  previousGeneratedIds: { ptbId: string; pid: string }[] = []
  prefix = 'CSAFPID'

  getPid(productTreeBranchId: string) {
    const previous = this.previousGeneratedIds.find(
      (x) => x.ptbId === productTreeBranchId,
    )
    if (previous) {
      return previous.pid
    } else {
      const newId = `${this.prefix}-${String(this.counter).padStart(4, '0')}`
      this.counter += 1
      this.previousGeneratedIds.push({
        ptbId: productTreeBranchId,
        pid: newId,
      })
      return newId
    }
  }
}
