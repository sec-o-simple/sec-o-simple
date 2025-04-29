import { useFieldValidation } from '@/utils/useFieldValidation'
import { Select as HeroUISelect, SelectProps } from '@heroui/select'

export default function Select(
  props: SelectProps & { csafPath?: string; isTouched?: boolean },
) {
  const {
    placeholder,
    labelPlacement,
    variant,
    csafPath,
    isTouched,
    onChange,
    ...rest
  } = props
  const validation = useFieldValidation(csafPath)

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (csafPath) {
      // Only after touching the field, we want to show errors.
      validation.markFieldAsTouched(csafPath)
    }
    onChange?.(e)
  }

  return (
    <HeroUISelect
      labelPlacement={labelPlacement ?? 'outside'}
      placeholder={placeholder ?? ' '}
      variant={variant ?? 'bordered'}
      classNames={{
        trigger: 'border-1 shadow-none',
      }}
      onChange={handleChange}
      errorMessage={validation.errorMessages.map((m) => m.message).join(', ')}
      isInvalid={validation.hasErrors && (isTouched || validation.isTouched)}
      {...rest}
    />
  )
}
