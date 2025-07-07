import {
  DynamicObjectValueKey,
  getDynamicObjectValue,
} from '@/utils/dynamicObjectValue'
import { checkReadOnly } from '@/utils/template'
import { ListState } from '@/utils/useListState'
import { faTrash } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIconProps } from '@fortawesome/react-fontawesome'
import { Accordion, AccordionItem } from '@heroui/accordion'
import { Selection } from '@heroui/react'
import { HTMLProps, ReactNode, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { twMerge } from 'tailwind-merge'
import AddItemButton from './AddItemButton'
import IconButton from './IconButton'

export type CustomAction<T> = {
  icon: FontAwesomeIconProps['icon']
  onClick: (item: T) => void
  notAffectedByReadonly?: boolean
}

export type ComponentListProps<T> = {
  listState: ListState<T>
  title: DynamicObjectValueKey<T>
  /** Generator function for a ReactNode that will be shown when an item is expanded */
  content: (item: T, index: number) => ReactNode
  /** The label of an element in the list (defaults to Item) */
  itemLabel?: string
  isItemDeletable?: (item: T) => boolean
  onDelete?: (item: T) => void
  startContent?: React.ComponentType<{ item: T; index: number }>
  endContent?: (item: T) => ReactNode
  titleProps?: HTMLProps<HTMLDivElement>
  customActions?: CustomAction<T>[]
  renderTitlePrefix?: (item: T) => ReactNode
}

export default function ComponentList<T extends object>({
  listState,
  title,
  content,
  itemLabel = 'Item',
  isItemDeletable,
  onDelete,
  endContent,
  titleProps,
  customActions,
  ...props
}: ComponentListProps<T>) {
  const { t } = useTranslation()
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
        {listState.data.map((item, index) => {
          const data = content(item, index)

          return (
            <AccordionItem
              key={listState.getId(item)}
              startContent={
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {props.startContent && (
                      <props.startContent item={item} index={index} />
                    )}
                    <div
                      {...titleProps}
                      className={twMerge(
                        'max-w-xl overflow-hidden text-ellipsis text-nowrap',
                        titleProps?.className,
                      )}
                    >
                      {getDynamicObjectValue(item, title) || (
                        <span>
                          {t('common.untitled')} {itemLabel}
                        </span>
                      )}
                    </div>
                    {endContent?.(item)}
                  </div>
                  <div>
                    {customActions &&
                      customActions.map((action, i) => (
                        <IconButton
                          key={i}
                          icon={action.icon}
                          onPress={() => action.onClick(item)}
                          isDisabled={
                            !action.notAffectedByReadonly && checkReadOnly(item)
                          }
                        />
                      ))}
                    <IconButton
                      icon={faTrash}
                      onPress={() =>
                        onDelete
                          ? onDelete?.(item)
                          : listState.removeDataEntry(item)
                      }
                      isDisabled={
                        isItemDeletable
                          ? !isItemDeletable(item)
                          : checkReadOnly(item)
                      }
                    />
                  </div>
                </div>
              }
            >
              {Array.isArray(data) && data.length > 0 && data}
              {!Array.isArray(data) && data}
            </AccordionItem>
          )
        })}
      </Accordion>
      <AddItemButton
        label={t('common.add', {
          label: itemLabel,
        })}
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
