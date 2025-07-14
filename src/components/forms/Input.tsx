import { useDebounceInput } from '@/utils/useDebounceInput'
import { useFieldValidation } from '@/utils/validation/useFieldValidation'
import {
  Input as HeroUIInput,
  Textarea as HeroUITextarea,
  InputProps,
  TextAreaProps,
} from '@heroui/input'

export function Input(
  props: InputProps & { csafPath?: string; isTouched?: boolean },
) {
  const {
    placeholder,
    labelPlacement,
    variant,
    csafPath,
    isTouched,
    onBlur,
    onChange,
    onValueChange,
    isInvalid,
    value: propValue,
    ...rest
  } = props
  const validation = useFieldValidation(csafPath)

  const {
    value: debouncedValue,
    isDebouncing,
    handleBlur,
    handleChange,
  } = useDebounceInput({
    onChange: (e) => {
      onValueChange?.(e.target.value)
      onChange?.(e)
    },
    onBlur,
    value: propValue,
  })

  return (
    <HeroUIInput
      variant={variant ?? 'bordered'}
      labelPlacement={labelPlacement ?? 'outside'}
      placeholder={placeholder ?? ' '}
      classNames={{
        inputWrapper: 'border-1 shadow-none',
      }}
      value={debouncedValue}
      errorMessage={validation.errorMessages.map((m) => m.message).join(', ')}
      isInvalid={
        isInvalid ||
        (!isDebouncing &&
          validation.hasErrors &&
          (isTouched || validation.isTouched || !!propValue?.length))
      }
      onBlur={(e) => {
        if (csafPath) {
          validation.markFieldAsTouched(csafPath)
        }
        handleBlur(e)
      }}
      onChange={handleChange}
      {...rest}
    />
  )
}

export function Textarea(
  props: TextAreaProps & { csafPath?: string; isTouched?: boolean },
) {
  const {
    placeholder,
    labelPlacement,
    variant,
    csafPath,
    isTouched,
    onBlur,
    onChange,
    onValueChange,
    value: propValue,
    ...rest
  } = props
  const validation = useFieldValidation(csafPath)
  const {
    value: debouncedValue,
    isDebouncing,
    handleBlur,
    handleChange,
  } = useDebounceInput({
    onChange: (e) => {
      onValueChange?.(e.target.value)
      onChange?.(e)
    },
    onBlur,
    value: propValue,
  })

  return (
    <HeroUITextarea
      variant={variant ?? 'bordered'}
      labelPlacement={labelPlacement ?? 'outside'}
      placeholder={placeholder ?? ' '}
      classNames={{
        inputWrapper: 'border-1 shadow-none',
      }}
      value={debouncedValue}
      errorMessage={validation.errorMessages.map((m) => m.message).join(', ')}
      isInvalid={
        !isDebouncing &&
        validation.hasErrors &&
        (validation.isTouched || isTouched)
      }
      onBlur={(e) => {
        if (csafPath) {
          validation.markFieldAsTouched(csafPath)
        }
        handleBlur(e)
      }}
      onChange={handleChange}
      {...rest}
    />
  )
}
