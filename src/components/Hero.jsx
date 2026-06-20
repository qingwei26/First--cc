import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import DraggableBadge from './DraggableBadge'

function Hero() {
  const [videoError, setVideoError] = useState(false)
  const videoRef = useRef(null)

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.75
    }
  }, [])

  return (
    <section className="hero">
      <div className="hero-bg">
        {!videoError && (
          <video
            ref={videoRef}
            className="hero-video"
            autoPlay
            muted
            loop
            playsInline
            onError={() => setVideoError(true)}
            poster="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1920&h=1080&fit=crop"
          >
            <source
              src="https://videos.pexels.com/video-files/3121456/3121456-hd_1920_1080_25fps.mp4"
              type="video/mp4"
            />
          </video>
        )}
        <div className="bg-overlay"></div>
      </div>

      <div className="hero-content">
        {/* 右上角小标签 */}
        <motion.div
          className="hero-tags"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <span>VISUAL DESIGNER</span>
          <span className="hero-tag-dot"></span>
          <span>BRAND DESIGNER</span>
        </motion.div>

        {/* 超大标题 */}
        <motion.div
          className="hero-mega-title"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
        >
          <h1>KAIYUE</h1>
        </motion.div>

        {/* 中间信息栏 */}
        <motion.div
          className="hero-info-bar"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.7 }}
        >
          <div className="hero-info-left">
            <span className="hero-info-line"></span>
          </div>
          <div className="hero-info-center">
            <span>@zhongkaiyue</span>
          </div>
          <div className="hero-info-right">
            <span>钟凯悦</span>
          </div>
        </motion.div>

        {/* 环形装饰文字 */}
        <motion.div
          className="hero-circle-text"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.9 }}
        >
          <svg viewBox="0 0 200 200" width="140" height="140">
            <defs>
              <path
                id="circlePath"
                d="M 100, 100 m -75, 0 a 75,75 0 1,1 150,0 a 75,75 0 1,1 -150,0"
              />
            </defs>
            <text fill="rgba(201, 169, 110, 0.6)" fontSize="13.5" fontWeight="500" letterSpacing="3">
              <textPath href="#circlePath">
                VISUAL DESIGNER • BRAND DESIGNER • AI DESIGNER •
              </textPath>
            </text>
          </svg>
        </motion.div>

        {/* CTA 按钮 */}
        <motion.div
          className="hero-buttons"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.1 }}
        >
          <a href="#projects" className="btn-primary">
            查看作品
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </a>
        </motion.div>
      </div>

      <DraggableBadge />

      <motion.div
        className="hero-scroll"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.4 }}
      >
        <div className="scroll-indicator"></div>
      </motion.div>
    </section>
  )
}

export default Hero
