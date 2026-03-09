import { useDebounceInput } from '@/utils/useDebounceInput'
import { useFieldValidation } from '@/utils/validation/useFieldValidation'
import {
  Autocomplete as HeroUIAutocomplete,
  AutocompleteProps,
} from '@heroui/react'

type AutocompleteInputChangeEvent = React.ChangeEvent<HTMLInputElement>

type Props = Omit<AutocompleteProps, 'onChange'> & {
  csafPath?: string
  isTouched?: boolean
  onChange?: (e: AutocompleteInputChangeEvent) => void
}

export function Autocomplete(props: Props) {
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
      if (!e || typeof e !== 'object' || !('target' in e)) {
        return
      }

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
