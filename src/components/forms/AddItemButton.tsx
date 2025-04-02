import { faAdd } from '@fortawesome/free-solid-svg-icons'
import {
  FontAwesomeIcon,
  FontAwesomeIconProps,
} from '@fortawesome/react-fontawesome'
import { Button, ButtonProps } from '@heroui/button'
import { twMerge } from 'tailwind-merge'

export type AddItemButtonProps = ButtonProps & {
  label?: string
  icon?: FontAwesomeIconProps['icon']
}

export default function AddItemButton(props: AddItemButtonProps) {
  const { label = 'Add New Item', icon = faAdd, ...buttonProps } = props
  return (
    <Button
      {...buttonProps}
      variant="bordered"
      className={twMerge(
        'border-dashed text-neutral-foreground border-gray',
        buttonProps.className ?? '',
      )}
    >
      <FontAwesomeIcon icon={icon} />
      {label}
    </Button>
  )
}
