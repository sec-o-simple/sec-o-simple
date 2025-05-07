import { HTMLProps, ReactNode } from 'react'
import { twMerge } from 'tailwind-merge'

export default function HSplit({
  children,
  ...props
}: HTMLProps<HTMLDivElement> & {
  children: ReactNode
}) {
  return (
    <div {...props} className={twMerge('flex gap-4', props.className)}>
      {children}
    </div>
  )
}
