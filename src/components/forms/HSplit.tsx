import { ReactNode } from 'react'

export default function HSplit({ children }: { children: ReactNode }) {
  return <div className="flex gap-4">{children}</div>
}
