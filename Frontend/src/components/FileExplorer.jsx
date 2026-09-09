import { useEffect, useState, useRef } from 'react'
import { FolderOpen, File, RefreshCw, ChevronRight, Code2, Loader2 } from 'lucide-react'
import { useFileExplorer } from '../hooks/useFileExplorer'
import { useSandbox } from '../context/SandboxContext'

// ─ Map file extensions to accent colours ────────────────
const EXT_COLORS = {
  jsx: '#61dafb', tsx: '#61dafb', js: '#f7df1e', ts: '#3178c6',
  css: '#38bdf8', html: '#e34c26', json: '#f59e0b', md: '#a78bfa',
  svg: '#22c55e', png: '#22c55e', jpg: '#22c55e',
}
function getExt(name) { return name.split('.').pop()?.toLowerCase() }
function getColor(name) { return EXT_COLORS[getExt(name)] || '#a0a0bf' }

// ─ Build folder tree from flat file list ────────────────
function buildTree(filePaths) {
  const root = {}
  for (const p of filePaths) {
    const parts = p.split('/')
    let node = root
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]
      if (i === parts.length - 1) {
        node[part] = { __file: true, path: p }
      } else {
        node[part] = node[part] || {}
        node = node[part]
      }
    }
  }
  return root
}

function TreeNode({ name, node, depth = 0, activeFile, onOpenFile }) {
  const isFile = node.__file
  const [open, setOpen] = useState(depth < 2)

  if (isFile) {
    return (
      <div
        className={`file-tree-item ${activeFile === node.path ? 'active' : ''}`}
        style={{ paddingLeft: `${(depth + 1) * 12}px` }}
        onClick={() => onOpenFile(node.path)}
        title={node.path}
      >
        <span style={{ width: 10, height: 10, borderRadius: '50%', background: getColor(name), flexShrink: 0, display:'inline-block' }} />
        <span className="truncate">{name}</span>
      </div>
    )
  }

  return (
    <div>
      <div
        className="file-tree-item"
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
        onClick={() => setOpen(o => !o)}
      >
        <ChevronRight
          size={11}
          style={{ color: 'var(--text-muted)', transform: open ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.15s', flexShrink: 0 }}
        />
        <FolderOpen size={13} style={{ color: '#fbbf24', flexShrink: 0 }} />
        <span className="truncate">{name}</span>
      </div>
      {open && (
        <div>
          {Object.entries(node).map(([childName, childNode]) => (
            <TreeNode
              key={childName}
              name={childName}
              node={childNode}
              depth={depth + 1}
              activeFile={activeFile}
              onOpenFile={onOpenFile}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default function FileExplorer({ onFileOpen }) {
  const { status } = useSandbox()
  const { files, activeFile, loading, error, fetchFiles, openFile } = useFileExplorer()
  const [tree, setTree] = useState({})

  useEffect(() => {
    if (status === 'active') fetchFiles()
  }, [status, fetchFiles])

  useEffect(() => {
    setTree(buildTree(files))
  }, [files])

  const handleOpenFile = async (path) => {
    await openFile(path)
    onFileOpen?.(path)
  }

  return (
    <div
      className="flex flex-col h-full"
      style={{ background: 'var(--bg-surface)', borderRight: '1px solid var(--border-subtle)' }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-3 py-2 flex-shrink-0"
        style={{ borderBottom: '1px solid var(--border-subtle)' }}
      >
        <div className="flex items-center gap-2">
          <Code2 size={13} style={{ color: '#a78bfa' }} />
          <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
            Explorer
          </span>
        </div>
        {status === 'active' && (
          <button
            onClick={fetchFiles}
            disabled={loading}
            className="p-1 rounded transition-colors hover:bg-white/5"
            style={{ color: 'var(--text-muted)' }}
            title="Refresh files"
          >
            <RefreshCw size={12} className={loading ? 'animate-spin-slow' : ''} />
          </button>
        )}
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto py-1">
        {status !== 'active' ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 px-4 text-center">
            <FolderOpen size={28} style={{ color: 'var(--text-muted)', opacity: 0.4 }} />
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {status === 'creating' ? 'Starting sandbox…' : 'No sandbox running'}
            </p>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center h-20 gap-2">
            <Loader2 size={16} className="animate-spin-slow" style={{ color: 'var(--accent-primary)' }} />
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Loading files…</span>
          </div>
        ) : error ? (
          <div className="px-3 py-4 text-xs text-red-400">{error}</div>
        ) : (
          <div>
            {Object.entries(tree).map(([name, node]) => (
              <TreeNode
                key={name}
                name={name}
                node={node}
                depth={0}
                activeFile={activeFile}
                onOpenFile={handleOpenFile}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer — active file */}
      {activeFile && (
        <div
          className="px-3 py-2 flex items-center gap-1.5 flex-shrink-0"
          style={{ borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-overlay)' }}
        >
          <File size={11} style={{ color: getColor(activeFile), flexShrink: 0 }} />
          <span className="text-xs font-mono truncate" style={{ color: 'var(--text-muted)' }}>{activeFile}</span>
        </div>
      )}
    </div>
  )
}
