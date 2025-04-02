import { useCSAFExport } from '@/utils/csafExport/csafExport'
import {
  faAdd,
  faEye,
  faFileExport,
  faSave,
  faShieldHalved,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Button } from '@heroui/button'
import { Outlet, useNavigate } from 'react-router'

export default function TopBarLayout() {
  const navigate = useNavigate()
  const { exportCSAFDocument } = useCSAFExport()

  return (
    <div className="flex h-screen flex-col">
      <div className="flex w-full items-center justify-between border-b border-neutral-border py-4 px-6 gap-8">
        <div className="flex items-center gap-3 text-2xl font-bold">
          <span className="flex items-center gap-4">
            <FontAwesomeIcon icon={faShieldHalved} className="text-primary" />
            <p>Sec-o-simple</p>
          </span>

          <Button
            className="ml-4"
            color="secondary"
            onPress={() => navigate('/')}
          >
            <FontAwesomeIcon icon={faAdd} />
            New Document
          </Button>
        </div>
        <div className="flex gap-3">
          <Button color="secondary" isDisabled={true}>
            <FontAwesomeIcon icon={faEye} />
            Preview
          </Button>
          <Button color="secondary" onPress={exportCSAFDocument}>
            <FontAwesomeIcon icon={faFileExport} />
            Export
          </Button>
          <Button color="primary" isDisabled={true}>
            <FontAwesomeIcon icon={faSave} />
            Save Draft
          </Button>
        </div>
      </div>
      <Outlet />
    </div>
  )
}
