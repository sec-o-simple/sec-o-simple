import {
  DynamicObjectValueKey,
  getDynamicObjectValue,
} from '@/utils/dynamicObjectValue'
import { checkDeletable, checkReadOnly } from '@/utils/template'
import { ListState } from '@/utils/useListState'
import { faTrash } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIconProps } from '@fortawesome/react-fontawesome'
import { Accordion, AccordionItem } from '@heroui/accordion'
import { cn, Selection } from '@heroui/react'
import { HTMLProps, ReactNode, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { twMerge } from 'tailwind-merge'
import AddItemButton from './AddItemButton'
import IconButton from './IconButton'

export type CustomAction<T> = {
  icon: FontAwesomeIconProps['icon']
  tooltip?: string
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
  onDelete?: (item: T) => void
  startContent?: React.ComponentType<{ item: T; index: number }>
  endContent?: (item: T) => ReactNode
  titleProps?: HTMLProps<HTMLDivElement>
  customActions?: CustomAction<T>[]
  itemBgColor?: string
  addEntry?: () => void
  renderTitlePrefix?: (item: T) => ReactNode
}

export default function ComponentList<T extends object>({
  listState,
  title,
  content,
  itemLabel = 'Item',
  onDelete,
  endContent,
  titleProps,
  customActions,
  itemBgColor,
  addEntry,
  ...props
}: ComponentListProps<T>) {
  const { t } = useTranslation()
  const [expandedKeys, setExpandedKeys] = useState<Selection>(
    new Set(listState.data.map((item) => listState.getId(item))),
  )

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
          base: 'border border-default-200 shadow-none px-4 py-2',
          content: 'py-2',
        }}
        className="px-0"
      >
        {listState.data.map((item, index) => {
          const data = content(item, index)

          return (
            <AccordionItem
              className={cn(itemBgColor)}
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
                          tooltip={action.tooltip}
                          onPress={() => action.onClick(item)}
                          isDisabled={
                            !action.notAffectedByReadonly && checkReadOnly(item)
                          }
                        />
                      ))}
                    <IconButton
                      icon={faTrash}
                      tooltip={t('common.delete', {
                        label: itemLabel,
                      })}
                      onPress={() =>
                        onDelete
                          ? onDelete?.(item)
                          : listState.removeDataEntry(item)
                      }
                      isDisabled={
                        checkDeletable(item) ? false : checkReadOnly(item)
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
          if (addEntry) {
            addEntry()
            return
          }

          const item = listState.addDataEntry()
          if (item) {
            setExpandedKeys(new Set([...expandedKeys, listState.getId(item)]))
          }
        }}
      />
    </div>
  )
}
