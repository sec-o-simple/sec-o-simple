import { useCSAFExport } from '@/utils/csafExport/csafExport'
import {
  faAdd,
  faFileExport,
  faSave,
  faSearch,
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
      <div className="flex w-full items-center justify-between border-b border-neutral-border p-4">
        <div className="flex items-center gap-3 text-2xl font-bold">
          <FontAwesomeIcon icon={faShieldHalved} className="text-primary" />
          Sec-o-simple
          <Button className="ml-4" onPress={() => navigate('/')}>
            <FontAwesomeIcon icon={faAdd} />
            New Document
          </Button>
        </div>
        <div className="flex gap-3">
          <Button isDisabled={true}>
            <FontAwesomeIcon icon={faSave} />
            Save Draft
          </Button>
          <Button isDisabled={true}>
            <FontAwesomeIcon icon={faSearch} />
            Preview
          </Button>
          <Button onPress={exportCSAFDocument}>
            <FontAwesomeIcon icon={faFileExport} />
            Export
          </Button>
        </div>
      </div>
      <Outlet />
    </div>
  )
}
