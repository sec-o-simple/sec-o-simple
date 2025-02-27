import { faAdd, faTrash } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Accordion, AccordionItem } from '@heroui/accordion'
import { Button } from '@heroui/button'
import { ReactNode, useState } from 'react'
import IconButton from './IconButton'
import { Selection } from '@heroui/react'
import { ListState } from '@/utils/useListState'
import {
  DynamicObjectValueKey,
  getDynamicObjectValue,
} from '@/utils/dynamicObjectValue'

export type ComponentListProps<T> = {
  listState: ListState<T>
  title: DynamicObjectValueKey<T>
  /** Generator function for a ReactNode that will be shown when an item is expanded */
  content: (item: T) => ReactNode
  onChange?: (updatedItems: T[]) => void
  onDelete?: (item: T) => void
  startContent?: (item: T) => ReactNode
}

export default function ComponentList<T extends object>({
  listState,
  title,
  content,
  onDelete,
  startContent,
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
          trigger: 'flex justify-between py-1',
          titleWrapper: 'hidden',
          startContent: 'grow',
          indicator: 'text-neutral-foreground',
          base: 'border border-neutral-border shadow-none px-4',
        }}
        className="px-0"
      >
        {listState.data.map((item) => (
          <AccordionItem
            key={listState.getId(item)}
            startContent={
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {startContent?.(item)}
                  <div className="max-w-xl overflow-hidden text-ellipsis text-nowrap">
                    {getDynamicObjectValue(item, title) || (
                      <span className="text-warning">Untitled</span>
                    )}
                  </div>
                </div>
                <IconButton
                  icon={faTrash}
                  onPress={() =>
                    onDelete
                      ? onDelete?.(item)
                      : listState.removeDataEntry(item)
                  }
                />
              </div>
            }
          >
            {content(item)}
          </AccordionItem>
        ))}
      </Accordion>
      <Button
        onPress={() => {
          const key = listState.addDataEntry()
          // expand new item
          if (key) {
            setExpandedKeys(new Set([...expandedKeys, key]))
          }
        }}
        variant="bordered"
        className="border-dashed text-neutral-foreground"
      >
        <FontAwesomeIcon icon={faAdd} />
        Add New Item
      </Button>
    </div>
  )
}
