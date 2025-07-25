import { TDocumentInformation } from '@/routes/document-information/types/tDocumentInformation'
import { TProductTreeBranch } from '@/routes/products/types/tProductTreeBranch'
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
  const productDescription = config?.exportTexts?.productDescription ?? {
    en: 'Product description for',
    de: 'Produktbeschreibung für',
  }
  const documentInformation: TDocumentInformation =
    documentStore.documentInformation
  const notes = documentInformation.notes.map(parseNote)

  const productNotes = extractAllProducts(Object.values(documentStore.products))
    ?.filter((p) => p.description.length)
    .map((product) => {
      const title =
        documentInformation.lang === 'en'
          ? `${productDescription.en} ${product.name}`
          : `${productDescription.de} ${product.name}`

      return {
        category: 'description',
        text: product.description || '',
        title: title,
      }
    })

  return [...notes, ...productNotes] as TParsedNote[]
}
