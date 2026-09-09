import { useState, useCallback, useRef } from 'react'
import { useSandbox } from '../context/SandboxContext'

export function useAIChat() {
  const { sandboxId } = useSandbox()
  const [messages, setMessages] = useState([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [statusLine, setStatusLine] = useState('')
  const abortRef = useRef(null)

  const sendMessage = useCallback(async (userMessage) => {
    if (!sandboxId || isStreaming) return

    // Add user message immediately
    const userMsg = { role: 'user', content: userMessage, id: Date.now() }
    setMessages(prev => [...prev, userMsg])
    setIsStreaming(true)
    setStatusLine('Thinking...')

    // Placeholder for AI response
    const aiMsgId = Date.now() + 1
    setMessages(prev => [...prev, { role: 'ai', content: '', id: aiMsgId, streaming: true }])

    const controller = new AbortController()
    abortRef.current = controller

    try {
      const res = await fetch('http://localhost/api/ai/invoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage, projectId: sandboxId }),
        signal: controller.signal,
      })

      if (!res.ok) throw new Error(`AI request failed: ${res.statusText}`)

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() // keep incomplete line

        for (const line of lines) {
          const trimmed = line.trim()
          if (!trimmed) continue

          // SSE format: "data: ..." or plain text
          const text = trimmed.startsWith('data: ') ? trimmed.slice(6) : trimmed

          // Detect status lines like "Reading files..."
          if (
            text.includes('Reading files') ||
            text.includes('Files read') ||
            text.includes('Writing') ||
            text.includes('Updating')
          ) {
            setStatusLine(text)
          } else if (text && text !== '[DONE]') {
            // Append to AI message
            setMessages(prev =>
              prev.map(m =>
                m.id === aiMsgId ? { ...m, content: m.content + text } : m
              )
            )
            setStatusLine('')
          }
        }
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        setMessages(prev =>
          prev.map(m =>
            m.id === aiMsgId
              ? { ...m, content: `Error: ${err.message}`, error: true }
              : m
          )
        )
      }
    } finally {
      setIsStreaming(false)
      setStatusLine('')
      setMessages(prev =>
        prev.map(m => (m.id === aiMsgId ? { ...m, streaming: false } : m))
      )
    }
  }, [sandboxId, isStreaming])

  const stopStreaming = useCallback(() => {
    abortRef.current?.abort()
  }, [])

  const clearMessages = useCallback(() => {
    setMessages([])
  }, [])

  return { messages, isStreaming, statusLine, sendMessage, stopStreaming, clearMessages }
}
