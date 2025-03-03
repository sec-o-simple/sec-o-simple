import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import { HashRouter, Navigate, Route, Routes } from 'react-router'
import { HeroUIProvider } from '@heroui/react'
import TopBarLayout from './components/layout/TopBarLayout'
import NavigationLayout from './components/layout/NavigationLayout'
import Notes from './routes/document-information/Notes'
import General from './routes/document-information/General'
import Publisher from './routes/document-information/Publisher'
import References from './routes/document-information/References'
import Products from './routes/products/Products'
import Vulnerabilities from './routes/vulnerabilities/Vulnerabilities'
import DocumentSelection from './routes/document-selection/DocumentSelection'

const rootElement = document.getElementById('root') as HTMLElement
const root = ReactDOM.createRoot(rootElement)

root.render(
  <StrictMode>
    <HeroUIProvider>
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
              </Route>
              <Route path="products" element={<Products />} />
              <Route path="vulnerabilities" element={<Vulnerabilities />} />
            </Route>
          </Route>
        </Routes>
      </HashRouter>
    </HeroUIProvider>
  </StrictMode>,
)
