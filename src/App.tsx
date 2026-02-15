import { HashRouter, Navigate, Route, Routes } from 'react-router'
import NavigationLayout from './components/layout/NavigationLayout'
import TopBarLayout from './components/layout/TopBarLayout'
import Acknowledgments from './routes/document-information/Acknowledgments'
import General from './routes/document-information/General'
import Notes from './routes/document-information/Notes'
import Publisher from './routes/document-information/Publisher'
import References from './routes/document-information/References'
import Aliases from './routes/document-information/Aliases'
import Tracking from './routes/document-information/Tracking'
import DocumentSelection from './routes/document-selection/DocumentSelection'
import Product from './routes/products/Product'
import ProductFamily from './routes/products/ProductFamily'
import ProductManagement from './routes/products/ProductManagement'
import Version from './routes/products/Version'
import Vulnerabilities from './routes/vulnerabilities/Vulnerabilities'
import { useTemplateInitializer } from './utils/template'
import { useConfigInitializer } from './utils/useConfigStore'

export default function App() {
  useConfigInitializer()
  useTemplateInitializer()

  return (
    <HashRouter>
      <Routes>
        <Route element={<TopBarLayout />}>
          <Route index element={<DocumentSelection />} />
          <Route element={<NavigationLayout />}>
            <Route path="document-information">
              <Route index element={<Navigate to="general" replace />} />
              <Route path="general" element={<General />} />
              <Route path="notes" element={<Notes />} />
              <Route path="publisher" element={<Publisher />} />
              <Route path="references" element={<References />} />
              <Route path="aliases" element={<Aliases />} />
              <Route path="acknowledgments" element={<Acknowledgments />} />
            </Route>
            <Route path="products">
              <Route path="families" element={<ProductFamily />} />
              <Route path="management">
                <Route index element={<ProductManagement />} />
                <Route path="product/:productId" element={<Product />} />
                <Route path="version/:productVersionId" element={<Version />} />
              </Route>
            </Route>
            <Route path="vulnerabilities" element={<Vulnerabilities />} />
            <Route path="tracking" element={<Tracking />} />
          </Route>
        </Route>
      </Routes>
    </HashRouter>
  )
}
