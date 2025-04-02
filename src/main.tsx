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
import App from './App'

const rootElement = document.getElementById('root') as HTMLElement
const root = ReactDOM.createRoot(rootElement)

root.render(
  <StrictMode>
    <HeroUIProvider>
      <App />
    </HeroUIProvider>
  </StrictMode>,
)
