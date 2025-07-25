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
import { Alert, Chip } from '@heroui/react'
import { calculateBaseScore, calculateQualScore, parseVersion } from 'cvss4'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { TProductTreeBranch } from '../products/types/tProductTreeBranch'
import ProductsTagList from './components/ProductsTagList'
import { TVulnerability } from './types/tVulnerability'
import {
  TCvssVersion,
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
  // The scores are sorted by CVSS version, so we can use the index to find the correct score
  const scoresListState = useListState<TVulnerabilityScore>({
    initialData: vulnerability.scores?.sort((a, b) =>
      (a.cvssVersion || '4.0').localeCompare(b.cvssVersion || '4.0'),
    ),
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

  const { getSelectablePTBs } = useProductTreeBranch()
  const ptbs = getSelectablePTBs()
  const knownAffectedOrInvestigationProducts = vulnerability.products.filter(
    (p) => p.status === 'known_affected' || p.status === 'under_investigation',
  )

  const getV3Index = (score: TVulnerabilityScore) => {
    return scoresListState.data
      .filter(
        (s) =>
          s.cvssVersion === '3.0' ||
          s.cvssVersion === '3.1' ||
          s.cvssVersion === '4.0',
      )
      .indexOf(score)
  }

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
        title={() => t('vulnerabilities.score.title')}
        itemLabel={t('vulnerabilities.score.title')}
        itemBgColor="bg-zinc-50"
        startContent={({ index, item }) => (
          <ScoreStartContent
            item={item}
            csafPath={`/vulnerabilities/${vulnerabilityIndex}/scores/${index}`}
          />
        )}
        content={(score) => (
          <ScoreForm
            score={score}
            csafPath={`/vulnerabilities/${vulnerabilityIndex}/scores/${getV3Index(
              score,
            )}`}
            isTouched={isTouched}
            products={ptbs.filter(
              (p) =>
                knownAffectedOrInvestigationProducts.some((product) =>
                  product.versions.some((v) => v === p.id),
                ),
              ptbs,
            )}
            onChange={scoresListState.updateDataEntry}
          />
        )}
      />
    </>
  )
}

function ScoreStartContent({
  item,
  csafPath,
}: {
  item: TVulnerabilityScore
  csafPath: string
}) {
  const { hasErrors } = usePrefixValidation(csafPath)

  return (
    <>
      <StatusIndicator
        hasErrors={hasErrors || !item.cvssVersion}
        hasVisited={true}
      />
      {item.cvssVersion && (
        <Chip color="primary" variant="flat" radius="md" size="lg">
          Version: {item.cvssVersion}
        </Chip>
      )}
    </>
  )
}

function ScoreForm({
  score,
  csafPath,
  onChange,
  products: ptbs,
  isTouched = false,
}: {
  score: TVulnerabilityScore
  csafPath: string
  onChange: (note: TVulnerabilityScore) => void
  products?: TProductTreeBranch[]
  isTouched?: boolean
}) {
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

  const handleChange = (newValue: string) => {
    try {
      const version = parseVersion(newValue)
      if (!version || version === '3.0') {
        throw new Error('Invalid CVSS vector string')
      }
      const baseScore = calculateBaseScore(newValue)
      const baseSeverity = calculateQualScore(baseScore)
      if (!baseScore || !baseSeverity) {
        throw new Error('Invalid CVSS vector string')
      }
      onChange({
        ...score,
        vectorString: newValue,
        cvssVersion: version as TCvssVersion,
      })
    } catch (e) {
      console.error('Invalid CVSS vector string:', e)
      onChange({ ...score, vectorString: newValue, cvssVersion: null })
    }
  }

  const cvssVectorStringPath = score.cvssVersion
    ? {
        '3.0': `${csafPath}/cvss_v3/vectorString`,
        '3.1': `${csafPath}/cvss_v3/vectorString`,
        '4.0': `${csafPath}/cvss_v4/vectorString`,
      }[score.cvssVersion]
    : undefined

  return (
    <VSplit>
      <Input
        label="CVSS Vector String"
        description={t('vulnerabilities.score.vectorStringDescription')}
        isRequired
        isTouched={isTouched}
        csafPath={cvssVectorStringPath}
        isInvalid={!cvssVectorStringPath || !score.vectorString.length}
        errorMessage={
          !score.vectorString.length
            ? t('vulnerabilities.score.vectorStringEmptyError')
            : !cvssVectorStringPath
              ? t('vulnerabilities.score.vectorStringInvalidError')
              : ''
        }
        value={score.vectorString}
        onValueChange={handleChange}
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
      {score.cvssVersion !== '4.0' && (
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
      )}
    </VSplit>
  )
}
