import ComponentList from '@/components/forms/ComponentList'
import { Input } from '@/components/forms/Input'
import VSplit from '@/components/forms/VSplit'
import StatusIndicator from '@/components/StatusIndicator'
import { checkReadOnly, getPlaceholder } from '@/utils/template'
import { useListState } from '@/utils/useListState'
import { useProductTreeBranch } from '@/utils/useProductTreeBranch'
import { useFieldValidation } from '@/utils/validation/useFieldValidation'
import { useListValidation } from '@/utils/validation/useListValidation'
import { usePrefixValidation } from '@/utils/validation/usePrefixValidation'
import { Alert } from '@heroui/react'
import { calculateBaseScore, calculateQualScore } from 'cvss4'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import ProductsTagList from './components/ProductsTagList'
import { TVulnerability } from './types/tVulnerability'
import {
  TVulnerabilityScore,
  getDefaultVulnerabilityScore,
} from './types/tVulnerabilityScore'

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
  const { t } = useTranslation()
  const scoresListState = useListState<TVulnerabilityScore>({
    initialData: vulnerability.scores,
    generator: getDefaultVulnerabilityScore,
  })

  useEffect(
    () => onChange({ ...vulnerability, scores: scoresListState.data }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [scoresListState.data],
  )

  const listValidation = useListValidation(
    `/vulnerabilities/${vulnerabilityIndex}/scores`,
    scoresListState.data,
  )

  return (
    <>
      {listValidation.hasErrors && (
        <Alert color="danger" className="mb-4">
          {listValidation.errorMessages.map((m) => (
            <p key={m.path}>{m.message}</p>
          ))}
        </Alert>
      )}
      <ComponentList
        listState={scoresListState}
        title={(score) => `CVSS ${score.cvssVersion} Score`}
        itemLabel={t('vulnerabilities.score.title')}
        itemBgColor="bg-zinc-50"
        startContent={({ index }) => (
          <ScoreStartContent
            csafPath={`/vulnerabilities/${vulnerabilityIndex}/scores/${index}`}
          />
        )}
        content={(score, index) => (
          <ScoreForm
            score={score}
            csafPath={`/vulnerabilities/${vulnerabilityIndex}/scores/${index}`}
            isTouched={isTouched}
            onChange={scoresListState.updateDataEntry}
          />
        )}
      />
    </>
  )
}

function ScoreStartContent({ csafPath }: { csafPath: string }) {
  const { hasErrors } = usePrefixValidation(csafPath)

  return <StatusIndicator hasErrors={hasErrors} hasVisited={true} />
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
  const { getSelectablePTBs } = useProductTreeBranch()
  const ptbs = getSelectablePTBs()

  const { t } = useTranslation()
  let baseScore = ''
  let baseSeverity = ''

  try {
    let scoreFloat = calculateBaseScore(score.vectorString)

    baseScore = `${scoreFloat}`
    baseSeverity = calculateQualScore(scoreFloat)
  } catch {
    // If the score is invalid, we leave baseScore and baseSeverity as defaults
    // as there will be errors already in the vectorString
  }

  const fieldValidation = useFieldValidation(`${csafPath}/products`)

  return (
    <VSplit>
      <Input
        label="CVSS Vector String"
        isRequired
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
        label={t('vulnerabilities.score.baseScore')}
        isTouched={isTouched}
        value={baseScore}
        description={t('vulnerabilities.score.baseScoreDescription')}
        isReadOnly={true} // Base score is calculated from vector string
      />
      {/* severity */}
      <Input
        label={t('vulnerabilities.score.baseSeverity')}
        isTouched={isTouched}
        value={baseSeverity}
        description={t('vulnerabilities.score.baseSeverityDescription')}
        isReadOnly={true}
      />
      <ProductsTagList
        isRequired
        error={
          fieldValidation.hasErrors
            ? fieldValidation.errorMessages[0].message
            : ''
        }
        selected={score.productIds}
        products={ptbs}
        onChange={(productIds) => onChange({ ...score, productIds })}
      />
    </VSplit>
  )
}
