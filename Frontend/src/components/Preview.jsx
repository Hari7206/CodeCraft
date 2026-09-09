import { useEffect, useRef } from 'react'
import { RefreshCw, ExternalLink, Monitor } from 'lucide-react'
import { useSandbox } from '../context/SandboxContext'

export default function Preview() {
  const { previewUrl, status } = useSandbox()
  const iframeRef = useRef(null)

  const handleRefresh = () => {
    if (iframeRef.current) {
      iframeRef.current.src = iframeRef.current.src
    }
  }

  const handleOpenExternal = () => {
    if (previewUrl) window.open(previewUrl, '_blank')
  }

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--bg-surface)' }}>
      {/* Header bar */}
      <div
        className="flex items-center gap-2 px-3 py-2 flex-shrink-0"
        style={{ borderBottom: '1px solid var(--border-subtle)' }}
      >
        <Monitor size={13} style={{ color: '#818cf8' }} />
        <span
          className="text-xs font-semibold uppercase tracking-widest flex-shrink-0"
          style={{ color: 'var(--text-muted)' }}
        >
          Preview
        </span>

        {/* URL bar */}
        <div
          className="flex-1 mx-2 px-3 py-1 rounded-md text-xs font-mono truncate"
          style={{
            background: 'var(--bg-overlay)',
            border: '1px solid var(--border-subtle)',
            color: previewUrl ? 'var(--text-secondary)' : 'var(--text-muted)',
          }}
        >
          {previewUrl || 'No preview URL — start a sandbox first'}
        </div>

        {previewUrl && (
          <div className="flex items-center gap-1">
            <button
              onClick={handleRefresh}
              title="Refresh preview"
              className="p-1.5 rounded-md transition-colors hover:bg-white/5"
              style={{ color: 'var(--text-muted)' }}
            >
              <RefreshCw size={13} />
            </button>
            <button
              onClick={handleOpenExternal}
              title="Open in new tab"
              className="p-1.5 rounded-md transition-colors hover:bg-white/5"
              style={{ color: 'var(--text-muted)' }}
            >
              <ExternalLink size={13} />
            </button>
          </div>
        )}
      </div>

      {/* iframe / placeholder */}
      <div className="flex-1 relative overflow-hidden">
        {!previewUrl ? (
          /* Placeholder when no sandbox */
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-4"
            style={{ background: 'var(--bg-surface)' }}
          >
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)' }}
            >
              <Monitor size={28} style={{ color: '#7c3aed', opacity: 0.6 }} />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                No Preview Available
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                {status === 'creating'
                  ? 'Sandbox is starting up…'
                  : 'Start a sandbox to see your project'}
              </p>
            </div>
          </div>
        ) : (
          <iframe
            ref={iframeRef}
            src={previewUrl}
            title="Sandbox Preview"
            className="w-full h-full border-0"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            style={{ background: '#fff' }}
          />
        )}
      </div>
    </div>
  )
}
