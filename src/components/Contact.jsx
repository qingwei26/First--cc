import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Phone, MapPin } from 'lucide-react'

function Contact() {
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

  const contacts = [
    {
      icon: Mail,
      label: '邮箱',
      value: '3132880135@qq.com',
      href: 'mailto:3132880135@qq.com',
    },
    {
      icon: Phone,
      label: '电话',
      value: '15531043148',
      href: 'tel:15531043148',
    },
    {
      icon: MapPin,
      label: '地址',
      value: '河北美术学院',
      href: null,
    },
  ]

  return (
    <section id="contact" ref={sectionRef} className="contact">
      <div className="contact-bg-deco">
        <div className="contact-deco-circle"></div>
        <div className="contact-deco-circle"></div>
        <div className="contact-deco-circle"></div>
      </div>

      <div className="container">
        <div className="contact-content">
          <motion.div
            className="contact-label"
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            联系方式
          </motion.div>

          <motion.h2
            className="contact-title"
            initial={{ opacity: 0, y: 30 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            期待与你合作
          </motion.h2>

          <motion.p
            className="contact-desc"
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            如果你对舞台设计、产品视觉设计或创意视觉执行有需求，欢迎随时联系我，让我们一起创造精彩的视觉作品。
          </motion.p>

          <motion.div
            className="contact-links-grid"
            initial={{ opacity: 0, y: 30 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {contacts.map((contact, index) => {
              const Icon = contact.icon
              const Wrapper = contact.href ? 'a' : 'div'
              return (
                <Wrapper
                  key={index}
                  href={contact.href || undefined}
                  className="contact-card"
                >
                  <div className="contact-card-icon">
                    <Icon size={28} strokeWidth={1.5} />
                  </div>
                  <span className="contact-card-label">{contact.label}</span>
                  <span className="contact-card-value">{contact.value}</span>
                </Wrapper>
              )
            })}
          </motion.div>

          <motion.div
            className="contact-footer"
            initial={{ opacity: 0 }}
            animate={isVisible ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <p>钟凯悦 © {new Date().getFullYear()} — 视觉设计师作品集</p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default Contact
