import { ReactNode } from 'react'
import { twMerge } from 'tailwind-merge'

export default function VSplit({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={twMerge('flex flex-col gap-4', className)}>{children}</div>
  )
}
