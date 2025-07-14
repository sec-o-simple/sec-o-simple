import { TVulnerabilityScore } from '@/routes/vulnerabilities/types/tVulnerabilityScore'
import { calculateBaseScore, calculateQualScore } from 'cvss4'
import { PidGenerator } from './pidGenerator'

export default function parseScore(
  score: TVulnerabilityScore,
  pidGenerator: PidGenerator,
) {
  let baseScore = 0
  let baseSeverity = ''

  try {
    baseScore = calculateBaseScore(score.vectorString)
    baseSeverity = calculateQualScore(baseScore).toUpperCase()
  } catch {
    // If the score is invalid, we leave baseScore and baseSeverity as defaults
    // as there will be errors already in the vectorString
  }

  const key = score.cvssVersion === '3.1' ? 'cvss_v3' : 'cvss_v4'

  return {
    [key]: {
      version: score.cvssVersion,
      vectorString: score.vectorString,
      baseScore,
      baseSeverity,
    },
    products: score.productIds.map((id) => pidGenerator.getPid(id)),
  }
}
