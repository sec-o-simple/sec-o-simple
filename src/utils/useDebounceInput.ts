import { useEffect, useRef, useState } from 'react'

type InputElement = HTMLInputElement | HTMLTextAreaElement
type InputChangeEvent<T> = React.ChangeEvent<T>
type InputBlurEvent<T> = React.FocusEvent<T>

interface UseDebounceInputOptions<T extends InputElement> {
  onChange?: (e: InputChangeEvent<T>) => void
  onBlur?: (e: InputBlurEvent<T>) => void
  value?: string
}

export function useDebounceInput<T extends InputElement>({
  onChange,
  onBlur,
  value: propValue,
}: UseDebounceInputOptions<T>) {
  const [isDebouncing, setIsDebouncing] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout>(null)
  const [debouncedValue, setDebouncedValue] = useState<string>(propValue ?? '')

  useEffect(() => {
    if (propValue !== undefined) {
      setDebouncedValue(propValue)
    }
  }, [propValue])

  const triggerOnChange = (value: string) => {
    const syntheticEvent = {
      target: { value },
      currentTarget: { value },
    } as InputChangeEvent<T>
    onChange?.(syntheticEvent)
  }

  const clearPendingTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }

  const handleBlur = (e: InputBlurEvent<T>) => {
    clearPendingTimeout()

    if (isDebouncing) {
      triggerOnChange(debouncedValue)
    }

    setIsDebouncing(false)
    onBlur?.(e)
  }

  const handleChange = (e: InputChangeEvent<T>) => {
    const value = e.target.value
    setDebouncedValue(value)
    setIsDebouncing(true)

    clearPendingTimeout()

    timeoutRef.current = setTimeout(() => {
      setIsDebouncing(false)
      triggerOnChange(value)
    }, 400)
  }

  useEffect(() => {
    return clearPendingTimeout
  }, [])

  return {
    value: debouncedValue,
    isDebouncing,
    handleBlur,
    handleChange,
  }
}
