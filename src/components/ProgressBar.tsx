import { Fragment } from 'react/jsx-runtime'

export default function ProgressBar({
  sections,
  progress,
}: {
  sections: string[]
  progress: number
}) {
  return (
    <div className="relative mb-5 flex justify-stretch px-8 pb-1">
      {sections.map((section, i) => (
        <Fragment key={i}>
          <ProgressBarItem
            number={i + 1}
            title={section}
            isActive={progress >= i + 1}
          />
          {i < sections.length - 1 && (
            <ProgressLine progress={Math.max(0, (progress - i - 1) * 100)} />
          )}
        </Fragment>
      ))}
    </div>
  )
}

function ProgressBarItem({
  number,
  title,
  isActive,
}: {
  number: number
  title: string
  isActive?: boolean
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <div
        className={`border-default-200 bg-content1 text-neutral-foreground flex size-8 items-center justify-center rounded-full border p-4 ${
          isActive ? 'border-primary bg-primary text-primary-foreground' : ''
        }`}
      >
        {number}
      </div>
      <div
        className={`text-neutral-foreground absolute top-full text-sm ${
          isActive ? 'text-primary' : ''
        }`}
      >
        {title}
      </div>
    </div>
  )
}

function ProgressLine({ progress }: { progress: number }) {
  return (
    <div className="bg-content3 relative top-4 flex h-1 grow overflow-hidden">
      <div
        className={`bg-primary ${progress !== 100 ? 'rounded-r-full' : ''}`}
        style={{ width: `${progress}%` }}
      ></div>
    </div>
  )
}
