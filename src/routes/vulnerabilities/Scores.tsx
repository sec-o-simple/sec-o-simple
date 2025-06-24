import { TVulnerability } from './types/tVulnerability'
import ComponentList from '@/components/forms/ComponentList'
import { useListState } from '@/utils/useListState'
import {
  TVulnerabilityScore,
  getDefaultVulnerabilityScore,
} from './types/tVulnerabilityScore'
import VSplit from '@/components/forms/VSplit'
import { Input } from '@/components/forms/Input'
import { checkReadOnly, getPlaceholder } from '@/utils/template'
import { useEffect } from 'react'
import ProductsTagList from './components/ProductsTagList'
import { calculateBaseScore, calculateQualScore } from 'cvss4'

export default function Scores({
  vulnerability,
  vulnerabilityIndex,
  onChange,
  isTouched = false,
}: {
  vulnerability: TVulnerability
  vulnerabilityIndex: number
  onChange: (vulnerability: TVulnerability) => void
  isTouched?: boolean
}) {
  const scoresListState = useListState<TVulnerabilityScore>({
    initialData: vulnerability.scores,
    generator: getDefaultVulnerabilityScore,
  })

  useEffect(
    () => onChange({ ...vulnerability, scores: scoresListState.data }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [scoresListState.data],
  )

  return (
    <ComponentList
      listState={scoresListState}
      title={(score) => `CVSS ${score.cvssVersion} score`}
      itemLabel="Score"
      content={(score, index) => (
        <ScoreForm
          score={score}
          csafPath={`/vulnerabilities/${vulnerabilityIndex}/scores/${index}`}
          isTouched={isTouched}
          onChange={scoresListState.updateDataEntry}
        />
      )}
    />
  )
}

function ScoreForm({
  score,
  csafPath,
  onChange,
  isTouched = false,
}: {
  score: TVulnerabilityScore
  csafPath: string
  onChange: (note: TVulnerabilityScore) => void
  isTouched?: boolean
}) {
  const baseScore = calculateBaseScore(score.vectorString)

  return (
    <VSplit>
      <Input
        label="CVSS Vector String"
        isTouched={isTouched}
        csafPath={`${csafPath}/cvss_v3/vectorString`}
        value={score.vectorString}
        onValueChange={(newValue) =>
          onChange({ ...score, vectorString: newValue })
        }
        autoFocus={true}
        isDisabled={checkReadOnly(score, 'vectorString')}
        placeholder={getPlaceholder(score, 'vectorString')}
      />
      {/* baseScore */}
      <Input
        label="Base Score"
        isTouched={isTouched}
        value={`${baseScore || ''}`}
        description="Base score is calculated from vector string"
        isReadOnly={true} // Base score is calculated from vector string
      />
      {/* severity */}
      <Input
        label="Base Severity"
        isTouched={isTouched}
        value={
          baseScore
            ? calculateQualScore(baseScore)
            : ''
        }
        description="Base severity is calculated from vector string"
        isReadOnly={true}
      />
      <ProductsTagList
        products={score.productIds}
        onChange={(productIds) => onChange({ ...score, productIds })}
      />
    </VSplit>
  )
}
