import { useState, useCallback } from 'react'
import { useSandbox } from '../context/SandboxContext'

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
      const res = await fetch(`${agentBaseUrl}/list-files`)
      if (!res.ok) throw new Error('Failed to list files')
      const data = await res.json()
      setFiles(data.files || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [agentBaseUrl])

  const openFile = useCallback(async (filePath) => {
    if (!agentBaseUrl) return
    setActiveFile(filePath)
    setContentLoading(true)
    try {
      const res = await fetch(
        `${agentBaseUrl}/read-files?files=${encodeURIComponent(filePath)}`
      )
      if (!res.ok) throw new Error('Failed to read file')
      const data = await res.json()
      const fileData = data.files?.[0]
      setFileContent(fileData?.exists ? fileData.content : '// File not found')
    } catch (err) {
      setFileContent(`// Error: ${err.message}`)
    } finally {
      setContentLoading(false)
    }
  }, [agentBaseUrl])

  const updateFile = useCallback(async (updates) => {
    if (!agentBaseUrl) return
    const res = await fetch(`${agentBaseUrl}/update-files`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ updates }),
    })
    if (!res.ok) throw new Error('Failed to update files')
    return res.json()
  }, [agentBaseUrl])

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
