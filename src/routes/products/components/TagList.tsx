import HSplit from '@/components/forms/HSplit'
import { faX } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Chip } from '@heroui/chip'

export type TagListProps<T> = {
  items: T[]
  labelGenerator?: (item: T) => string
  onRemove?: (item: T) => void
}

export default function TagList<T>({
  items,
  labelGenerator,
  onRemove,
}: TagListProps<T>) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item, i) => (
        <Chip
          key={i}
          className="rounded-md bg-content2 text-content2-foreground"
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
