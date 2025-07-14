import IconButton from '@/components/forms/IconButton'
import { faAdd, faArrowLeft } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Button } from '@heroui/button'
import { HTMLProps } from 'react'
import { useNavigate } from 'react-router'
import { twMerge } from 'tailwind-merge'

export type SubMenuHeaderProps = HTMLProps<HTMLDivElement> & {
  title: string
  backLink: string
  actionTitle?: string
  onAction?: () => void
}

export default function SubMenuHeader({
  title,
  backLink,
  actionTitle,
  onAction,
  ...divProps
}: SubMenuHeaderProps) {
  const navigate = useNavigate()

  return (
    <div
      {...divProps}
      className={twMerge(
        'flex items-center justify-between',
        divProps.className,
      )}
    >
      <div className="flex items-center gap-2 text-xl font-bold">
        <IconButton icon={faArrowLeft} onPress={() => navigate(backLink)} />
        {title}
      </div>
      {actionTitle && (
        <Button
          color="primary"
          onPress={onAction}
          startContent={<FontAwesomeIcon icon={faAdd} />}
        >
          {actionTitle}
        </Button>
      )}
    </div>
  )
}
