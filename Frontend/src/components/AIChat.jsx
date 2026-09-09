import { useState, useRef, useEffect } from 'react'
import { Send, StopCircle, Trash2, Bot, User, Loader2, Sparkles, FileCode } from 'lucide-react'
import { useAIChat } from '../hooks/useAIChat'
import { useSandbox } from '../context/SandboxContext'

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 px-3 py-2">
      <div className="typing-dot" />
      <div className="typing-dot" />
      <div className="typing-dot" />
    </div>
  )
}

function StatusLine({ text }) {
  if (!text) return null
  return (
    <div
      className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg mx-auto max-w-xs"
      style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)', color: '#a78bfa' }}
    >
      <Loader2 size={11} className="animate-spin-slow flex-shrink-0" />
      <span className="truncate font-mono">{text}</span>
    </div>
  )
}

function ChatMessage({ msg }) {
  const isUser = msg.role === 'user'
  return (
    <div className={`flex gap-2.5 animate-chat-pop ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{
          background: isUser
            ? 'linear-gradient(135deg, #7c3aed, #6366f1)'
            : 'rgba(255,255,255,0.06)',
          border: isUser ? 'none' : '1px solid var(--border-default)',
        }}
      >
        {isUser
          ? <User size={13} className="text-white" />
          : <Bot size={13} style={{ color: '#a78bfa' }} />
        }
      </div>

      {/* Bubble */}
      <div className={isUser ? 'chat-bubble-user' : 'chat-bubble-ai'}>
        {msg.content ? (
          <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
        ) : msg.streaming ? (
          <TypingIndicator />
        ) : null}
        {msg.error && (
          <span className="text-red-400 text-xs">(Error — try again)</span>
        )}
      </div>
    </div>
  )
}

const STARTER_PROMPTS = [
  { icon: '🐍', label: 'Snake Game', text: 'Create a classic snake game with score tracking' },
  { icon: '🌐', label: 'Landing Page', text: 'Build a modern SaaS landing page with dark theme' },
  { icon: '📊', label: 'Dashboard', text: 'Create an analytics dashboard with charts and stats' },
  { icon: '🎨', label: 'Portfolio', text: 'Build a stunning developer portfolio with animations' },
]

export default function AIChat() {
  const { status, sandboxId } = useSandbox()
  const { messages, isStreaming, statusLine, sendMessage, stopStreaming, clearMessages } = useAIChat()
  const [input, setInput] = useState('')
  const bottomRef = useRef(null)
  const textareaRef = useRef(null)
  const isActive = status === 'active'

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, statusLine])

  const handleSend = () => {
    const trimmed = input.trim()
    if (!trimmed || !isActive || isStreaming) return
    sendMessage(trimmed)
    setInput('')
    textareaRef.current?.focus()
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div
      className="flex flex-col h-full"
      style={{ background: 'var(--bg-surface)', borderLeft: '1px solid var(--border-subtle)' }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-3 py-2 flex-shrink-0"
        style={{ borderBottom: '1px solid var(--border-subtle)' }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.3)' }}
          >
            <Sparkles size={12} style={{ color: '#a78bfa' }} />
          </div>
          <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
            AI Assistant
          </span>
        </div>
        {messages.length > 0 && (
          <button
            onClick={clearMessages}
            className="p-1 rounded transition-colors hover:bg-white/5"
            style={{ color: 'var(--text-muted)' }}
            title="Clear chat"
          >
            <Trash2 size={12} />
          </button>
        )}
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-3">
        {!isActive ? (
          /* Disabled state */
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.15)' }}
            >
              <Sparkles size={24} style={{ color: '#7c3aed', opacity: 0.5 }} />
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>AI Assistant</p>
              <p className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                {status === 'creating'
                  ? 'Starting sandbox, please wait…'
                  : 'Start a sandbox to begin chatting with AI'}
              </p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          /* Welcome state with starter prompts */
          <div className="flex flex-col gap-4">
            <div className="text-center pt-4">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3"
                style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(99,102,241,0.2))', border: '1px solid rgba(124,58,237,0.25)' }}
              >
                <Sparkles size={20} style={{ color: '#a78bfa' }} />
              </div>
              <p className="text-sm font-semibold gradient-text">What would you like to build?</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                Sandbox ID: <span className="font-mono">{sandboxId?.slice(0, 8)}…</span>
              </p>
            </div>

            {/* Starter prompts */}
            <div className="grid grid-cols-2 gap-2 mt-2">
              {STARTER_PROMPTS.map((p) => (
                <button
                  key={p.label}
                  onClick={() => { setInput(p.text); textareaRef.current?.focus() }}
                  className="flex flex-col items-start gap-1 p-3 rounded-xl text-left transition-all hover:scale-[1.02]"
                  style={{
                    background: 'var(--bg-overlay)',
                    border: '1px solid var(--border-default)',
                    cursor: 'pointer',
                  }}
                >
                  <span className="text-base">{p.icon}</span>
                  <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{p.label}</span>
                  <span className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>{p.text}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Message thread */
          messages.map(msg => <ChatMessage key={msg.id} msg={msg} />)
        )}

        {/* Streaming status line */}
        {statusLine && <StatusLine text={statusLine} />}

        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div
        className="flex-shrink-0 p-3"
        style={{ borderTop: '1px solid var(--border-subtle)' }}
      >
        {/* File context hint */}
        {isActive && messages.length === 0 && (
          <div className="flex items-center gap-1.5 text-xs mb-2 px-1" style={{ color: 'var(--text-muted)' }}>
            <FileCode size={11} />
            <span>AI has access to your project files</span>
          </div>
        )}

        <div
          className="flex items-end gap-2 rounded-xl p-2"
          style={{
            background: 'var(--bg-overlay)',
            border: '1px solid var(--border-default)',
            outline: 'none',
          }}
        >
          <textarea
            ref={textareaRef}
            id="ai-chat-input"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={!isActive || isStreaming}
            rows={1}
            placeholder={
              !isActive
                ? 'Start a sandbox first…'
                : isStreaming
                ? 'AI is responding…'
                : 'Describe what you want to build…'
            }
            className="flex-1 resize-none text-sm leading-relaxed outline-none bg-transparent"
            style={{
              color: 'var(--text-primary)',
              minHeight: '20px',
              maxHeight: '120px',
              overflowY: 'auto',
            }}
            onInput={e => {
              e.target.style.height = 'auto'
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
            }}
          />
          {isStreaming ? (
            <button
              onClick={stopStreaming}
              className="flex-shrink-0 p-2 rounded-lg transition-colors"
              style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid rgba(239,68,68,0.25)' }}
              title="Stop generation"
            >
              <StopCircle size={16} />
            </button>
          ) : (
            <button
              id="send-message-btn"
              onClick={handleSend}
              disabled={!isActive || !input.trim()}
              className="flex-shrink-0 p-2 rounded-lg transition-all btn-glow disabled:opacity-30 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
              title="Send message (Enter)"
            >
              <Send size={15} className="text-white" />
            </button>
          )}
        </div>
        <p className="text-xs mt-1.5 px-1" style={{ color: 'var(--text-muted)' }}>
          Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  )
}
