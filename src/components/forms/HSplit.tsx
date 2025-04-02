import { ReactNode } from 'react'
import { twMerge } from 'tailwind-merge'

export default function HSplit({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return <div className={twMerge('flex gap-4', className)}>{children}</div>
}
