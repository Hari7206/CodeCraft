import { Zap, Sparkles, Terminal, Monitor, FolderOpen, ArrowRight, Code2 } from 'lucide-react'
import { useSandbox } from '../context/SandboxContext'

const FEATURES = [
  { icon: Monitor, label: 'Live Preview', desc: 'See changes instantly in real-time iframe preview' },
  { icon: Sparkles, label: 'AI Assistant', desc: 'Describe what to build, AI writes the code for you' },
  { icon: Terminal, label: 'Full Terminal', desc: 'Direct shell access to your sandbox environment' },
  { icon: FolderOpen, label: 'File Explorer', desc: 'Browse and manage your project file structure' },
]

export default function LandingScreen() {
  const { startSandbox, status } = useSandbox()
  const isCreating = status === 'creating'

  return (
    <div
      className="flex-1 flex flex-col items-center justify-center relative overflow-hidden landing-grid"
      style={{ background: 'var(--bg-base)' }}
    >
      {/* Ambient orbs */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: 600, height: 600,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)',
          top: '50%', left: '50%',
          transform: 'translate(-60%, -60%)',
          animation: 'orb-float 12s ease-in-out infinite',
        }}
      />
      <div
        className="absolute pointer-events-none"
        style={{
          width: 400, height: 400,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.10) 0%, transparent 70%)',
          bottom: '10%', right: '15%',
          animation: 'orb-float 16s ease-in-out infinite reverse',
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-2xl animate-fade-in">
        {/* Logo badge */}
        <div
          className="w-20 h-20 rounded-3xl flex items-center justify-center mb-6"
          style={{
            background: 'linear-gradient(135deg, rgba(124,58,237,0.25), rgba(99,102,241,0.15))',
            border: '1px solid rgba(124,58,237,0.4)',
            boxShadow: '0 0 40px rgba(124,58,237,0.2), inset 0 0 20px rgba(124,58,237,0.05)',
          }}
        >
          <Code2 size={36} style={{ color: '#a78bfa' }} />
        </div>

        {/* Eyebrow */}
        <div
          className="flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-4"
          style={{
            background: 'rgba(124,58,237,0.1)',
            border: '1px solid rgba(124,58,237,0.25)',
            color: '#a78bfa',
          }}
        >
          <Sparkles size={11} />
          AI-Powered Sandbox IDE
        </div>

        {/* Hero title */}
        <h1 className="text-5xl font-extrabold tracking-tight mb-4 leading-tight">
          <span className="gradient-text">Build Anything.</span>
          <br />
          <span style={{ color: 'var(--text-primary)' }}>Instantly.</span>
        </h1>

        <p className="text-base leading-relaxed mb-10" style={{ color: 'var(--text-secondary)', maxWidth: 420 }}>
          Describe what you want to build. AI generates the code, you see it live —
          with full terminal access to your cloud sandbox.
        </p>

        {/* CTA */}
        <button
          id="landing-start-btn"
          onClick={startSandbox}
          disabled={isCreating}
          className="btn-glow flex items-center gap-3 px-8 py-4 rounded-2xl text-white font-bold text-lg mb-4 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isCreating ? (
            <>
              <span
                className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin-slow"
                style={{ borderTopColor: 'white' }}
              />
              Creating Sandbox…
            </>
          ) : (
            <>
              <Zap size={20} strokeWidth={2.5} />
              Start Sandbox
              <ArrowRight size={18} />
            </>
          )}
        </button>

        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          Free sandbox · No setup required · Instant start
        </p>

        {/* Feature cards */}
        <div className="grid grid-cols-2 gap-3 mt-12 w-full max-w-lg">
          {FEATURES.map(({ icon: Icon, label, desc }) => (
            <div
              key={label}
              className="flex items-start gap-3 p-4 rounded-xl text-left"
              style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.2)' }}
              >
                <Icon size={15} style={{ color: '#a78bfa' }} />
              </div>
              <div>
                <p className="text-sm font-semibold mb-0.5" style={{ color: 'var(--text-primary)' }}>{label}</p>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
