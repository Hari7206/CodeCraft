import { useSandbox } from './context/SandboxContext'
import Navbar from './components/Navbar'
import LandingScreen from './components/LandingScreen'
import FileExplorer from './components/FileExplorer'
import Preview from './components/Preview'
import TerminalPanel from './components/Terminal'
import AIChat from './components/AIChat'
import ResizablePanels from './components/ResizablePanels'

function IDELayout() {
  return (
    <div className="flex flex-1 overflow-hidden">
      {/* ── Left: File Explorer ── */}
      <div
        className="flex-shrink-0 overflow-hidden"
        style={{ width: 220 }}
      >
        <FileExplorer />
      </div>

      {/* ── Center: Preview + Terminal ── */}
      <div className="flex-1 overflow-hidden" style={{ borderLeft: '1px solid var(--border-subtle)', borderRight: '1px solid var(--border-subtle)' }}>
        <ResizablePanels
          topContent={<Preview />}
          bottomContent={<TerminalPanel />}
          initialTopRatio={0.62}
          minTopPx={100}
          minBottomPx={80}
        />
      </div>

      {/* ── Right: AI Chat ── */}
      <div
        className="flex-shrink-0 overflow-hidden"
        style={{ width: 340 }}
      >
        <AIChat />
      </div>
    </div>
  )
}

export default function App() {
  const { status } = useSandbox()
  const showIDE = status === 'active'
  const showLanding = status === 'idle' || status === 'error' || status === 'creating'

  return (
    <div
      className="flex flex-col h-screen overflow-hidden"
      style={{ background: 'var(--bg-base)', fontFamily: 'var(--font-sans)' }}
    >
      <Navbar />

      {showLanding && !showIDE && (
        <LandingScreen />
      )}

      {showIDE && (
        <div className="flex flex-col flex-1 overflow-hidden animate-fade-in">
          <IDELayout />
        </div>
      )}
    </div>
  )
}
