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
      <ProductsTagList
        products={score.productIds}
        onChange={(productIds) => onChange({ ...score, productIds })}
      />
    </VSplit>
  )
}
