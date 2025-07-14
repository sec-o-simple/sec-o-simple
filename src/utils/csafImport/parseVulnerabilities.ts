import { TProductTreeBranch } from '@/routes/products/types/tProductTreeBranch'
import {
  TRemediation,
  getDefaultRemediation,
} from '@/routes/vulnerabilities/types/tRemediation'
import {
  TCwe,
  TVulnerability,
  getDefaultVulnerability,
} from '@/routes/vulnerabilities/types/tVulnerability'
import {
  TVulnerabilityScore,
  getDefaultVulnerabilityScore,
} from '@/routes/vulnerabilities/types/tVulnerabilityScore'
import { TCSAFDocument } from '../csafExport/csafExport'
import { TParsedNote } from '../csafExport/parseNote'
import { IdGenerator } from './idGenerator'
import { parseNote } from './parseNote'
import { parseVulnerabilityProducts } from './parseVulnerabilityProducts'

export function parseVulnerabilities(
  csafDocument: TCSAFDocument,
  idGenerator: IdGenerator,
  ptbs: TProductTreeBranch[],
): TVulnerability[] {
  return (
    csafDocument.vulnerabilities?.map((vulnerability) => {
      const defaultVulnerability = getDefaultVulnerability()
      return {
        id: defaultVulnerability.id,
        cve: vulnerability.cve ?? defaultVulnerability.cve,
        cwe: vulnerability.cwe as TCwe | undefined,
        title: vulnerability.title ?? defaultVulnerability.title,
        notes: vulnerability.notes?.map((note) =>
          parseNote(note as TParsedNote),
        ),
        products: parseVulnerabilityProducts(
          vulnerability.product_status,
          idGenerator,
          ptbs,
        ),
        remediations: vulnerability.remediations?.map((remediation) => {
          const defaultRemediation = getDefaultRemediation()
          return {
            id: defaultRemediation.id,
            category: remediation.category ?? defaultRemediation.category,
            date: remediation.date ?? defaultRemediation.date,
            details: remediation.details ?? defaultRemediation.details,
            url: remediation.url ?? defaultRemediation.url,
            productIds: remediation.product_ids.map((id) =>
              idGenerator.getId(id),
            ),
          } as TRemediation
        }),
        scores: vulnerability.scores?.map((score) => {
          const defaultScore = getDefaultVulnerabilityScore()

          const cvssVersion =
            Object.keys(score).find((x) => x.startsWith('cvss_')) ?? 'cvss_v3'

          const cvssInfos = (score as { [key: string]: unknown })[
            cvssVersion
          ] as
            | undefined
            | {
                version: string
                vectorString: string
              }

          return {
            id: defaultScore.id,
            productIds: score.products?.map((id) => idGenerator.getId(id)),
            cvssVersion: cvssInfos?.version ?? defaultScore.cvssVersion,
            vectorString: cvssInfos?.vectorString ?? defaultScore.vectorString,
          } as TVulnerabilityScore
        }),
      } as TVulnerability
    }) || []
  )
}
