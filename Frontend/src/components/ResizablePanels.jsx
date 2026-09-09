import { useRef, useState, useCallback, useEffect } from 'react'

/**
 * Vertically resizable two-pane layout (top/bottom).
 * topContent fills the top, bottomContent fills the bottom.
 * initialTopRatio: 0–1, fraction of total height for top pane.
 */
export default function ResizablePanels({
  topContent,
  bottomContent,
  initialTopRatio = 0.6,
  minTopPx = 80,
  minBottomPx = 60,
}) {
  const containerRef = useRef(null)
  const [topRatio, setTopRatio] = useState(initialTopRatio)
  const dragging = useRef(false)
  const startY = useRef(0)
  const startRatio = useRef(initialTopRatio)
  const [isDragging, setIsDragging] = useState(false)

  const onMouseDown = useCallback((e) => {
    e.preventDefault()
    dragging.current = true
    startY.current = e.clientY
    startRatio.current = topRatio
    setIsDragging(true)
  }, [topRatio])

  const onMouseMove = useCallback((e) => {
    if (!dragging.current || !containerRef.current) return
    const totalH = containerRef.current.clientHeight
    const delta = e.clientY - startY.current
    const deltaRatio = delta / totalH
    const newRatio = Math.min(
      Math.max(startRatio.current + deltaRatio, minTopPx / totalH),
      1 - minBottomPx / totalH
    )
    setTopRatio(newRatio)
  }, [minTopPx, minBottomPx])

  const onMouseUp = useCallback(() => {
    dragging.current = false
    setIsDragging(false)
  }, [])

  useEffect(() => {
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
  }, [onMouseMove, onMouseUp])

  return (
    <div ref={containerRef} className="flex flex-col h-full overflow-hidden">
      {/* Top pane */}
      <div style={{ height: `${topRatio * 100}%`, overflow: 'hidden', minHeight: minTopPx }}>
        {topContent}
      </div>

      {/* Drag handle */}
      <div
        className={`resize-handle ${isDragging ? 'dragging' : ''}`}
        onMouseDown={onMouseDown}
      />

      {/* Bottom pane */}
      <div style={{ flex: 1, overflow: 'hidden', minHeight: minBottomPx }}>
        {bottomContent}
      </div>
    </div>
  )
}
