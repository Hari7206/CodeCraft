import { useState, useCallback } from 'react'
import { useSandbox } from '../context/SandboxContext'

// Retry wrapper: tries `retries` times with `delay` ms between attempts.
// Only treats a response as success if `res.ok` — otherwise keeps retrying.
async function fetchWithRetry(url, options = {}, retries = 10, delay = 2000) {
  let lastErr
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, options)
      if (res.ok) return res
      lastErr = new Error(`HTTP ${res.status}`)
    } catch (err) {
      lastErr = err
    }
    if (i < retries - 1) {
      await new Promise((r) => setTimeout(r, delay))
    }
  }
  throw lastErr || new Error('Failed after retries')
}

export function useFileExplorer() {
  const { agentBaseUrl } = useSandbox()
  const [files, setFiles] = useState([])
  const [activeFile, setActiveFile] = useState(null)
  const [fileContent, setFileContent] = useState(null)
  const [loading, setLoading] = useState(false)
  const [contentLoading, setContentLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchFiles = useCallback(async () => {
    if (!agentBaseUrl) return
    setLoading(true)
    setError(null)
    try {
      // Retry: the agent container may still be booting when this first fires.
      const res = await fetchWithRetry(`${agentBaseUrl}/list-files`)
      const data = await res.json()

      // Log once while wiring this up so we can confirm the real shape.
      // console.log('list-files response:', data)

      // Expected: { files: [...] } — but tolerate a bare array too.
      const list = Array.isArray(data) ? data : data.files || []

      // Normalise each entry to a plain string path.
      // Handles: "src/App.jsx"  |  { "src/App.jsx": "..." }  |  { path: "src/App.jsx" }
      const normalised = list
        .map((entry) => {
          if (typeof entry === 'string') return entry
          if (entry && typeof entry === 'object') {
            if (typeof entry.path === 'string') return entry.path
            const keys = Object.keys(entry)
            if (keys.length > 0) return keys[0]
          }
          return null
        })
        .filter(Boolean)

      setFiles(normalised)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [agentBaseUrl])

  const openFile = useCallback(
    async (filePath) => {
      if (!agentBaseUrl) return
      setActiveFile(filePath)
      setContentLoading(true)
      try {
        const res = await fetchWithRetry(
          `${agentBaseUrl}/read-files?files=${encodeURIComponent(filePath)}`
        )
        const data = await res.json()

        // Log once while wiring this up so we can confirm the real shape.
        // console.log('read-files response:', data)

        // The agent returns: { files: [ { "src/App.jsx": "file contents..." } ] }
        // i.e. an array of single-key objects mapping path -> content.
        // We also tolerate the old shape { files: [{ exists, content }] } and a
        // plain string body, so this doesn't break if the agent changes.
        const entry = Array.isArray(data?.files) ? data.files[0] : null

        let content = ''
        if (typeof entry === 'string') {
          content = entry
        } else if (entry && typeof entry === 'object') {
          if (typeof entry[filePath] === 'string') {
            // Exact match on the requested path
            content = entry[filePath]
          } else if (typeof entry.content === 'string') {
            // Legacy / already-parsed shape
            content = entry.content
          } else {
            // Fall back to the first string value in the object
            const firstString = Object.values(entry).find(
              (v) => typeof v === 'string'
            )
            content = firstString ?? ''
          }
        }

        setFileContent(content !== '' ? content : '// File not found')
      } catch (err) {
        setFileContent(`// Error: ${err.message}`)
      } finally {
        setContentLoading(false)
      }
    },
    [agentBaseUrl]
  )

  const updateFile = useCallback(
    async (updates) => {
      if (!agentBaseUrl) return
      const res = await fetch(`${agentBaseUrl}/update-files`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates }),
      })
      if (!res.ok) throw new Error('Failed to update files')
      return res.json()
    },
    [agentBaseUrl]
  )

  return {
    files,
    activeFile,
    fileContent,
    loading,
    contentLoading,
    error,
    fetchFiles,
    openFile,
    updateFile,
  }
}