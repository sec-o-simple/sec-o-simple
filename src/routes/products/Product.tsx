import WizardStep from '@/components/WizardStep'
import { useNavigate, useParams } from 'react-router'
import SubMenuHeader from './components/SubMenuHeader'
import { useProductTreeBranch } from '@/utils/useProductTreeBranch'
import InfoCard from './components/InfoCard'
import { Modal, useDisclosure } from '@heroui/modal'
import { PTBEditForm } from './components/PTBEditForm'
import {
  TProductTreeBranch,
  getDefaultProductTreeBranch,
  getPTBName,
} from './types/tProductTreeBranch'
import { useState } from 'react'
import IconButton from '@/components/forms/IconButton'
import { faLink } from '@fortawesome/free-solid-svg-icons'

export default function Product() {
  const { productId } = useParams()
  const { findProductTreeBranch, updatePTB, deletePTB } = useProductTreeBranch()
  const navigate = useNavigate()

  // modal variables
  const { isOpen, onOpen, onOpenChange } = useDisclosure()
  const [editingPTB, setEditingPTB] = useState<TProductTreeBranch | undefined>()

  const product = findProductTreeBranch(productId ?? '')
  if (!product) {
    return <>404 not found</>
  }

  return (
    <WizardStep noContentWrapper={true}>
      <SubMenuHeader
        title={'Product ' + getPTBName(product)}
        backLink={'/product-management'}
        actionTitle="Add Version"
        onAction={() => {
          // add new version
          const newVersion = getDefaultProductTreeBranch('product_version')
          updatePTB({
            ...product,
            subBranches: [...product.subBranches, newVersion],
          })
          // open edit form for newly added version
          setEditingPTB(newVersion)
          onOpen()
        }}
      />
      <Modal size="xl" isOpen={isOpen} onOpenChange={onOpenChange}>
        <PTBEditForm ptb={editingPTB} onSave={(ptb) => updatePTB(ptb)} />
      </Modal>
      <div className="font-bold">Versions ({product.subBranches.length})</div>
      {product.subBranches.map((version) => (
        <InfoCard
          title={getPTBName(version)}
          linkTo={`/product-management/version/${version.id}`}
          key={version.id}
          variant="boxed"
          onEdit={() => {
            setEditingPTB(version)
            onOpen()
          }}
          onDelete={() => deletePTB(version.id)}
          endContent={
            <IconButton
              icon={faLink}
              tooltip="Manage Relationships"
              onPress={() =>
                navigate(`/product-management/version/${version.id}`)
              }
            />
          }
        >
          <div>{version.description}</div>
        </InfoCard>
      ))}
    </WizardStep>
  )
}
