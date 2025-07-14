import { useFieldValidation } from '@/utils/validation/useFieldValidation'
import {
  DatePicker as HeroUIDatePicker,
  DatePickerProps as HeroUIDatePickerProps,
} from '@heroui/date-picker'
import { getLocalTimeZone, parseAbsolute } from '@internationalized/date'

export type DatePickerProps = Omit<
  HeroUIDatePickerProps,
  'value' | 'onChange'
> & {
  csafPath?: string
  isTouched?: boolean
  value?: string
  onChange?: (date: string) => void
}

export default function DatePicker({
  labelPlacement,
  variant,
  csafPath,
  isTouched,
  onBlur,
  onChange,
  value,
  ...pickerProps
}: DatePickerProps) {
  const validation = useFieldValidation(csafPath)

  return (
    <HeroUIDatePicker
      variant={variant ?? 'bordered'}
      labelPlacement={labelPlacement ?? 'outside'}
      classNames={{
        inputWrapper: 'border-1 shadow-none',
      }}
      errorMessage={validation.errorMessages.map((m) => m.message).join(', ')}
      isInvalid={
        validation.hasErrors &&
        (isTouched || validation.isTouched || !!value?.length)
      }
      value={value ? parseAbsolute(value, getLocalTimeZone()) : undefined}
      onBlur={(e) => {
        if (csafPath) {
          validation.markFieldAsTouched(csafPath)
        }
        onBlur?.(e)
      }}
      onChange={(dateValue) =>
        onChange?.(dateValue?.toDate(getLocalTimeZone()).toISOString() ?? '')
      }
      {...pickerProps}
    />
  )
}
