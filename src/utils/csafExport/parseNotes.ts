import { TDocumentInformation } from '@/routes/document-information/types/tDocumentInformation'
import { TProductTreeBranch } from '@/routes/products/types/tProductTreeBranch'
import i18next from 'i18next'
import { TConfig } from '../useConfigStore'
import { TDocumentStore } from '../useDocumentStore'
import { parseNote, TParsedNote } from './parseNote'

function extractAllProducts(
  products: TProductTreeBranch[],
): TProductTreeBranch[] {
  return products?.flatMap((vendor) => {
    return vendor.subBranches?.flatMap((product) => product)
  })
}

export function parseNotes(
  documentStore: TDocumentStore,
  config?: TConfig,
): TParsedNote[] {
  const documentInformation: TDocumentInformation =
    documentStore.documentInformation
  const notes = documentInformation.notes.map(parseNote)

  const productNotes = extractAllProducts(Object.values(documentStore.products))
    ?.filter((p) => p.description.length)
    .map((product) => {
      const language = documentInformation.lang
      const prefix =
        config?.exportTexts?.productDescription?.[language] ??
        i18next.t('export.productDescriptionPrefix', { lng: language })

      const title = `${prefix} ${product.name}`

      return {
        category: 'description',
        text: product.description,
        title: title,
      }
    })

  return [...notes, ...productNotes] as TParsedNote[]
}
