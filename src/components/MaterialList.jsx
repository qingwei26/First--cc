import { useState } from 'react';

// 材料部位CSS示意图（图片加载失败时作为备用）
function MaterialFallback({ type }) {
  const common = {
    width: '100%', height: '100%', minHeight: '180px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    position: 'relative', overflow: 'hidden',
  };

  if (type === 'floor') {
    return (
      <div style={{ ...common, background: 'linear-gradient(180deg, #5c4033 0%, #4a332a 100%)' }}>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-evenly' }}>
          {[0,1,2,3,4].map(i => (
            <div key={i} style={{ height: '1px', background: 'rgba(0,0,0,0.3)', width: '100%' }} />
          ))}
        </div>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', justifyContent: 'space-evenly' }}>
          {[0,1,2,3,4,5].map(i => (
            <div key={i} style={{ width: '1px', background: 'rgba(0,0,0,0.2)', height: '100%' }} />
          ))}
        </div>
        <span style={{ position: 'relative', color: 'rgba(255,255,255,0.35)', fontSize: '28px' }}>🪵</span>
      </div>
    );
  }
  if (type === 'backdrop') {
    return (
      <div style={{ ...common, background: 'linear-gradient(180deg, #1e3a5f 0%, #0f172a 100%)' }}>
        <div style={{ position: 'absolute', bottom: '20px', left: '20%', width: '60%', height: '4px', background: 'rgba(255,255,255,0.15)', borderRadius: '2px' }} />
        <div style={{ position: 'absolute', bottom: '10px', left: '25%', width: '4px', height: '20px', background: 'rgba(255,255,255,0.12)', borderRadius: '2px' }} />
        <div style={{ position: 'absolute', bottom: '10px', right: '25%', width: '4px', height: '20px', background: 'rgba(255,255,255,0.12)', borderRadius: '2px' }} />
        <span style={{ position: 'relative', color: 'rgba(255,255,255,0.35)', fontSize: '28px' }}>🏛️</span>
      </div>
    );
  }
  if (type === 'lighting') {
    return (
      <div style={{ ...common, background: 'linear-gradient(180deg, #0f0f1e 0%, #1a1a2e 100%)' }}>
        <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', width: '32px', height: '32px', borderRadius: '50%', background: 'radial-gradient(circle, #fbbf24 0%, #d97706 70%)', boxShadow: '0 0 20px rgba(251,191,36,0.4)' }} />
        <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', width: '4px', height: '40px', background: 'rgba(255,255,255,0.15)', marginTop: '-40px' }} />
        <div style={{ position: 'absolute', top: 'calc(20% + 32px)', left: '50%', transform: 'translateX(-50%)', width: '60px', height: '60px', background: 'conic-gradient(from 180deg at 50% 0%, rgba(251,191,36,0.15) 0deg, transparent 60deg, transparent 300deg, rgba(251,191,36,0.15) 360deg)' }} />
        <span style={{ position: 'relative', color: 'rgba(255,255,255,0.35)', fontSize: '28px', marginTop: '40px' }}>💡</span>
      </div>
    );
  }
  if (type === 'curtain') {
    return (
      <div style={{ ...common, background: 'linear-gradient(180deg, #7f1d1d 0%, #450a0a 100%)' }}>
        <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0, opacity: 0.2 }}>
          {[0,1,2,3,4].map(i => (
            <path key={i} d={`M ${i * 25}% 0 Q ${i * 25 + 12.5}% 40 ${i * 25}% 100`} stroke="rgba(255,255,255,0.3)" strokeWidth="2" fill="none" />
          ))}
        </svg>
        <span style={{ position: 'relative', color: 'rgba(255,255,255,0.35)', fontSize: '28px' }}>🎭</span>
      </div>
    );
  }
  return (
    <div style={{ ...common, background: '#0f0f1e' }}>
      <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '28px' }}>📦</span>
    </div>
  );
}

function LazyImage({ src, alt, style, fallbackType }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div style={{ position: 'relative', ...style }}>
      {!loaded && !error && (
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(90deg, #1a1a2e 25%, #252540 50%, #1a1a2e 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.5s infinite',
          borderRadius: style?.borderRadius || '0px',
        }}>
          <div style={{
            position: 'absolute', inset: 0, display: 'flex',
            alignItems: 'center', justifyContent: 'center', color: '#4b5563',
            fontSize: '12px'
          }}>
            ⏳
          </div>
        </div>
      )}
      {error && (
        <div style={{ position: 'absolute', inset: 0 }}>
          <MaterialFallback type={fallbackType} />
        </div>
      )}
      <img
        src={src}
        alt={alt}
        style={{ ...style, opacity: loaded ? 1 : 0, transition: 'opacity 0.3s', display: error ? 'none' : 'block' }}
        onLoad={() => { setLoaded(true); setError(false); }}
        onError={() => { setError(true); setLoaded(false); }}
      />
      <style>{`@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }`}</style>
    </div>
  );
}

function MaterialList({ dims, budget, budgetValue, materialImages, genre, playName }) {
  const L = dims?.l || 10;
  const W = dims?.w || 8;
  const H = dims?.h || 6;
  const area = L * W;
  const perimeter = (L + W) * 2;

  const budgetMultiplier = budget === 'custom' && budgetValue > 0
    ? (budgetValue < 5 ? 0.6 : budgetValue < 15 ? 1.0 : budgetValue < 30 ? 1.4 : 2.0)
    : ({ low: 0.6, medium: 1.0, high: 1.4, ultra: 2.0 }[budget] || 1.0);

  const fmt = (n) => Number.isInteger(n) ? n : n.toFixed(1);

  // 电商实物图搜索链接
  const makeShopLinks = (keyword) => [
    { name: '淘宝', url: `https://s.taobao.com/search?q=${encodeURIComponent(keyword)}`, color: '#ff5000' },
    { name: '京东', url: `https://search.jd.com/Search?keyword=${encodeURIComponent(keyword)}&enc=utf-8`, color: '#e4393c' },
    { name: '拼多多', url: `https://mobile.yangkeduo.com/search_result.html?search_key=${encodeURIComponent(keyword)}`, color: '#e02e24' },
    { name: '1688', url: `https://s.1688.com/selloffer/offer_search.htm?keywords=${encodeURIComponent(keyword)}`, color: '#ff6000' },
  ];

  // 根据剧种生成专属材料清单
  const getGenreParts = () => {
    // 皮影戏极简材料
    if (genre === 'piying') {
      return [
        {
          key: 'screen',
          name: '皮影幕布',
          emoji: '幕',
          color: '#3b82f6',
          bg: 'rgba(59,130,246,0.15)',
          desc: `幕布尺寸 ${fmt(W)}m×${fmt(H)}m`,
          searchKeyword: '皮影戏幕布 白色纱幕',
          img: materialImages?.backdrop,
          items: [
            { name: '白色半透明纱幕', quantity: fmt(Math.ceil(W * H * 1.1)) + '㎡', unit: '㎡', purpose: '皮影戏投影幕布' },
            { name: '幕布框架（木框/金属框）', quantity: '1套', unit: '套', purpose: '支撑幕布的框架结构' },
            { name: '幕布挂钩/绑带', quantity: fmt(Math.ceil((W + H) * 2)), unit: '个', purpose: '固定幕布' },
          ],
        },
        {
          key: 'lighting',
          name: '灯光设备',
          emoji: '💡',
          color: '#fbbf24',
          bg: 'rgba(251,191,36,0.15)',
          desc: '皮影戏专用光源',
          searchKeyword: '皮影戏灯光 LED灯',
          img: materialImages?.lighting,
          items: [
            { name: 'LED射灯（暖白光）', quantity: '2盏', unit: '盏', purpose: '幕布后方光源' },
            { name: '灯架/支架', quantity: '2个', unit: '个', purpose: '支撑灯具' },
            { name: '调光器', quantity: '1个', unit: '个', purpose: '调节灯光亮度' },
            { name: '电源线', quantity: fmt(Math.ceil(10 * budgetMultiplier)) + 'm', unit: '米', purpose: '灯具供电' },
          ],
        },
        {
          key: 'puppet',
          name: '皮影材料',
          emoji: '🎭',
          color: '#ec4899',
          bg: 'rgba(236,72,153,0.15)',
          desc: '皮影制作原材料',
          searchKeyword: '皮影戏材料 牛皮 雕刻工具',
          img: null,
          items: [
            { name: '牛皮/羊皮材料', quantity: '5张', unit: '张', purpose: '雕刻皮影人物' },
            { name: '皮影雕刻工具套装', quantity: '1套', unit: '套', purpose: '刻刀、凿子等' },
            { name: '皮影控制杆', quantity: fmt(Math.ceil(10 * budgetMultiplier)), unit: '根', purpose: '操控皮影' },
            { name: '皮影上色颜料', quantity: '1套', unit: '套', purpose: '给皮影上色' },
          ],
        },
      ];
    }

    // 京剧专用材料
    if (genre === 'jingju') {
      return [
        {
          key: 'floor',
          name: '舞台地板',
          emoji: '🪵',
          color: '#f59e0b',
          bg: 'rgba(245,158,11,0.15)',
          desc: `舞台面积 ${fmt(area)}㎡（${L}m×${W}m）`,
          searchKeyword: '舞台专用木地板 地胶',
          img: materialImages?.floor,
          items: [
            { name: '舞台专用木地板', quantity: fmt(Math.ceil(area * 1.05)) + '㎡', unit: '㎡', purpose: '舞台地面铺设（含5%损耗）' },
            { name: '松木龙骨', quantity: fmt(Math.ceil(perimeter * 0.6 * budgetMultiplier)) + '根', unit: '根', purpose: '地板下方龙骨支撑' },
            { name: '舞台专用地胶（防滑）', quantity: fmt(Math.ceil(area * 0.5)), unit: '卷', purpose: '武戏区域防滑处理' },
          ],
        },
        {
          key: 'backdrop',
          name: '守旧与背景',
          emoji: '🏛️',
          color: '#3b82f6',
          bg: 'rgba(59,130,246,0.15)',
          desc: '京剧传统守旧背景',
          searchKeyword: '京剧守旧 舞台背景',
          img: materialImages?.backdrop,
          items: [
            { name: '京剧守旧底幕', quantity: fmt(Math.ceil(W * H * 1.2)) + '㎡', unit: '㎡', purpose: '传统绣花纹底幕' },
            { name: '出将入相门帘', quantity: '2套', unit: '套', purpose: '舞台两侧出入口门帘' },
            { name: '红漆柱式台框', quantity: '4根', unit: '根', purpose: '台口装饰立柱' },
          ],
        },
        {
          key: 'lighting',
          name: '灯光与吊挂',
          emoji: '💡',
          color: '#fbbf24',
          bg: 'rgba(251,191,36,0.15)',
          desc: `舞台面积 ${fmt(area)}㎡`,
          searchKeyword: 'LED帕灯 舞台灯光',
          img: materialImages?.lighting,
          items: [
            { name: 'LED帕灯', quantity: fmt(Math.max(6, Math.ceil(area / 5 * budgetMultiplier))) + '盏', unit: '盏', purpose: '基础面光/顶光' },
            { name: '聚光灯', quantity: fmt(Math.max(3, Math.ceil(area / 10 * budgetMultiplier))) + '盏', unit: '盏', purpose: '主角造型光' },
            { name: '铝合金灯光桁架', quantity: fmt(Math.ceil(W * 1.2)) + 'm', unit: '米', purpose: '顶部灯光吊挂横梁' },
            { name: '调光台', quantity: '1台', unit: '台', purpose: '灯光控制' },
          ],
        },
        {
          key: 'props',
          name: '京剧道具',
          emoji: '🛠️',
          color: '#10b981',
          bg: 'rgba(16,185,129,0.15)',
          desc: '京剧一桌二椅及兵器',
          searchKeyword: '京剧道具 一桌二椅 兵器',
          img: null,
          items: [
            { name: '京剧一桌二椅', quantity: '1套', unit: '套', purpose: '传统舞台桌椅' },
            { name: '京剧兵器架', quantity: '1个', unit: '个', purpose: '放置兵器' },
            { name: '京剧兵器（刀枪剑戟）', quantity: '6套', unit: '套', purpose: '武戏道具' },
            { name: '马鞭/折扇', quantity: '4套', unit: '套', purpose: '文戏道具' },
          ],
        },
      ];
    }

    // 越剧专用材料
    if (genre === 'yueju') {
      return [
        {
          key: 'floor',
          name: '舞台地板',
          emoji: '🪵',
          color: '#f59e0b',
          bg: 'rgba(245,158,11,0.15)',
          desc: `舞台面积 ${fmt(area)}㎡（${L}m×${W}m）`,
          searchKeyword: '舞台专用木地板',
          img: materialImages?.floor,
          items: [
            { name: '舞台专用木地板', quantity: fmt(Math.ceil(area * 1.05)) + '㎡', unit: '㎡', purpose: '舞台地面铺设' },
            { name: '松木龙骨', quantity: fmt(Math.ceil(perimeter * 0.6 * budgetMultiplier)) + '根', unit: '根', purpose: '地板支撑' },
          ],
        },
        {
          key: 'backdrop',
          name: '背景大屏',
          emoji: '🖥️',
          color: '#3b82f6',
          bg: 'rgba(59,130,246,0.15)',
          desc: `LED大屏 ${fmt(W)}m×${fmt(H)}m`,
          searchKeyword: 'LED大屏 舞台背景',
          img: materialImages?.backdrop,
          items: [
            { name: 'LED显示屏（P3/P4）', quantity: fmt(Math.ceil(W * H)) + '㎡', unit: '㎡', purpose: '舞台背景大屏' },
            { name: '大屏控制软件', quantity: '1套', unit: '套', purpose: '大屏内容播放控制' },
            { name: '大屏支架', quantity: '1套', unit: '套', purpose: '支撑LED大屏' },
          ],
        },
        {
          key: 'lighting',
          name: '灯光设备',
          emoji: '💡',
          color: '#fbbf24',
          bg: 'rgba(251,191,36,0.15)',
          desc: `舞台面积 ${fmt(area)}㎡`,
          searchKeyword: 'LED帕灯 舞台灯光',
          img: materialImages?.lighting,
          items: [
            { name: 'LED帕灯', quantity: fmt(Math.max(8, Math.ceil(area / 5 * budgetMultiplier))) + '盏', unit: '盏', purpose: '基础面光' },
            { name: 'LED染色灯', quantity: fmt(Math.max(4, Math.ceil(area / 8 * budgetMultiplier))) + '盏', unit: '盏', purpose: '场景染色' },
            { name: '成像灯', quantity: fmt(Math.max(2, Math.ceil(area / 12 * budgetMultiplier))) + '盏', unit: '盏', purpose: '人物造型光' },
            { name: '灯光桁架', quantity: fmt(Math.ceil(W * 1.2)) + 'm', unit: '米', purpose: '灯光吊挂' },
          ],
        },
        {
          key: 'curtain',
          name: '幕布',
          emoji: '🎭',
          color: '#ec4899',
          bg: 'rgba(236,72,153,0.15)',
          desc: '越剧舞台幕布',
          searchKeyword: '舞台幕布 天鹅绒',
          img: materialImages?.curtain,
          items: [
            { name: '天鹅绒大幕', quantity: fmt(Math.ceil(W * H * 1.3)) + '㎡', unit: '㎡', purpose: '主舞台天幕' },
            { name: '侧幕条', quantity: fmt(Math.ceil(L * H * 2 * 1.2)) + '㎡', unit: '㎡', purpose: '舞台两侧遮挡' },
            { name: '幕布轨道', quantity: fmt(Math.ceil(W * 1.1)) + 'm', unit: '米', purpose: '大幕开合轨道' },
          ],
        },
      ];
    }

    // 秦腔专用材料
    if (genre === 'qinqiang') {
      return [
        {
          key: 'floor',
          name: '舞台地板',
          emoji: '🪵',
          color: '#f59e0b',
          bg: 'rgba(245,158,11,0.15)',
          desc: `舞台面积 ${fmt(area)}㎡（${L}m×${W}m），需耐磨防滑`,
          searchKeyword: '舞台专用木地板 耐磨',
          img: materialImages?.floor,
          items: [
            { name: '舞台专用木地板', quantity: fmt(Math.ceil(area * 1.1)) + '㎡', unit: '㎡', purpose: '舞台地面铺设（含10%损耗，武戏需求）' },
            { name: '松木龙骨', quantity: fmt(Math.ceil(perimeter * 0.8 * budgetMultiplier)) + '根', unit: '根', purpose: '地板支撑，加固处理' },
            { name: '舞台地胶（加厚）', quantity: fmt(Math.ceil(area * 0.8)), unit: '卷', purpose: '大面积防滑处理' },
          ],
        },
        {
          key: 'backdrop',
          name: '底幕与景片',
          emoji: '🏛️',
          color: '#3b82f6',
          bg: 'rgba(59,130,246,0.15)',
          desc: '秦腔传统底幕',
          searchKeyword: '秦腔底幕 舞台背景',
          img: materialImages?.backdrop,
          items: [
            { name: '秦腔传统底幕（守旧）', quantity: fmt(Math.ceil(W * H * 1.2)) + '㎡', unit: '㎡', purpose: '传统刺绣底幕' },
            { name: '景片（宫殿/公堂）', quantity: '4块', unit: '块', purpose: '场景切换景片' },
            { name: '景片支架', quantity: '4个', unit: '个', purpose: '支撑景片' },
          ],
        },
        {
          key: 'lighting',
          name: '灯光设备',
          emoji: '💡',
          color: '#fbbf24',
          bg: 'rgba(251,191,36,0.15)',
          desc: `舞台面积 ${fmt(area)}㎡`,
          searchKeyword: 'LED帕灯 舞台灯光',
          img: materialImages?.lighting,
          items: [
            { name: 'LED帕灯', quantity: fmt(Math.max(8, Math.ceil(area / 5 * budgetMultiplier))) + '盏', unit: '盏', purpose: '基础面光' },
            { name: '聚光灯', quantity: fmt(Math.max(4, Math.ceil(area / 10 * budgetMultiplier))) + '盏', unit: '盏', purpose: '人物造型光' },
            { name: '灯光桁架', quantity: fmt(Math.ceil(W * 1.2)) + 'm', unit: '米', purpose: '灯光吊挂' },
          ],
        },
        {
          key: 'props',
          name: '秦腔道具',
          emoji: '🛠️',
          color: '#10b981',
          bg: 'rgba(16,185,129,0.15)',
          desc: '秦腔公案与兵器',
          searchKeyword: '秦腔道具 虎头铡 兵器',
          img: null,
          items: [
            { name: '公堂案桌', quantity: '1套', unit: '套', purpose: '审案场景道具' },
            { name: '虎头铡道具', quantity: '1个', unit: '个', purpose: '铡美案等剧目专用' },
            { name: '秦腔兵器（刀枪）', quantity: '8套', unit: '套', purpose: '武戏道具' },
            { name: '刑具道具', quantity: '4套', unit: '套', purpose: '枷锁等' },
          ],
        },
      ];
    }

    // 默认通用材料
    return [
      {
        key: 'floor',
        name: '舞台地板',
        emoji: '🪵',
        color: '#f59e0b',
        bg: 'rgba(245,158,11,0.15)',
        desc: `舞台面积 ${fmt(area)}㎡（${L}m×${W}m）`,
        searchKeyword: '舞台专用木地板 地胶',
        img: materialImages?.floor,
        items: [
          { name: '舞台专用木地板', quantity: fmt(Math.ceil(area * 1.05)) + '㎡', unit: '㎡', purpose: '舞台地面铺设（含5%损耗）' },
          { name: '松木龙骨', quantity: fmt(Math.ceil(perimeter * 0.6 * budgetMultiplier)) + '根', unit: '根', purpose: '地板下方龙骨支撑，间距400mm' },
          { name: '多层胶合板基层', quantity: fmt(Math.ceil(area * 1.05)) + '㎡', unit: '㎡', purpose: '龙骨上找平层' },
          { name: '木楔子/垫片', quantity: fmt(Math.ceil(area * 0.5 * budgetMultiplier)), unit: '个', purpose: '龙骨调平' },
          { name: '地板钉', quantity: fmt(Math.ceil(area * 8 * budgetMultiplier)), unit: '枚', purpose: '固定地板' },
          { name: '舞台专用地胶（防滑）', quantity: fmt(Math.ceil(area * 0.3)), unit: '卷', purpose: '重点区域防滑处理' },
        ],
      },
      {
        key: 'backdrop',
        name: '背景板与景片',
        emoji: '🏛️',
        color: '#3b82f6',
        bg: 'rgba(59,130,246,0.15)',
        desc: `背景面积 ${fmt(W * H)}㎡（宽${W}m×高${H}m）`,
        searchKeyword: '舞台背景板 轻钢龙骨',
        img: materialImages?.backdrop,
        items: [
          { name: '轻钢龙骨框架', quantity: fmt(Math.ceil((W + H) * 2 * 1.2)) + 'm', unit: '米', purpose: '背景板主框架' },
          { name: '多层板/密度板', quantity: fmt(Math.ceil(W * H * 1.1)) + '㎡', unit: '㎡', purpose: '背景板面板（含10%裁切损耗）' },
          { name: '自攻螺丝', quantity: fmt(Math.ceil(W * H * 3 * budgetMultiplier)), unit: '枚', purpose: '板材固定' },
          { name: '合页/插销', quantity: fmt(Math.ceil((W / 2) * budgetMultiplier)), unit: '套', purpose: '景片拼接连接件' },
          { name: '配重沙袋', quantity: fmt(Math.ceil((W / 3) * budgetMultiplier)), unit: '个', purpose: '景片底部防倾倒' },
          { name: '环保乳胶漆/舞台漆', quantity: fmt(Math.ceil(W * H * 0.25 * budgetMultiplier)) + 'L', unit: '升', purpose: '背景板上色' },
        ],
      },
      {
        key: 'lighting',
        name: '灯光与吊挂',
        emoji: '💡',
        color: '#fbbf24',
        bg: 'rgba(251,191,36,0.15)',
        desc: `舞台面积 ${fmt(area)}㎡，建议每${fmt(Math.max(4, area/6))}㎡一盏主灯`,
        searchKeyword: 'LED帕灯 舞台灯光 桁架',
        img: materialImages?.lighting,
        items: [
          { name: 'LED帕灯', quantity: fmt(Math.max(4, Math.ceil(area / 6 * budgetMultiplier))) + '盏', unit: '盏', purpose: '基础面光/顶光' },
          { name: '聚光灯/成像灯', quantity: fmt(Math.max(2, Math.ceil(area / 12 * budgetMultiplier))) + '盏', unit: '盏', purpose: '主角造型光' },
          { name: 'LED灯带', quantity: fmt(Math.ceil(perimeter * 1.5 * budgetMultiplier)) + 'm', unit: '米', purpose: '台口/轮廓装饰灯带' },
          { name: '铝合金灯光桁架', quantity: fmt(Math.ceil(W * 1.2)) + 'm', unit: '米', purpose: '顶部灯光吊挂横梁' },
          { name: '灯钩/保险链', quantity: fmt(Math.ceil(area / 4 * budgetMultiplier)) + '套', unit: '套', purpose: '灯具安全吊挂' },
          { name: '调光台/控台', quantity: '1台', unit: '台', purpose: '灯光控制（可租赁）' },
          { name: '电缆线（2.5mm²）', quantity: fmt(Math.ceil(perimeter * 2 * budgetMultiplier)) + 'm', unit: '米', purpose: '灯具供电' },
        ],
      },
      {
        key: 'curtain',
        name: '幕布与侧翼',
        emoji: '🎭',
        color: '#ec4899',
        bg: 'rgba(236,72,153,0.15)',
        desc: `大幕宽${fmt(W)}m、高${fmt(H)}m；侧幕约${fmt(L * H * 2)}㎡`,
        searchKeyword: '舞台幕布 天鹅绒 阻燃',
        img: materialImages?.curtain,
        items: [
          { name: '天鹅绒/丝绒大幕', quantity: fmt(Math.ceil(W * H * 1.3)) + '㎡', unit: '㎡', purpose: '主舞台天幕（含褶皱余量）' },
          { name: '侧幕条（左+右）', quantity: fmt(Math.ceil(L * H * 2 * 1.2 * budgetMultiplier)) + '㎡', unit: '㎡', purpose: '舞台两侧遮挡' },
          { name: '檐幕/横条', quantity: fmt(Math.ceil(W * 1.5 * budgetMultiplier)) + '㎡', unit: '㎡', purpose: '舞台上沿遮挡灯光设备' },
          { name: '幕布轨道', quantity: fmt(Math.ceil(W * 1.1)) + 'm', unit: '米', purpose: '大幕开合轨道' },
          { name: '轨道滑轮组', quantity: fmt(Math.ceil(W / 2 * budgetMultiplier)), unit: '套', purpose: '幕布吊挂滑动' },
          { name: '幕布绑带/束带', quantity: fmt(Math.ceil((W + H) * budgetMultiplier)), unit: '条', purpose: '幕布收束整理' },
        ],
      },
    ];
  };

  const parts = getGenreParts();

  const downloadList = () => {
    let content = `非遗戏曲舞台材料清单\n\n`;
    content += `舞台尺寸: ${L}m(长) × ${W}m(宽) × ${H}m(高)\n`;
    content += `舞台面积: ${fmt(area)}㎡\n`;
    content += `预算级别: ${budget === 'custom' && budgetValue > 0 ? `自定义(${budgetValue}万元)` : budget === 'low' ? '简约(5万以下)' : budget === 'medium' ? '标准(5-15万)' : budget === 'high' ? '精致(15-30万)' : '豪华(30万以上)'}\n`;
    content += `生成时间: ${new Date().toLocaleString('zh-CN')}\n\n`;

    parts.forEach(part => {
      content += `【${part.name}】${part.desc}\n`;
      part.items.forEach(item => {
        content += `  • ${item.name}: ${item.quantity}(${item.unit}) - ${item.purpose}\n`;
      });
      content += '\n';
    });

    content += `【注意事项】\n`;
    content += `  • 以上材料数量为根据 ${L}m×${W}m×${H}m 舞台尺寸与预算级别自动估算\n`;
    content += `  • 实际用量可能因施工细节、品牌规格略有调整\n`;
    content += `  • 木材及布料建议做防火阻燃处理，符合舞台安全标准\n`;
    content += `  • 电气设备需由专业电工安装，确保接地可靠\n`;
    content += `  • 高空作业（灯光架安装）需配备安全防护措施\n`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `stage_materials_${L}x${W}x${H}_${budget}.txt`;
    a.click();
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '20px' }}>📦</span>
          <h4 style={{ color: '#fff', fontWeight: 500 }}>舞台材料清单</h4>
          <span style={{ color: '#6b7280', fontSize: '13px' }}>
            {L}m × {W}m × {H}m · {fmt(area)}㎡
          </span>
        </div>
        <button onClick={downloadList} style={{
          padding: '8px 16px', borderRadius: '8px', border: 'none',
          background: 'linear-gradient(135deg,#d97706,#b45309)', color: '#fff',
          cursor: 'pointer', fontSize: '14px'
        }}>
          ⬇️ 下载清单
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {parts.map(part => (
          <div key={part.key} style={{
            background: 'rgba(255,255,255,0.03)',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.08)',
            overflow: 'hidden'
          }}>
            {/* 部位头部 + 配图 */}
            <div style={{ display: 'flex', gap: '0', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 300px', padding: '16px' }}>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  background: part.bg, padding: '6px 12px', borderRadius: '8px', marginBottom: '8px'
                }}>
                  <span>{part.emoji}</span>
                  <span style={{ color: part.color, fontWeight: 600, fontSize: '14px' }}>{part.name}</span>
                </div>
                <div style={{ color: '#9ca3af', fontSize: '12px', marginBottom: '8px' }}>{part.desc}</div>
                {/* 电商实物图搜索 */}
                {part.searchKeyword && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px', alignItems: 'center' }}>
                    <span style={{ color: '#6b7280', fontSize: '11px' }}>🔍 查看实物图：</span>
                    {makeShopLinks(part.searchKeyword).map((shop, i) => (
                      <a
                        key={i}
                        href={shop.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          fontSize: '11px', padding: '2px 8px', borderRadius: '4px',
                          border: `1px solid ${shop.color}40`, color: shop.color,
                          background: `${shop.color}10`, textDecoration: 'none',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {shop.name}
                      </a>
                    ))}
                  </div>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {part.items.map((item, idx) => (
                    <div key={idx} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      fontSize: '13px', padding: '6px 10px', borderRadius: '6px',
                      background: 'rgba(255,255,255,0.03)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{
                          width: '6px', height: '6px', borderRadius: '50%', background: part.color, flexShrink: 0
                        }} />
                        <span style={{ color: '#d1d5db' }}>{item.name}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                        <span style={{ color: '#6b7280', fontSize: '12px' }}>{item.purpose}</span>
                        <span style={{ color: part.color, fontWeight: 500, whiteSpace: 'nowrap' }}>
                          {item.quantity}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {part.img && (
                <div style={{ flex: '0 0 240px', minHeight: '180px', background: '#0f0f1e' }}>
                  <LazyImage
                    src={part.img}
                    alt={part.name}
                    fallbackType={part.key}
                    style={{ width: '100%', height: '100%', minHeight: '180px', objectFit: 'cover' }}
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div style={{
        background: 'linear-gradient(90deg,rgba(217,119,6,0.1),rgba(234,88,12,0.1))',
        border: '1px solid rgba(217,119,6,0.2)', borderRadius: '12px', padding: '16px', marginTop: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <span style={{ fontSize: '16px' }}>⚠️</span>
          <span style={{ color: '#fbbf24', fontSize: '14px', fontWeight: 500 }}>施工提示</span>
        </div>
        <ul style={{ color: '#9ca3af', fontSize: '13px', paddingLeft: '20px', lineHeight: 1.8 }}>
          <li>以上数量为根据 {L}m×{W}m×{H}m 舞台尺寸自动计算，已含合理施工损耗</li>
          <li>木材及布料必须做防火阻燃处理，符合 GB 20286 舞台材料阻燃标准</li>
          <li>灯光设备安装需由持证电工操作，所有金属构件可靠接地</li>
          <li>背景板高度超过 2.5m 时需加装斜撑或配重，防止倾倒</li>
          <li>建议在正式搭建前进行 1:10 比例模型验证结构可行性</li>
        </ul>
      </div>
    </div>
  );
}

export default MaterialList;
