import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { BrowserRouter, Route, Routes } from 'react-router'

const rootElement = document.getElementById('root') as HTMLElement
const root = ReactDOM.createRoot(rootElement)

root.render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        {/* TODO: [create layout](https://reactrouter.com/start/library/routing#layout-routes) */}
        <Route index element={<App />} />
        <Route path="test" element={<p>test route</p>} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
