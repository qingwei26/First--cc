function Header() {
  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: 'rgba(10,10,26,0.85)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(255,255,255,0.08)',
      padding: '12px 24px'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '36px', height: '36px', borderRadius: '10px',
          background: 'linear-gradient(135deg,#dc2626,#d97706)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '18px'
        }}>🎭</div>
        <h1 style={{ color: '#fff', fontWeight: 700, fontSize: '17px', letterSpacing: '0.5px' }}>
          非遗戏曲舞台 AI 生成器
        </h1>
      </div>
    </header>
  );
}

export default Header;
