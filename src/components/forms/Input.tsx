import {
  Input as HeroUIInput,
  Textarea as HeroUITextarea,
  InputProps,
  TextAreaProps,
} from '@heroui/input'

export function Input(props: InputProps) {
  const { placeholder, labelPlacement, variant, ...rest } = props
  return (
    <HeroUIInput
      variant={variant ?? 'bordered'}
      labelPlacement={labelPlacement ?? 'outside'}
      placeholder={placeholder ?? ' '}
      classNames={{
        inputWrapper: 'border-1 border-[#E2E8F0] shadow-none',
      }}
      className="border-[#E2E8F0]"
      {...rest}
    />
  )
}

export function Textarea(props: TextAreaProps) {
  const { placeholder, labelPlacement, variant, ...rest } = props
  return (
    <HeroUITextarea
      variant={variant ?? 'bordered'}
      labelPlacement={labelPlacement ?? 'outside'}
      placeholder={placeholder ?? ' '}
      classNames={{
        inputWrapper: 'border-1 border-[#E2E8F0] shadow-none',
      }}
      className="border-[#E2E8F0]"
      {...rest}
    />
  )
}
