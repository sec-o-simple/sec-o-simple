export default function StatusIndicator({
  hasErrors,
  hasVisited,
}: {
  hasErrors: boolean
  hasVisited: boolean
}) {
  return (
    <div
      className={`size-2 rounded-full ${
        hasVisited
          ? hasErrors
            ? 'bg-red-400'
            : 'bg-green-500'
          : 'bg-neutral-300'
      }`}
    />
  )
}