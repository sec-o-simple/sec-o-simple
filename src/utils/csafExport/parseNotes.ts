import { TDocumentInformation } from '@/routes/document-information/types/tDocumentInformation'
import { TProductTreeBranch } from '@/routes/products/types/tProductTreeBranch'
import { TDocumentStore } from '../useDocumentStore'
import { parseNote, TParsedNote } from './parseNote'

function extractAllProducts(
  products: TProductTreeBranch[],
): TProductTreeBranch[] {
  return products?.flatMap((vendor) => {
    return vendor.subBranches?.flatMap((product) => product)
  })
}

export function parseNotes(documentStore: TDocumentStore): TParsedNote[] {
  const documentInformation: TDocumentInformation =
    documentStore.documentInformation
  const notes = documentInformation.notes.map(parseNote)

  const productNotes = extractAllProducts(Object.values(documentStore.products))
    ?.filter((p) => p.description.length)
    .map((product) => ({
      category: 'description',
      text: product.description || '',
      title:
        documentInformation.lang === 'de'
          ? `Produktbeschreibung für ${product.name}`
          : `Product description for ${product.name}`,
    }))

  return [...notes, ...productNotes] as TParsedNote[]
}
