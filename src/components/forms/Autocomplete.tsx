import { useDebounceInput } from '@/utils/useDebounceInput'
import { useFieldValidation } from '@/utils/useFieldValidation'
import {
  Autocomplete as HeroUIAutocomplete,
  AutocompleteProps,
} from '@heroui/react'

export function Autocomplete(
  props: AutocompleteProps & { csafPath?: string; isTouched?: boolean },
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

  const { handleChange } = useDebounceInput({
    onChange: (e) => {
      onValueChange?.(e.target.value)
      onChange?.(e)
    },
    onBlur,
    value: propValue as string,
  })

  return (
    <HeroUIAutocomplete
      labelPlacement={labelPlacement ?? 'outside'}
      placeholder={placeholder ?? ' '}
      variant={variant ?? 'bordered'}
      inputProps={{
        classNames: {
          inputWrapper: 'border-1 shadow-none',
        },
      }}
      onChange={handleChange}
      errorMessage={validation.errorMessages.map((m) => m.message).join(', ')}
      isInvalid={validation.hasErrors && (isTouched || validation.isTouched)}
      {...rest}
    />
  )
}
