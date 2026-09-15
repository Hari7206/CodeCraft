import { createContext, useContext, useState, useCallback } from 'react'

const SandboxContext = createContext(null)

export function SandboxProvider({ children }) {
  const [sandboxId, setSandboxId] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [agentBaseUrl, setAgentBaseUrl] = useState(null)
  const [status, setStatus] = useState('idle') // 'idle' | 'creating' | 'active' | 'error'
  const [error, setError] = useState(null)

  const startSandbox = useCallback(async () => {
    setStatus('creating')
    setError(null)
    try {
      
const res = await fetch('/api/sandbox/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      if (!res.ok) throw new Error(`Failed to start sandbox: ${res.statusText}`)
      const data = await res.json()

      setSandboxId(data.sandboxId)
      setPreviewUrl(data.previewUrl)
      setAgentBaseUrl(`http://${data.sandboxId}.agent.localhost`)
      setStatus('active')
      return data
    } catch (err) {
      setError(err.message)
      setStatus('error')
      throw err
    }
  }, [])

  const value = {
    sandboxId,
    previewUrl,
    agentBaseUrl,
    status,
    error,
    startSandbox,
  }

  return (
    <SandboxContext.Provider value={value}>
      {children}
    </SandboxContext.Provider>
  )
}

export function useSandbox() {
  const ctx = useContext(SandboxContext)
  if (!ctx) throw new Error('useSandbox must be used inside SandboxProvider')
  return ctx
}
