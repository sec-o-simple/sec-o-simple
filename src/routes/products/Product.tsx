import WizardStep from '@/components/WizardStep'
import { useParams } from 'react-router'
import SubMenuHeader from './components/SubMenuHeader'
import { useProductTreeBranch } from '@/utils/useProductTreeBranch'
import InfoCard from './components/InfoCard'

export default function Product() {
  const { productId } = useParams()
  const { findProductTreeBranch } = useProductTreeBranch()

  const product = findProductTreeBranch(productId ?? '')
  if (!product) {
    return <>404 not found</>
  }

  return (
    <WizardStep noContentWrapper={true}>
      {/* TODO: add action */}
      <SubMenuHeader
        title={'Product ' + product.name}
        backLink={'/product-management'}
        actionTitle="Add Version"
      />
      <div className="font-bold">Versions ({product.subBranches.length})</div>
      {product.subBranches.map((version) => (
        <InfoCard title={version.name} key={version.id} variant="boxed">
          <div>{version.description}</div>
        </InfoCard>
      ))}
    </WizardStep>
  )
}
