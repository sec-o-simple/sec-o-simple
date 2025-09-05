import HSplit from '@/components/forms/HSplit'
import IconButton from '@/components/forms/IconButton'
import VSplit from '@/components/forms/VSplit'
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons'
import { cn } from '@heroui/react'
import { HTMLProps, PropsWithChildren, ReactNode } from 'react'
import { Link } from 'react-router'

export type InfoCardProps = PropsWithChildren<{
  variant?: 'boxed' | 'plain'
  title: string | ReactNode
  description?: string
  startContent?: ReactNode
  endContent?: ReactNode
  linkTo?: string
  onEdit?: () => void
  onDelete?: () => void
}> &
  HTMLProps<HTMLDivElement>

export default function InfoCard({
  title,
  ...props
}: {
  title: string | ReactNode
} & InfoCardProps) {
  if (props.variant === 'boxed') {
    return <BoxedInfoCard title={title} {...props} />
  } else {
    const {
      description,
      startContent,
      endContent,
      linkTo,
      onEdit,
      onDelete,
      children,
      disabled,
      ...divProps
    } = props
    return (
      <VSplit {...divProps}>
        <HSplit className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {startContent}
            <div
              className={cn('font-bold', {
                'hover:underline': linkTo,
              })}
            >
              {linkTo ? (
                <Link to={linkTo}>
                  <div>{title}</div>
                </Link>
              ) : (
                title
              )}
            </div>

            <div className="text-neutral-foreground">{description}</div>
          </div>
          <div>
            {endContent}
            {onEdit && (
              <IconButton
                icon={faEdit}
                onPress={onEdit}
                isDisabled={disabled}
              />
            )}
            {onDelete && (
              <IconButton
                icon={faTrash}
                onPress={onDelete}
                isDisabled={disabled}
              />
            )}
          </div>
        </HSplit>
        {children}
      </VSplit>
    )
  }
}

function BoxedInfoCard(props: InfoCardProps) {
  return (
    <div className="border-default-200 bg-content1 rounded-lg border px-4 py-2">
      <InfoCard {...props} variant="plain" />
    </div>
  )
}
