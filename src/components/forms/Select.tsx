import { Select as HeroUISelect, SelectProps } from '@heroui/select'

export default function Select(props: SelectProps) {
  const { placeholder, labelPlacement, variant, ...rest } = props
  return (
    <HeroUISelect
      labelPlacement={labelPlacement ?? 'outside'}
      placeholder={placeholder ?? ' '}
      variant={variant ?? 'bordered'}
      classNames={{
        trigger: 'border-1 shadow-none',
      }}
      {...rest}
    />
  )
}
