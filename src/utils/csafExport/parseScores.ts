import { TVulnerabilityScore } from '@/routes/vulnerabilities/types/tVulnerabilityScore'
import { calculateBaseScore, calculateQualScore } from 'cvss4'

export default function parseScores(
  scores: TVulnerabilityScore[],
  knownAffectedProductIds: string[] = [],
) {
  const validScores = scores?.filter(
    (score) =>
      score.cvssVersion === '3.0' ||
      score.cvssVersion === '3.1' ||
      score.cvssVersion === '4.0',
  )

  return validScores?.length
    ? validScores.map((score) => {
        let baseScore = 0
        let baseSeverity = ''

        try {
          baseScore = calculateBaseScore(score.vectorString)
          baseSeverity = calculateQualScore(baseScore).toUpperCase()
        } catch {
          // If the score is invalid, we leave baseScore and baseSeverity as defaults
          // as there will be errors already in the vectorString
        }

        const applyAllKnownAffectedProducts =
          score.applyAllKnownAffectedProducts ?? score.productIds.length === 0
        const products = applyAllKnownAffectedProducts
          ? knownAffectedProductIds
          : score.productIds

        const key = {
          '3.0': 'cvss_v3',
          '3.1': 'cvss_v3',
          '4.0': 'cvss_v4',
        }[score.cvssVersion as '3.0' | '3.1' | '4.0']

        return {
          content: {
            [key]: {
              version: score.cvssVersion,
              vectorString: score.vectorString,
              baseScore,
              baseSeverity,
            },
          },
          products: [...new Set(products)],
        }
      })
    : undefined
}
