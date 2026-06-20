import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

function About() {
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
      { threshold: 0.15 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  const stats = [
    { value: '20+', label: '设计项目' },
    { value: '8条', label: '短视频作品' },
    { value: '2w+', label: '单条播放量' },
  ]

  return (
    <section id="about" ref={sectionRef} className="about">
      <div className="container">
        <div className="about-grid">
          <motion.div
            className="about-info"
            initial={{ opacity: 0, x: 40 }}
            animate={isVisible ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="section-label">关于我</div>
            <h2 className="about-name">钟凯悦</h2>

            <p className="about-text">
              就读于河北美术学院影视艺术学院戏剧影视美术设计专业，系统学习影视场景设计、AIGC动漫手办设计与戏剧舞台设计。具备扎实的艺术功底与跨媒介创作能力。
            </p>
            <p className="about-text">
              精通 Photoshop 平面视觉设计，擅长产品、IP与活动类海报及宣传物料制作；熟练运用 Blender 进行废土风、科幻、古风等多风格三维影视场景设计；拥有话剧舞台剧微缩模型制作经验，精通空间搭建与材质表现。
            </p>
            <p className="about-text">
              以灵感拼贴为核心进行视觉创意表达，能精准围绕主题与调性完成风格定调，独立完成从概念构思到视觉落地的全流程创作。
            </p>

            <motion.div
              className="about-stats"
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              {stats.map((stat, index) => (
                <div key={index} className="stat-item">
                  <span className="stat-value">{stat.value}</span>
                  <span className="stat-label">{stat.label}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default About
