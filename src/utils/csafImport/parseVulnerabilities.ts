import {
  TRemediation,
  useRemediationGenerator,
} from '@/routes/vulnerabilities/types/tRemediation'
import {
  TVulnerability,
  getDefaultVulnerability,
} from '@/routes/vulnerabilities/types/tVulnerability'
import { referenceCategories } from '@/routes/document-information/types/tDocumentReference'
import { TVulnerabilityProduct } from '@/routes/vulnerabilities/types/tVulnerabilityProduct'
import {
  TVulnerabilityScore,
  getDefaultVulnerabilityScore,
} from '@/routes/vulnerabilities/types/tVulnerabilityScore'
import { TCSAFDocument } from '../csafExport/csafExport'
import { TParsedNote } from '../csafExport/parseNote'
import { parseNote } from './parseNote'
import { parseVulnerabilityProducts } from './parseVulnerabilityProducts'
import { uid } from 'uid'

export function parseVulnerabilities(
  csafDocument: TCSAFDocument,
  vulnerabilityProductGenerator: () => TVulnerabilityProduct,
  remediationGenerator: ReturnType<typeof useRemediationGenerator>,
): TVulnerability[] {
  return (
    csafDocument.vulnerabilities?.map((vulnerability) => {
      const defaultVulnerability = getDefaultVulnerability()
      const cweFromCwes = vulnerability.cwes?.[0]

      const references = vulnerability.references?.map((reference) => ({
        id: uid(),
        summary: reference.summary,
        url: reference.url,
        category: referenceCategories.includes(
          reference.category as (typeof referenceCategories)[number],
        )
          ? (reference.category as (typeof referenceCategories)[number])
          : 'external',
      }))

      return {
        id: defaultVulnerability.id,
        cve: vulnerability.cve ?? defaultVulnerability.cve,
        cwe: cweFromCwes
          ? { id: cweFromCwes.id, name: cweFromCwes.name }
          : undefined,
        title: vulnerability.title ?? defaultVulnerability.title,
        notes: vulnerability.notes?.map((note) =>
          parseNote(note as TParsedNote),
        ),
        ...(references ? { references } : {}),
        products: parseVulnerabilityProducts(
          vulnerability.product_status,
          vulnerabilityProductGenerator,
        ),
        flags:
          vulnerability.flags?.map((flag) => ({
            id: uid(),
            label: flag.label,
            productIds: flag.product_ids,
          })) || [],
        remediations: vulnerability.remediations?.map((remediation) => {
          const defaultRemediation = remediationGenerator

          return {
            id: defaultRemediation.id,
            category: remediation.category ?? defaultRemediation.category,
            date: remediation.date ?? defaultRemediation.date,
            details: remediation.details ?? defaultRemediation.details,
            url: remediation.url ?? defaultRemediation.url,
            productIds: remediation.product_ids,
            applyAllKnownAffectedProducts: false,
          } as TRemediation
        }),
        scores: vulnerability.metrics?.map((score) => {
          const defaultScore = getDefaultVulnerabilityScore()

          const cvssInfos = score.content?.cvss_v4 || score.content?.cvss_v3

          return {
            id: defaultScore.id,
            productIds: score.products || [],
            applyAllKnownAffectedProducts: false,
            cvssVersion: cvssInfos?.version ?? defaultScore.cvssVersion,
            vectorString: cvssInfos?.vectorString ?? defaultScore.vectorString,
          } as TVulnerabilityScore
        }),
      } as TVulnerability
    }) || []
  )
}
