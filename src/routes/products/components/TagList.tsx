import HSplit from '@/components/forms/HSplit'
import { faX } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Chip } from '@heroui/chip'
import { cn } from '@heroui/react'
import { useNavigate } from 'react-router'

export type TagListProps<T> = {
  items: T[]
  labelGenerator?: (item: T) => string
  linkGenerator?: (item: T) => string
  onRemove?: (item: T) => void
}

export default function TagList<T>({
  items,
  labelGenerator,
  linkGenerator,
  onRemove,
}: TagListProps<T>) {
  const navigate = useNavigate()

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item, i) => (
        <Chip
          key={i}
          className={cn(
            'rounded-md bg-content2 text-content2-foreground',
            linkGenerator ? 'cursor-pointer hover:underline' : '',
          )}
          onClick={() => {
            if (linkGenerator) {
              navigate(linkGenerator(item))
            }
          }}
        >
          <HSplit className="items-center gap-2">
            {labelGenerator
              ? labelGenerator?.(item)
              : typeof item === 'string'
                ? item
                : ''}
            {onRemove && (
              <FontAwesomeIcon
                icon={faX}
                onClick={() => onRemove?.(item)}
                size="xs"
                className="cursor-pointer text-neutral-foreground"
              />
            )}
          </HSplit>
        </Chip>
      ))}
    </div>
  )
}
