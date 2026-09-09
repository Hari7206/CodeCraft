import { Loader2, Zap } from 'lucide-react'
import { useSandbox } from '../context/SandboxContext'

const STATUS_CONFIG = {
  idle:     { label: 'No Sandbox',  dot: 'idle' },
  creating: { label: 'Creating…',   dot: 'creating' },
  active:   { label: 'Active',      dot: 'active' },
  error:    { label: 'Error',       dot: 'error' },
}

export default function Navbar() {
  const { status, startSandbox } = useSandbox()
  const cfg = STATUS_CONFIG[status]

  return (
    <header
      className="flex items-center justify-between px-5 h-12 flex-shrink-0"
      style={{
        background: 'rgba(9,9,15,0.9)',
        borderBottom: '1px solid var(--border-subtle)',
        backdropFilter: 'blur(12px)',
        zIndex: 50,
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, #7c3aed, #6366f1)',
            boxShadow: '0 0 12px rgba(124,58,237,0.5)',
          }}
        >
          <Zap size={14} className="text-white" strokeWidth={2.5} />
        </div>
        <span className="font-bold text-base tracking-tight gradient-text">
          CodeCraft
        </span>
        <span
          className="text-xs px-2 py-0.5 rounded-full font-medium"
          style={{
            background: 'rgba(124,58,237,0.15)',
            color: '#a78bfa',
            border: '1px solid rgba(124,58,237,0.3)',
          }}
        >
          AI IDE
        </span>
      </div>

      {/* Center — status */}
      <div className="flex items-center gap-2">
        <div className={`status-dot ${cfg.dot}`} />
        <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
          {cfg.label}
        </span>
      </div>

      {/* Right — action button */}
      <div className="flex items-center gap-3">
        {status === 'idle' || status === 'error' ? (
          <button
            id="start-sandbox-btn"
            onClick={startSandbox}
            className="btn-glow flex items-center gap-2 px-4 py-1.5 rounded-lg text-white text-sm font-semibold"
          >
            <Zap size={14} strokeWidth={2.5} />
            Start Sandbox
          </button>
        ) : status === 'creating' ? (
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium"
            style={{ color: '#f59e0b', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}>
            <Loader2 size={14} className="animate-spin-slow" />
            Starting…
          </div>
        ) : (
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium"
            style={{ color: '#22c55e', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}>
            <span className="w-2 h-2 rounded-full bg-green-400" style={{ boxShadow: '0 0 6px rgba(34,197,94,0.7)' }} />
            Sandbox Ready
          </div>
        )}
      </div>
    </header>
  )
}
