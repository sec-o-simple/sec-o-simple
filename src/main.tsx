import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { BrowserRouter, Route, Routes } from 'react-router'
import { HeroUIProvider } from '@heroui/react'
import TopBarLayout from './components/layout/TopBarLayout'
import NavigationLayout from './components/layout/NavigationLayout'

const rootElement = document.getElementById('root') as HTMLElement
const root = ReactDOM.createRoot(rootElement)

root.render(
  <StrictMode>
    <HeroUIProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<TopBarLayout />}>
            <Route element={<NavigationLayout />}>
              <Route index element={<App />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </HeroUIProvider>
  </StrictMode>,
)
