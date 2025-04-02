export function getFilename(trackingId: string): string {
  return trackingId.toLowerCase().replaceAll(/[^+\-a-z0-9]+/g, '_')
}
