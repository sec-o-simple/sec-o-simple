import { useEffect } from "react"
import { useFieldValidation } from "./useFieldValidation"
import useValidationStore from "./useValidationStore"

/**
 * Custom hook to manage validation for a list of items.
 * It marks the field as touched when the list is changed or when it is not empty.
 */
export function useListValidation(listPath: string, data: any[]) {
    const listValidation = useFieldValidation(listPath)
    const markFieldAsTouched = useValidationStore(
        (state) => state.markFieldAsTouched,
    )

    useEffect(() => {
        // When changing the list once or if it's not empty,
        // mark the field as touched so we can show an error
        if (data.length > 0) {
            markFieldAsTouched(listPath)
        }
    }, [data, markFieldAsTouched, listPath])

    return listValidation
}