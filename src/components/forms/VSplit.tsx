import { ReactNode } from 'react'

export default function VSplit({ children }: { children: ReactNode }) {
  return <div className="flex flex-col gap-4">{children}</div>
}
