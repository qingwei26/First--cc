import { useEffect, useRef, useState } from 'react'

function DraggableBadge() {
  const containerRef = useRef(null)
  const originRef = useRef({ x: 0, y: 0 })
  const [imgError, setImgError] = useState(false)
  const [imgLoaded, setImgLoaded] = useState(false)
  const [scale, setScale] = useState(1)

  // 物理状态
  const angleRef = useRef(0)
  const rotRef = useRef(0)

  const ropeRef = useRef(null)
  const badgeRef = useRef(null)
  const anchorRef = useRef(null)

  // 计算固定点
  useEffect(() => {
    const updateOrigin = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        originRef.current = { x: rect.width * 0.72, y: 0 }
        if (anchorRef.current) {
          anchorRef.current.style.left = `${originRef.current.x}px`
        }
      }
    }
    updateOrigin()
    window.addEventListener('resize', updateOrigin)
    return () => window.removeEventListener('resize', updateOrigin)
  }, [])

  const handleWheel = (e) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? -0.12 : 0.12
    setScale((prev) => {
      const next = prev + delta
      return Math.max(0.5, Math.min(3, next))
    })
  }

  // 时钟式钟摆循环
  useEffect(() => {
    let id
    const L0 = 340

    const loop = () => {
      // 完全静止，不摆动
      const angle = 0
      angleRef.current = angle
      rotRef.current = 0

      const origin = originRef.current

      if (ropeRef.current) {
        // 绳子延长 9px，让它穿过圆环中心（clip-ring 高 18px，中心在顶部下方 9px）
        ropeRef.current.style.height = `${L0 + 9}px`
        ropeRef.current.style.transform = `translateX(${origin.x - 5}px) rotate(0deg)`
      }

      if (badgeRef.current) {
        const cx = origin.x + (L0 + 9) * Math.sin(angle)
        const cy = origin.y + L0 * Math.cos(angle)
        badgeRef.current.style.transform = `translate(${cx - 85}px, ${cy}px)`
      }

      id = requestAnimationFrame(loop)
    }

    id = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(id)
  }, [])

  return (
    <div ref={containerRef} className="badge-constraints">
      <div ref={anchorRef} className="pendulum-anchor" />
      <div ref={ropeRef} className="pendulum-rope">
        <div className="strap-pattern" style={{ top: 40 }} />
        <div className="strap-pattern" style={{ top: 90 }} />
      </div>
      <div
        ref={badgeRef}
        className="pendulum-badge"
      >
        <div className="badge-clip">
          <div className="clip-ring" />
          <div className="clip-hook" />
        </div>
        <div className="badge-card">
          <div
            className={`badge-photo-wrapper ${imgLoaded ? 'loaded' : ''} ${imgError ? 'error' : ''}`}
            onWheel={handleWheel}
          >
            {!imgError ? (
              <img
                className="badge-photo"
                src={'/images/1.jpg'}
                alt="钟凯悦"
                draggable={false}
                style={{ transform: `scale(${scale})` }}
                onLoad={() => setImgLoaded(true)}
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="badge-photo-fallback">照片加载失败</div>
            )}
          </div>
          <div className="badge-card-footer">
            <span className="badge-name">钟凯悦</span>
            <span className="badge-role">Visual Designer</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DraggableBadge
