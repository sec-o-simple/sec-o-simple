import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import { HeroUIProvider } from '@heroui/react'
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
