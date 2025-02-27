export type DynamicObjectValueKey<T, R = string> = keyof T | ((item: T) => R)

export function getDynamicObjectValue<T extends object, R = string>(
  obj: T,
  dynamicObjectValueKey: DynamicObjectValueKey<T, R>,
) {
  return typeof dynamicObjectValueKey === 'function'
    ? (dynamicObjectValueKey as (item: T) => R)(obj)
    : (obj[dynamicObjectValueKey] as R)
}
