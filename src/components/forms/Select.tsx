import { Select as HeroUISelect, SelectProps } from '@heroui/select'

export default function Select(props: SelectProps) {
  const { placeholder, labelPlacement, ...rest } = props
  return (
    <HeroUISelect
      labelPlacement={labelPlacement ?? 'outside'}
      placeholder={placeholder ?? ' '}
      variant="bordered"
      classNames={{
        trigger: 'border-1 border-[#E2E8F0] shadow-none',
      }}
      {...rest}
    />
  )
}
