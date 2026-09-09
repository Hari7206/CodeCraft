import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { SandboxProvider } from './context/SandboxContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SandboxProvider>
      <App />
    </SandboxProvider>
  </StrictMode>,
)
