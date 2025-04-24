import { faTrash } from '@fortawesome/free-solid-svg-icons'
import { Accordion, AccordionItem } from '@heroui/accordion'
import { HTMLProps, ReactNode, useState } from 'react'
import IconButton from './IconButton'
import { Selection } from '@heroui/react'
import { ListState } from '@/utils/useListState'
import {
  DynamicObjectValueKey,
  getDynamicObjectValue,
} from '@/utils/dynamicObjectValue'
import AddItemButton from './AddItemButton'
import { checkReadOnly } from '@/utils/template'
import { twMerge } from 'tailwind-merge'

export type ComponentListProps<T> = {
  listState: ListState<T>
  title: DynamicObjectValueKey<T>
  /** Generator function for a ReactNode that will be shown when an item is expanded */
  content: (item: T) => ReactNode
  onChange?: (updatedItems: T[]) => void
  onDelete?: (item: T) => void
  startContent?: (item: T) => ReactNode
  endContent?: (item: T) => ReactNode
  titleProps?: HTMLProps<HTMLDivElement>
}

export default function ComponentList<T extends object>({
  listState,
  title,
  content,
  onDelete,
  startContent,
  endContent,
  titleProps,
}: ComponentListProps<T>) {
  const [expandedKeys, setExpandedKeys] = useState<Selection>(new Set([]))

  return (
    <div className="flex flex-col gap-2">
      <Accordion
        selectedKeys={expandedKeys}
        onSelectionChange={setExpandedKeys}
        variant="splitted"
        selectionMode="multiple"
        itemClasses={{
          trigger: 'flex justify-between py-0',
          titleWrapper: 'hidden',
          startContent: 'grow',
          indicator: 'text-neutral-foreground',
          base: 'border border-gray shadow-none px-4 py-2',
          content: 'py-2',
        }}
        className="px-0"
      >
        {listState.data.map((item) => (
          <AccordionItem
            key={listState.getId(item)}
            startContent={
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {startContent?.(item)}
                  <div
                    {...titleProps}
                    className={twMerge(
                      'max-w-xl overflow-hidden text-ellipsis text-nowrap',
                      titleProps?.className,
                    )}
                  >
                    {getDynamicObjectValue(item, title) || (
                      <span>Untitled</span>
                    )}
                  </div>
                  {endContent?.(item)}
                </div>
                <IconButton
                  icon={faTrash}
                  onPress={() =>
                    onDelete
                      ? onDelete?.(item)
                      : listState.removeDataEntry(item)
                  }
                  isDisabled={checkReadOnly(item)}
                />
              </div>
            }
          >
            {content(item)}
          </AccordionItem>
        ))}
      </Accordion>
      <AddItemButton
        onPress={() => {
          const key = listState.addDataEntry()
          // expand new item
          if (key) {
            setExpandedKeys(new Set([...expandedKeys, key]))
          }
        }}
      />
    </div>
  )
}
