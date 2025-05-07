import {
  FontAwesomeIcon,
  FontAwesomeIconProps,
} from '@fortawesome/react-fontawesome'
import { Button, ButtonProps } from '@heroui/button'
import { Tooltip } from '@heroui/react'

export type IconButtonProps = ButtonProps & {
  icon: FontAwesomeIconProps['icon']
  tooltip?: string
}

export default function IconButton({
  icon,
  tooltip,
  ...buttonProps
}: IconButtonProps) {
  return (
    <Tooltip
      showArrow={true}
      content={tooltip}
      placement="bottom"
      isDisabled={!tooltip}
    >
      <Button
        isIconOnly={true}
        variant="light"
        className="rounded-full text-neutral-foreground"
        {...buttonProps}
      >
        <FontAwesomeIcon icon={icon} />
      </Button>
    </Tooltip>
  )
}
