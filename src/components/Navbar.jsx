import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navItems = [
    { label: '关于我', href: '#about' },
    { label: '作品', href: '#projects' },
    { label: '技能', href: '#skills' },
    { label: '联系', href: '#contact' },
  ]

  return (
    <motion.nav
      className={`navbar ${isScrolled ? 'scrolled' : ''}`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
    >
      <div className="container">
        <div className="nav-content">
          <div className="nav-logo">ZY</div>
          <ul className="nav-links">
            {navItems.map((item) => (
              <li key={item.label}>
                <a href={item.href} className="nav-link">
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
          <a href="#contact" className="nav-cta">
            联系我
          </a>
        </div>
      </div>
    </motion.nav>
  )
}

export default Navbar
