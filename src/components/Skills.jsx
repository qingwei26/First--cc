import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

const PsIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <rect width="32" height="32" rx="6" fill="#001E36"/>
    <text x="5" y="24" fill="#31A8FF" fontSize="19" fontWeight="bold" fontFamily="Arial, Helvetica, sans-serif">Ps</text>
  </svg>
)

const skills = [
  {
    id: 1,
    title: '平面视觉设计',
    icon: PsIcon,
    description: '精通 Photoshop，擅长产品、IP、活动类海报与宣传物料制作，熟悉各类营销视觉输出规范。',
    tags: ['海报设计', '品牌物料', 'IP设计', '排版'],
    tools: [],
  },
  {
    id: 2,
    title: '三维场景设计',
    icon: '/images/blender.jpg',
    description: '熟练运用 Blender 制作废土风、科幻、古风等多风格影视场景，擅长光影、构图与氛围营造。',
    tags: ['Blender', '场景建模', '渲染合成', '氛围设计'],
    tools: [],
  },
  {
    id: 3,
    title: '模型与空间设计',
    icon: '/images/即梦.jpg',
    description: '拥有话剧舞台剧微缩模型制作经验，精通空间搭建、材质表现与舞台美术方案设计。',
    tags: ['微缩模型', '空间搭建', '材质表现', '舞台美术'],
    tools: [],
  },
  {
    id: 4,
    title: '视觉创意定位',
    icon: '/images/花瓣.jpg',
    description: '擅长拼贴式创意设计，结合主题与调性完成风格定调，为营销与IP打造专属视觉方案。',
    tags: ['灵感拼贴', '风格定调', '视觉策略', '创意构思'],
    tools: [],
  },
  {
    id: 5,
    title: '绘画与手绘',
    icon: '/images/procreate.jpg',
    description: '具备半厚涂绘画能力，能够将手绘质感融入数字视觉，增强作品的温度与独特性。',
    tags: ['半厚涂', '数字绘画', '手绘质感'],
    tools: [],
  },
  {
    id: 6,
    title: '视频剪辑',
    icon: '/images/剪影.jpg',
    description: '熟练使用剪映与 Premiere 进行视频剪辑与后期制作，具备短视频平台内容创作经验。',
    tags: ['短视频', '后期剪辑', '节奏把控'],
    tools: [],
  },
]

function Skills() {
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
    <section id="skills" ref={sectionRef} className="skills">
      <div className="container">
        <motion.div
          style={{ textAlign: 'center', marginBottom: '80px' }}
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <div className="section-label">专业技能</div>
          <h2 className="section-title">我的能力</h2>
        </motion.div>

        <div className="skills-grid">
          {skills.map((skill, index) => {
            const SkillIcon = skill.icon
            return (
              <motion.div
                key={skill.id}
                className="skill-card"
                initial={{ opacity: 0, y: 30 }}
                animate={isVisible ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.1 * index }}
              >
                <div className="skill-icon">
                  {typeof skill.icon === 'string' ? (
                    <img src={skill.icon} alt={skill.title} width={48} height={48} style={{ borderRadius: '12px', objectFit: 'cover', display: 'block' }} />
                  ) : (
                    <SkillIcon size={48} strokeWidth={1.5} />
                  )}
                </div>
                <h3 className="skill-name">{skill.title}</h3>
                <p className="skill-desc">{skill.description}</p>

                {skill.tools.length > 0 && (
                  <div className="skill-tools">
                    {skill.tools.map((tool, toolIndex) => {
                      const ToolIcon = tool.Icon
                      return (
                        <div
                          key={toolIndex}
                          className="skill-tool"
                          title={tool.name}
                        >
                          <ToolIcon size={18} />
                        </div>
                      )
                    })}
                  </div>
                )}

                <div className="skill-tags">
                  {skill.tags.map((tag, tagIndex) => (
                    <span key={tagIndex} className="skill-tag">
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default Skills
