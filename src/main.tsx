import { HeroUIProvider } from '@heroui/react'
import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter, Navigate, Route, Routes } from 'react-router'
import NavigationLayout from './components/layout/NavigationLayout'
import TopBarLayout from './components/layout/TopBarLayout'
import './index.css'
import General from './routes/document-information/General'
import Notes from './routes/document-information/Notes'
import Publisher from './routes/document-information/Publisher'
import References from './routes/document-information/References'
import DocumentSelection from './routes/document-selection/DocumentSelection'
import Products from './routes/products/Products'
import Vulnerabilities from './routes/vulnerabilities/Vulnerabilities'

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
