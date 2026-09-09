import { useEffect, useRef } from 'react'
import { Terminal as TerminalIcon, Wifi, WifiOff } from 'lucide-react'
import { Terminal } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import { WebLinksAddon } from '@xterm/addon-web-links'
import { io } from 'socket.io-client'
import { useSandbox } from '../context/SandboxContext'

export default function TerminalPanel() {
  const { sandboxId } = useSandbox()
  const termRef = useRef(null)
  const xtermRef = useRef(null)
  const fitAddonRef = useRef(null)
  const socketRef = useRef(null)
  const connectedRef = useRef(false)

  useEffect(() => {
    if (!termRef.current || !sandboxId) return

    // Initialise xterm
    const term = new Terminal({
      theme: {
        background: 'transparent',
        foreground: '#e0e0f0',
        cursor: '#7c3aed',
        cursorAccent: '#0a0a0f',
        selectionBackground: 'rgba(124,58,237,0.35)',
        black: '#1e1e2a',
        red: '#f87171',
        green: '#4ade80',
        yellow: '#fbbf24',
        blue: '#818cf8',
        magenta: '#c084fc',
        cyan: '#38bdf8',
        white: '#e0e0f0',
        brightBlack: '#5a5a7a',
        brightRed: '#fca5a5',
        brightGreen: '#86efac',
        brightYellow: '#fde68a',
        brightBlue: '#a5b4fc',
        brightMagenta: '#d8b4fe',
        brightCyan: '#7dd3fc',
        brightWhite: '#f0f0ff',
      },
      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
      fontSize: 13,
      lineHeight: 1.4,
      cursorBlink: true,
      cursorStyle: 'block',
      allowTransparency: true,
      convertEol: true,
      scrollback: 5000,
    })

    const fitAddon = new FitAddon()
    const webLinksAddon = new WebLinksAddon()
    term.loadAddon(fitAddon)
    term.loadAddon(webLinksAddon)

    term.open(termRef.current)
    fitAddon.fit()

    xtermRef.current = term
    fitAddonRef.current = fitAddon

    // Welcome message
    term.writeln('\x1b[35m╔══════════════════════════════════╗\x1b[0m')
    term.writeln('\x1b[35m║  \x1b[1;37mCodeCraft Terminal\x1b[0m\x1b[35m               ║\x1b[0m')
    term.writeln('\x1b[35m╚══════════════════════════════════╝\x1b[0m')
    term.writeln('')
    term.writeln('\x1b[33mConnecting to sandbox…\x1b[0m')

    // Socket.io connection
    const socketUrl = `http://${sandboxId}.agent.localhost`
    const socket = io(socketUrl, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })
    socketRef.current = socket

    socket.on('connect', () => {
      connectedRef.current = true
      term.writeln('\x1b[32m✓ Connected to sandbox terminal\x1b[0m\r\n')
    })

    socket.on('disconnect', () => {
      connectedRef.current = false
      term.writeln('\r\n\x1b[33m⚠ Disconnected from terminal\x1b[0m')
    })

    socket.on('connect_error', () => {
      term.writeln('\x1b[31m✗ Connection failed — retrying…\x1b[0m')
    })

    // Receive terminal output
    socket.on('terminal output', (data) => {
      term.write(data)
    })

    // Send terminal input
    term.onData((data) => {
      if (socket.connected) {
        socket.emit('terminal input', data)
      }
    })

    // Resize observer
    const observer = new ResizeObserver(() => {
      try { fitAddon.fit() } catch (_) {}
    })
    observer.observe(termRef.current)

    return () => {
      observer.disconnect()
      socket.disconnect()
      term.dispose()
    }
  }, [sandboxId])

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--bg-base)' }}>
      {/* Panel header */}
      <div
        className="flex items-center justify-between px-3 py-2 flex-shrink-0"
        style={{ borderBottom: '1px solid var(--border-subtle)' }}
      >
        <div className="flex items-center gap-2">
          <TerminalIcon size={13} style={{ color: '#a78bfa' }} />
          <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
            Terminal
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {sandboxId ? (
            <div className="flex items-center gap-1.5 text-xs" style={{ color: '#22c55e' }}>
              <Wifi size={12} />
              <span className="font-mono text-xs opacity-70">{sandboxId.slice(0, 8)}…</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
              <WifiOff size={12} />
              <span>No sandbox</span>
            </div>
          )}
        </div>
      </div>

      {/* xterm container */}
      <div className="flex-1 overflow-hidden relative">
        {!sandboxId && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3"
            style={{ background: 'var(--bg-base)', zIndex: 10 }}>
            <TerminalIcon size={32} style={{ color: 'var(--text-muted)' }} />
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Start a sandbox to activate the terminal
            </p>
          </div>
        )}
        <div ref={termRef} className="xterm-wrapper" />
      </div>
    </div>
  )
}
