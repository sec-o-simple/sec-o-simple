import { TVulnerabilityScore } from '@/routes/vulnerabilities/types/tVulnerabilityScore'
import { calculateBaseScore, calculateQualScore } from 'cvss4'

export default function parseScores(
  scores: TVulnerabilityScore[],
  knownAffectedProductIds: string[] = [],
) {
  const v3scores = scores?.filter(
    (score) => score.cvssVersion === '3.0' || score.cvssVersion === '3.1',
  )

  return v3scores?.length
    ? v3scores.map((score) => {
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

        return {
          cvss_v3: {
            version: score.cvssVersion,
            vectorString: score.vectorString,
            baseScore,
            baseSeverity,
          },
          products: [...new Set(products)],
        }
      })
    : undefined
}
