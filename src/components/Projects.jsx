import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const projects = [
  {
    id: 1,
    title: '《仲夏夜之梦》微缩舞台设计',
    category: '舞台设计',
    description: '以莎士比亚经典戏剧为蓝本，独立完成微缩舞台场景设计与制作，融合复古美学与空间叙事。',
    image: '/images/仲夏夜之梦.jpg',
  },
  {
    id: 2,
    title: '影视IP海报设计',
    category: '平面设计',
    description: '为影视项目与IP角色设计宣传海报，融合主题调性与视觉冲击力，熟悉营销视觉输出规范。',
    images: [
      '/images/孤星计划.jpg',
      '/images/莲花楼.jpg',
      '/images/ROY11.jpg',
      '/images/未标题-1.jpg',
      '/images/双光3.jpg',
      '/images/TOM.jpg',
      '/images/ping.jpg',
      '/images/蝴蝶.jpg',
      '/images/蝴蝶海报.jpg',
      '/images/深海.jpg',
      '/images/水果.jpg',
      '/images/漩涡海报.jpg',
      '/images/报.jpg',
      '/images/玫瑰.jpg',
    ],
  },
  {
    id: 3,
    title: 'Blender 多风格场景设计',
    category: '三维场景',
    description: '使用 Blender 创作废土风、科幻、古风等主题影视场景，擅长光影、构图与氛围营造，输出高品质3D视觉素材。',
    images: [
      '/images/沙漠.png',
      '/images/刺杀.png',
      '/images/科幻.png',
      '/images/建模场景.png',
    ],
  },
  {
    id: 5,
    title: '人物造型与服饰设计',
    category: '造型设计',
    description: '参与校园T台走秀发型造型设计，结合走秀主题、服装风格与舞台视觉效果，定制差异化造型方案。',
    images: [
      '/images/服装.jpg',
      '/images/花冠.jpg',
    ],
  },
  {
    id: 6,
    title: '短视频创作与剪辑',
    category: '视频剪辑',
    description: '在抖音平台发布多条二创视频，单条平均播放量达2w+，擅长视觉节奏把控与叙事剪辑。',
    images: [
      '/images/enemy.jpg',
      '/images/有罪之身.jpg',
    ],
  },
]

function Lightbox({ images, currentIndex, onClose, onChange }) {
  const [index, setIndex] = useState(currentIndex)
  const [direction, setDirection] = useState(0)
  const [dragX, setDragX] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const dragStartX = useRef(0)

  useEffect(() => {
    setIndex(currentIndex)
  }, [currentIndex])

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') goPrev()
      if (e.key === 'ArrowRight') goNext()
    }
    window.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [index])

  const goNext = useCallback(() => {
    if (images.length <= 1) return
    setDirection(1)
    setIndex((i) => (i + 1) % images.length)
  }, [images.length])

  const goPrev = useCallback(() => {
    if (images.length <= 1) return
    setDirection(-1)
    setIndex((i) => (i - 1 + images.length) % images.length)
  }, [images.length])

  const handlePointerDown = (e) => {
    dragStartX.current = e.clientX || e.touches?.[0]?.clientX || 0
    setIsDragging(true)
    setDragX(0)
  }

  const handlePointerMove = (e) => {
    if (!isDragging) return
    const cx = e.clientX || e.touches?.[0]?.clientX || 0
    setDragX(cx - dragStartX.current)
  }

  const handlePointerUp = () => {
    if (!isDragging) return
    setIsDragging(false)
    if (dragX < -80) {
      goNext()
    } else if (dragX > 80) {
      goPrev()
    }
    setDragX(0)
  }

  const variants = {
    enter: (dir) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir) => ({ x: dir > 0 ? -300 : 300, opacity: 0 }),
  }

  const currentImage = images[index]
  const isRotated = currentImage?.includes('莲花楼')

  return (
    <motion.div
      className="lightbox-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      onClick={onClose}
    >
      <button className="lightbox-close" onClick={onClose} aria-label="关闭">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      {images.length > 1 && (
        <>
          <button className="lightbox-arrow lightbox-arrow-left" onClick={(e) => { e.stopPropagation(); goPrev() }} aria-label="上一张">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button className="lightbox-arrow lightbox-arrow-right" onClick={(e) => { e.stopPropagation(); goNext() }} aria-label="下一张">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </>
      )}

      <div
        className="lightbox-stage"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={handlePointerDown}
        onMouseMove={handlePointerMove}
        onMouseUp={handlePointerUp}
        onMouseLeave={handlePointerUp}
        onTouchStart={handlePointerDown}
        onTouchMove={handlePointerMove}
        onTouchEnd={handlePointerUp}
      >
        <AnimatePresence custom={direction} mode="wait">
          <motion.img
            key={index}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            src={currentImage}
            alt=""
            className="lightbox-image"
            style={{
              transform: `translateX(${dragX}px) rotate(${isRotated ? '270deg' : '0deg'})`,
              cursor: isDragging ? 'grabbing' : 'grab',
            }}
            draggable={false}
          />
        </AnimatePresence>
      </div>

      {images.length > 1 && (
        <div className="lightbox-counter">
          {index + 1} / {images.length}
        </div>
      )}
    </motion.div>
  )
}

function ProjectCard({ project, index, isVisible }) {
  const [currentImg, setCurrentImg] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [dragX, setDragX] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const dragStartX = useRef(0)
  const images = project.images || [project.image]

  const goNext = useCallback(() => {
    if (images.length <= 1) return
    setCurrentImg((i) => (i + 1) % images.length)
  }, [images.length])

  const goPrev = useCallback(() => {
    if (images.length <= 1) return
    setCurrentImg((i) => (i - 1 + images.length) % images.length)
  }, [images.length])

  const handlePointerDown = (e) => {
    if (images.length <= 1) return
    dragStartX.current = e.clientX || e.touches?.[0]?.clientX || 0
    setIsDragging(true)
    setDragX(0)
  }

  const handlePointerMove = (e) => {
    if (!isDragging || images.length <= 1) return
    const cx = e.clientX || e.touches?.[0]?.clientX || 0
    setDragX(cx - dragStartX.current)
  }

  const handlePointerUp = () => {
    if (!isDragging) return
    setIsDragging(false)
    if (dragX < -50) {
      goNext()
    } else if (dragX > 50) {
      goPrev()
    }
    setDragX(0)
  }

  const handleDoubleClick = () => {
    setLightboxOpen(true)
  }

  return (
    <>
      <motion.div
        className="project-card"
        initial={{ opacity: 0, y: 40 }}
        animate={isVisible ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.15 * index }}
      >
        <div className="project-gallery">
          <div
            className="gallery-main"
            style={{ cursor: images.length > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in' }}
            onMouseDown={handlePointerDown}
            onMouseMove={handlePointerMove}
            onMouseUp={handlePointerUp}
            onMouseLeave={handlePointerUp}
            onTouchStart={handlePointerDown}
            onTouchMove={handlePointerMove}
            onTouchEnd={handlePointerUp}
            onDoubleClick={handleDoubleClick}
          >
            <AnimatePresence mode="wait">
              <motion.img
                key={currentImg}
                src={images[currentImg]}
                alt={project.title}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                style={{
                  transform: `translateX(${dragX}px) ${images[currentImg].includes('莲花楼') ? 'rotate(270deg)' : ''}`,
                }}
                draggable={false}
              />
            </AnimatePresence>
            {images.length > 1 && (
              <div className="gallery-swipe-hint">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
                <span>滑动切换</span>
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="gallery-thumbs">
              {images.map((img, i) => (
                <button
                  key={i}
                  className={i === currentImg ? 'active' : ''}
                  onClick={() => setCurrentImg(i)}
                >
                  <img src={img} alt="" loading="lazy" />
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="project-info">
          <div className="project-category">{project.category}</div>
          <h3 className="project-title">{project.title}</h3>
          <p className="project-desc">{project.description}</p>
        </div>
      </motion.div>

      <AnimatePresence>
        {lightboxOpen && (
          <Lightbox
            images={images}
            currentIndex={currentImg}
            onClose={() => setLightboxOpen(false)}
            onChange={setCurrentImg}
          />
        )}
      </AnimatePresence>
    </>
  )
}

function Projects() {
  const sectionRef = useRef(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <section id="projects" ref={sectionRef} className="projects">
      <div className="container">
        <motion.div
          className="projects-header"
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <div>
            <div className="section-label">作品案例</div>
            <h2 className="section-title">精选项目</h2>
          </div>
          <p className="projects-subtitle">
            涵盖舞台设计、平面视觉、三维场景与视频剪辑，展现从概念到落地的完整创作能力。
          </p>
        </motion.div>

        <div className="projects-grid">
          {projects.map((project, index) => (
            <ProjectCard
              key={project.id}
              project={project}
              index={index}
              isVisible={isVisible}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export default Projects
