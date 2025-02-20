import { PropsWithChildren } from 'react'
import { Outlet } from 'react-router'

export default function NavigationLayout() {
  return (
    <div className="flex grow">
      <div className="flex basis-80 flex-col gap-2 border-r border-slate-300 p-4">
        <Section number={1} title="Document Information" active={true}>
          <SubSection title="General" active={true} />
          <SubSection title="Notes" />
          <SubSection title="Publisher" />
          <SubSection title="References" />
        </Section>
        <Section number={2} title="Products" />
        <Section number={3} title="Vulnerabilities" />
      </div>
      <div className="grow">
        <Outlet />
      </div>
    </div>
  )
}

function Section({
  number,
  title,
  active,
  children,
}: PropsWithChildren<{
  number: number
  title: string
  active?: boolean
}>) {
  return (
    <div className="flex flex-col gap-2 text-neutral-foreground">
      <div
        className={`flex cursor-pointer items-center gap-2 rounded-lg p-2 transition-colors hover:bg-content2 ${
          active ? 'bg-content2 font-semibold text-foreground' : ''
        }`}
      >
        <div
          className={`flex size-8 items-center justify-center rounded-full bg-content3 p-4 ${
            active ? 'bg-primary text-primary-foreground' : ''
          }`}
        >
          {number}
        </div>
        {title}
      </div>
      {children}
    </div>
  )
}

function SubSection({ title, active }: { title: string; active?: boolean }) {
  return (
    <div
      className={`cursor-pointer pl-12 transition-colors hover:text-primary ${
        active ? 'text-primary' : ''
      }`}
    >
      {title}
    </div>
  )
}
