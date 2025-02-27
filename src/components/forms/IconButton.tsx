import {
  FontAwesomeIcon,
  FontAwesomeIconProps,
} from '@fortawesome/react-fontawesome'
import { Button, ButtonProps } from '@heroui/button'

export type IconButtonProps = ButtonProps & {
  icon: FontAwesomeIconProps['icon']
}

export default function IconButton({ icon, ...buttonProps }: IconButtonProps) {
  return (
    <Button
      isIconOnly={true}
      variant="light"
      className="rounded-full text-neutral-foreground"
      {...buttonProps}
    >
      <FontAwesomeIcon icon={icon} />
    </Button>
  )
}
