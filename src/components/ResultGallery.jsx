import { useState } from 'react';
import MaterialList from './MaterialList';

/* ========== 骨架屏图片组件 ========== */
function LazyImage({ src, alt, style, hdSrc }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div style={{ position: 'relative', ...style }}>
      {!loaded && (
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(90deg, #1a1a2e 25%, #252540 50%, #1a1a2e 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.5s infinite',
          borderRadius: style?.borderRadius || '10px',
        }}>
          <div style={{
            position: 'absolute', inset: 0, display: 'flex',
            alignItems: 'center', justifyContent: 'center', color: '#4b5563',
            fontSize: '13px'
          }}>
            ⏳ 图片生成中...
          </div>
        </div>
      )}
      <img
        src={src}
        alt={alt}
        style={{ ...style, opacity: loaded ? 1 : 0, transition: 'opacity 0.3s' }}
        onLoad={() => setLoaded(true)}
      />
      <style>{`@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }`}</style>
    </div>
  );
}

/* ========== 常量 ========== */
const resolutions = [
  { v: 'web', l: '网页版', w: 1920, h: 1080 },
  { v: 'print', l: '打印版', w: 3000, h: 2000 },
  { v: 'hd', l: '高清版', w: 3840, h: 2160 },
  { v: 'ultra', l: '超清版', w: 7680, h: 4320 },
];

const baseTabs = [
  { id: 'bg', label: '🖼️ 舞台背景' },
  { id: 'props', label: '🛠️ 道具草图' },
  { id: 'costume', label: '👘 戏服纹样' },
  { id: 'storyboard', label: '🎬 分镜氛围' },
  { id: 'materials', label: '📦 材料清单' },
];

const refTab = { id: 'reference', label: '🎭 真实舞台参考' };

/* ========== 小卡片样式 ========== */
const infoCard = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '12px',
  padding: '14px 16px',
};

const sectionDot = (color) => ({
  width: '6px', height: '6px', borderRadius: '50%', background: color, display: 'inline-block', marginRight: '8px'
});

const downloadBtn = {
  color: '#60a5fa', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', whiteSpace: 'nowrap'
};

/* ========== 辅助函数 ========== */
function getGenreLabel(g) {
  const map = {
    jingju: '京剧', kunqu: '昆曲', yueju: '越剧', huangmei: '黄梅戏', yuji: '豫剧', qinqiang: '秦腔',
    zangxi: '藏戏', puxian: '莆仙戏', piying: '皮影', muou: '木偶戏',
    xiangsheng: '相声', pingshu: '评书', pingtan: '苏州评弹', jingyun: '京韵大鼓',
    errenzhuan: '二人转', shandong: '山东快书', henanzhuizi: '河南坠子',
  };
  return map[g] || g;
}
function getEraLabel(e) {
  const map = { tang: '唐代', song: '宋代', ming: '明代', qing: '清代', modern: '现代' };
  return map[e] || e;
}
function getStyleLabel(s) {
  const map = { shadow: '皮影戏', paper: '剪纸艺术', mask: '戏曲脸谱', ancient: '古建筑', ink: '水墨画', embroidery: '刺绣' };
  return map[s] || '无';
}
function getBudgetLabel(b) {
  const map = { low: '简约预算', medium: '标准预算', high: '精致预算', ultra: '豪华预算' };
  return map[b] || b;
}

/* ========== 主组件 ========== */
export default function ResultGallery({ results, input }) {
  const [tab, setTab] = useState(
    results.reference ? 'reference' : (results.scenes?.length ? 'scenes' : 'bg')
  );
  const [selectedRes, setSelectedRes] = useState('print');
  const [showResModal, setShowResModal] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const tabs = (() => {
    let t = results.scenes?.length ? [{ id: 'scenes', label: '📁 剧本场景' }, ...baseTabs] : [...baseTabs];
    if (results.reference) t = [refTab, ...t];
    return t;
  })();

  const downloadImage = async (url, name) => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `${name}.jpg`;
      a.click();
    } catch (err) {
      console.error('下载失败:', err);
    }
  };

  const downloadAll = async () => {
    setDownloading(true);
    await downloadImage(results.bgHd || results.bg, 'stage_background');
    await new Promise(r => setTimeout(r, 300));
    if (results.costumes) {
      for (let i = 0; i < results.costumes.length; i++) {
        await downloadImage(results.costumes[i].imgHd || results.costumes[i].img, `costume_${i}`);
        await new Promise(r => setTimeout(r, 300));
      }
    }
    for (let i = 0; i < results.props.length; i++) {
      await downloadImage(results.props[i].imgHd || results.props[i].img, `prop_${i}`);
      await new Promise(r => setTimeout(r, 300));
    }
    for (let i = 0; i < results.storyboard.length; i++) {
      await downloadImage(results.storyboard[i].imgHd || results.storyboard[i].img, `scene_${i}`);
      await new Promise(r => setTimeout(r, 300));
    }
    if (results.scenes) {
      for (let i = 0; i < results.scenes.length; i++) {
        await downloadImage(results.scenes[i].imgHd || results.scenes[i].img, `script_scene_${i}`);
        await new Promise(r => setTimeout(r, 300));
      }
    }
    setDownloading(false);
  };

  /* ── 顶部信息栏 ── */
  const InfoBar = () => (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      flexWrap: 'wrap', gap: '12px', marginBottom: '20px',
      background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '12px', padding: '14px 18px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
        <span style={{ color: '#fff', fontWeight: 600, fontSize: '15px' }}>🎭 生成结果</span>
        <span style={{ color: '#9ca3af', fontSize: '13px' }}>
          {getGenreLabel(input.g)} · {getEraLabel(input.e)} · {getStyleLabel(input.s)}
        </span>
        <span style={{ color: '#6b7280', fontSize: '12px' }}>
          📏 {input.length}×{input.width}×{input.height}m
          {results.dims && ` · ${Math.round(results.dims.area)}㎡`}
        </span>
        {results.playName && (
          <span style={{ color: '#d1d5db', fontSize: '12px' }}>
            📖 {results.playName}
            {results.reference && <span style={{ color: '#4ade80', marginLeft: '6px' }}>✓ 已关联参考</span>}
          </span>
        )}
      </div>
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <button onClick={() => setShowResModal(true)} style={{
          padding: '6px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)',
          background: 'rgba(255,255,255,0.06)', color: '#9ca3af', cursor: 'pointer', fontSize: '13px'
        }}>
          🔍 {resolutions.find(r => r.v === selectedRes)?.l}
        </button>
        <button onClick={downloadAll} disabled={downloading} style={{
          padding: '6px 16px', borderRadius: '8px', border: 'none',
          background: 'linear-gradient(135deg,#16a34a,#15803d)', color: '#fff',
          cursor: downloading ? 'wait' : 'pointer', fontSize: '13px', opacity: downloading ? 0.7 : 1
        }}>
          {downloading ? '⏳ 下载中…' : '⬇️ 下载全部'}
        </button>
      </div>
    </div>
  );

  /* ── 左侧导航 ── */
  const Sidebar = () => (
    <aside style={{
      width: '190px', flexShrink: 0,
      position: 'sticky', top: '76px', height: 'fit-content',
      alignSelf: 'flex-start'
    }}>
      <div style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '14px', padding: '10px',
        display: 'flex', flexDirection: 'column', gap: '4px'
      }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            textAlign: 'left', padding: '10px 12px', borderRadius: '10px',
            border: 'none', cursor: 'pointer', fontSize: '13px', whiteSpace: 'nowrap',
            transition: 'all 0.15s',
            background: tab === t.id ? 'rgba(220,38,38,0.15)' : 'transparent',
            color: tab === t.id ? '#fff' : '#9ca3af',
            fontWeight: tab === t.id ? 600 : 400,
          }}>
            {t.label}
          </button>
        ))}
      </div>
    </aside>
  );

  /* ── 标签内容渲染 ── */
  const renderContent = () => {
    /* ── 真实舞台参考（多个参考垂直排列，每个左右双栏） ── */
    if (tab === 'reference' && results.reference) {
      const refs = Array.isArray(results.reference) ? results.reference : [results.reference];
      const refImgs = Array.isArray(results.refImages) ? results.refImages : [];
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {refs.map((ref, idx) => {
            const imgData = refImgs[idx] || {};
            return (
              <div key={ref.id || idx} style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '14px', padding: '16px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                  {/* 左侧：真实图片搜索链接 */}
                  <div style={{ flex: 3, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <h4 style={{ color: '#fff', fontWeight: 600, fontSize: '16px' }}>
                        🎭 {ref.names[0]}
                      </h4>
                    </div>
                    <p style={{ color: '#9ca3af', fontSize: '13px', marginBottom: '12px' }}>
                      {ref.venue} · {ref.year} · 舞美：{ref.creators.stage || '传统'} · 灯光：{ref.creators.lighting || '传统'}
                    </p>
                    <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '16px', marginBottom: '12px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                      <div style={{ color: '#9ca3af', fontSize: '12px', marginBottom: '10px' }}>🔍 点击下方链接查看真实舞台图片：</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                        <a href={`https://image.baidu.com/search/index?tn=baiduimage&word=${encodeURIComponent(ref.names[0] + ' 舞台')}`} target="_blank" rel="noopener noreferrer"
                          style={{ background: '#2932e1', color: '#fff', padding: '8px 16px', borderRadius: '8px', fontSize: '14px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          🖼️ 百度图片
                        </a>
                        <a href={`https://www.bing.com/images/search?q=${encodeURIComponent(ref.names[0] + ' 舞台')}`} target="_blank" rel="noopener noreferrer"
                          style={{ background: '#00809d', color: '#fff', padding: '8px 16px', borderRadius: '8px', fontSize: '14px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          🖼️ 必应图片
                        </a>
                        <a href={`https://www.xiaohongshu.com/search_result?keyword=${encodeURIComponent(ref.names[0] + ' 舞台')}`} target="_blank" rel="noopener noreferrer"
                          style={{ background: '#ff2442', color: '#fff', padding: '8px 16px', borderRadius: '8px', fontSize: '14px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          📕 小红书
                        </a>
                        <a href={`https://search.douyin.com/search/?keyword=${encodeURIComponent(ref.names[0] + ' 舞台')}`} target="_blank" rel="noopener noreferrer"
                          style={{ background: '#000', color: '#fff', padding: '8px 16px', borderRadius: '8px', fontSize: '14px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          🎵 抖音
                        </a>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {ref.venue && (
                        <span style={{ background: 'rgba(220,38,38,0.1)', color: '#fca5a5', fontSize: '12px', padding: '3px 10px', borderRadius: '6px', border: '1px solid rgba(220,38,38,0.2)' }}>📍 {ref.venue}</span>
                      )}
                      {ref.year && (
                        <span style={{ background: 'rgba(234,179,8,0.1)', color: '#fde047', fontSize: '12px', padding: '3px 10px', borderRadius: '6px', border: '1px solid rgba(234,179,8,0.2)' }}>📅 {ref.year}</span>
                      )}
                      {ref.creators?.stage && (
                        <span style={{ background: 'rgba(59,130,246,0.1)', color: '#93c5fd', fontSize: '12px', padding: '3px 10px', borderRadius: '6px', border: '1px solid rgba(59,130,246,0.2)' }}>🎨 舞美：{ref.creators.stage}</span>
                      )}
                    </div>
                  </div>

                  {/* 右侧：信息卡片 */}
                  <div style={{ flex: 2, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {/* 演出出处 */}
                    {ref.performanceCredits?.length > 0 && (
                      <div style={infoCard}>
                        <div style={{ color: '#fca5a5', fontSize: '12px', fontWeight: 600, marginBottom: '8px' }}>
                          <span style={sectionDot('#dc2626')} />演出出处
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {ref.performanceCredits.map((item, i) => (
                            <div key={i} style={{ color: '#d1d5db', fontSize: '12px', lineHeight: 1.5 }}>· {item}</div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 人物服饰 */}
                    {ref.characters?.length > 0 && (
                      <div style={infoCard}>
                        <div style={{ color: '#c4b5fd', fontSize: '12px', fontWeight: 600, marginBottom: '8px' }}>
                          <span style={sectionDot('#a855f7')} />主要人物服饰
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {ref.characters.map((ch, i) => (
                            <div key={i} style={{ background: 'rgba(168,85,247,0.06)', border: '1px solid rgba(168,85,247,0.12)', borderRadius: '8px', padding: '8px 12px' }}>
                              <div style={{ color: '#e5e7eb', fontSize: '13px', fontWeight: 600 }}>
                                {ch.name} {ch.roleType ? <span style={{ color: '#a855f7', fontSize: '11px' }}>({ch.roleType})</span> : null}
                              </div>
                              <div style={{ color: '#c4b5fd', fontSize: '11px', lineHeight: 1.5, marginTop: '2px' }}>服饰：{ch.costumeRef}</div>
                              <div style={{ color: '#9ca3af', fontSize: '11px', lineHeight: 1.5 }}>历史：{ch.historicalBasis}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 历史依据 */}
                    {ref.historicalBasis && (
                      <div style={infoCard}>
                        <div style={{ color: '#93c5fd', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                          <span style={sectionDot('#3b82f6')} />历史依据
                        </div>
                        <div style={{ color: '#d1d5db', fontSize: '12px', lineHeight: 1.6 }}>{ref.historicalBasis}</div>
                      </div>
                    )}

                    {/* 固定结构 */}
                    <div style={infoCard}>
                      <div style={{ color: '#9ca3af', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                        <span style={sectionDot('#6b7280')} />固定结构
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {ref.fixedStructure.map((item, i) => (
                          <div key={i} style={{ color: '#d1d5db', fontSize: '12px', lineHeight: 1.5 }}>· {item}</div>
                        ))}
                      </div>
                    </div>

                    {/* 可变元素 */}
                    <div style={infoCard}>
                      <div style={{ color: '#4ade80', fontSize: '12px', fontWeight: 600, marginBottom: '8px' }}>
                        <span style={sectionDot('#16a34a')} />可变元素
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {ref.variableElements.lighting?.length > 0 && (
                          <div>
                            <div style={{ color: '#4ade80', fontSize: '11px', fontWeight: 600, marginBottom: '4px' }}>💡 灯光</div>
                            {ref.variableElements.lighting.slice(0, 3).map((item, i) => (
                              <div key={i} style={{ color: '#d1d5db', fontSize: '11px', lineHeight: 1.5 }}>· {item.replace(/^[^：]*：/, '').slice(0, 36)}</div>
                            ))}
                          </div>
                        )}
                        {ref.variableElements.projection?.length > 0 && (
                          <div>
                            <div style={{ color: '#60a5fa', fontSize: '11px', fontWeight: 600, marginBottom: '4px' }}>🖥️ 投影</div>
                            {ref.variableElements.projection.slice(0, 3).map((item, i) => (
                              <div key={i} style={{ color: '#d1d5db', fontSize: '11px', lineHeight: 1.5 }}>· {item.replace(/^[^：]*：/, '').slice(0, 36)}</div>
                            ))}
                          </div>
                        )}
                        {ref.variableElements.props?.length > 0 && (
                          <div>
                            <div style={{ color: '#fbbf24', fontSize: '11px', fontWeight: 600, marginBottom: '4px' }}>🛠️ 可移动道具</div>
                            {ref.variableElements.props.slice(0, 3).map((item, i) => (
                              <div key={i} style={{ color: '#d1d5db', fontSize: '11px', lineHeight: 1.5 }}>· {item.slice(0, 36)}</div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 设计建议 */}
                    {ref.designSuggestions?.length > 0 && (
                      <div style={infoCard}>
                        <div style={{ color: '#fcd34d', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                          <span style={sectionDot('#d97706')} />设计建议
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {ref.designSuggestions.map((item, i) => (
                            <div key={i} style={{ color: '#e5e7eb', fontSize: '12px', lineHeight: 1.5, background: 'rgba(217,119,6,0.06)', borderRadius: '6px', padding: '6px 10px' }}>
                              {item}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    /* ── 剧本场景（2列网格） ── */
    if (tab === 'scenes' && results.scenes) {
      return (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h4 style={{ color: '#fff', fontWeight: 600 }}>📁 剧本场景（共 {results.scenes.length} 个）</h4>
          </div>
          {results.script && (
            <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', border: '1px solid rgba(255,255,255,0.08)', color: '#9ca3af', fontSize: '13px', lineHeight: 1.6, maxHeight: '120px', overflowY: 'auto' }}>
              <pre style={{ margin: 0, fontFamily: 'inherit', whiteSpace: 'pre-wrap' }}>{results.script}</pre>
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
            {results.scenes.map((scene, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '14px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ background: 'linear-gradient(135deg,#dc2626,#d97706)', color: '#fff', fontSize: '11px', padding: '3px 10px', borderRadius: '6px', fontWeight: 600 }}>场景 {i + 1}</span>
                  <button onClick={() => downloadImage(scene.imgHd || scene.img, `script_scene_${i}`)} style={downloadBtn}>⬇️ 下载</button>
                </div>
                <div style={{ color: '#fff', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>{scene.title}</div>
                <LazyImage src={scene.img} alt={scene.title} style={{ width: '100%', height: '220px', objectFit: 'cover', borderRadius: '10px' }} />
              </div>
            ))}
          </div>
        </div>
      );
    }

    /* ── 舞台背景（全宽大图） ── */
    if (tab === 'bg') {
      return (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h4 style={{ color: '#fff', fontWeight: 600, fontSize: '16px' }}>🖼️ 舞台背景图</h4>
            <button onClick={() => downloadImage(results.bgHd || results.bg, 'stage_background')} style={downloadBtn}>⬇️ 下载</button>
          </div>
          <LazyImage src={results.bg} alt="舞台背景" style={{ width: '100%', height: '520px', objectFit: 'cover', borderRadius: '14px' }} />
        </div>
      );
    }

    /* ── 道具草图（3列网格） ── */
    if (tab === 'props') {
      return (
        <div>
          <h4 style={{ color: '#fff', fontWeight: 600, fontSize: '16px', marginBottom: '16px' }}>🛠️ 道具草图</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            {results.props.map((p, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <LazyImage src={p.img} alt={p.n} style={{ width: '100%', height: '260px', objectFit: 'cover', borderRadius: '10px', marginBottom: '10px' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#d1d5db', fontSize: '13px' }}>{p.n}</span>
                  <button onClick={() => downloadImage(p.imgHd || p.img, `prop_${i}`)} style={downloadBtn}>⬇️ 下载</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    /* ── 戏服纹样（2列网格，大图） ── */
    if (tab === 'costume') {
      return (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h4 style={{ color: '#fff', fontWeight: 600, fontSize: '16px' }}>👘 戏服纹样</h4>
            <span style={{ color: '#6b7280', fontSize: '12px' }}>三视图 · 人物标注 · 参考出处 · 历史依据</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
            {results.costumes.map((c, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '14px', padding: '14px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ color: '#e5e7eb', fontSize: '14px', fontWeight: 600 }}>{c.n}</span>
                  <button onClick={() => downloadImage(c.imgHd || c.img, `costume_${i}`)} style={downloadBtn}>⬇️ 下载</button>
                </div>
                {c.character && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
                    {c.character.costumeRef && (
                      <span style={{ background: 'rgba(168,85,247,0.12)', color: '#c4b5fd', fontSize: '11px', padding: '3px 8px', borderRadius: '6px', border: '1px solid rgba(168,85,247,0.2)' }}>参考：{c.character.costumeRef}</span>
                    )}
                    {c.character.historicalBasis && (
                      <span style={{ background: 'rgba(59,130,246,0.12)', color: '#93c5fd', fontSize: '11px', padding: '3px 8px', borderRadius: '6px', border: '1px solid rgba(59,130,246,0.2)' }}>历史：{c.character.historicalBasis}</span>
                    )}
                  </div>
                )}
                <LazyImage src={c.img} alt={c.n} style={{ width: '100%', height: '460px', objectFit: 'cover', borderRadius: '12px' }} />
              </div>
            ))}
          </div>
        </div>
      );
    }

    /* ── 分镜氛围（3列网格） ── */
    if (tab === 'storyboard') {
      return (
        <div>
          <h4 style={{ color: '#fff', fontWeight: 600, fontSize: '16px', marginBottom: '16px' }}>🎬 分镜氛围图</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            {results.storyboard.map((s, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ color: '#fff', fontSize: '13px', fontWeight: 500 }}>{s.scene}</span>
                  <button onClick={() => downloadImage(s.imgHd || s.img, `scene_${i}`)} style={downloadBtn}>⬇️ 下载</button>
                </div>
                <LazyImage src={s.img} alt={s.scene} style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '10px' }} />
              </div>
            ))}
          </div>
        </div>
      );
    }

    /* ── 材料清单 ── */
    if (tab === 'materials') {
      return <MaterialList dims={results.dims} budget={results.budget} budgetValue={results.budgetValue} materialImages={results.materialImages} genre={results.genre} playName={results.playName} />;
    }

    return null;
  };

  /* ========== 渲染 ========== */
  return (
    <div>
      <InfoBar />

      <div style={{ display: 'flex', gap: '20px' }}>
        <Sidebar />
        <main style={{ flex: 1, minWidth: 0 }}>
          {renderContent()}
        </main>
      </div>

      {/* 分辨率选择弹窗 */}
      {showResModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100
        }} onClick={() => setShowResModal(false)}>
          <div style={{
            background: '#1a1a2e', borderRadius: '16px', padding: '24px', width: '360px',
            border: '1px solid rgba(255,255,255,0.1)'
          }} onClick={e => e.stopPropagation()}>
            <h3 style={{ color: '#fff', fontWeight: 600, marginBottom: '16px' }}>选择导出分辨率</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {resolutions.map(res => (
                <button key={res.v} onClick={() => { setSelectedRes(res.v); setShowResModal(false); }} style={{
                  padding: '12px 16px', borderRadius: '10px', textAlign: 'left', border: '1px solid',
                  borderColor: selectedRes === res.v ? '#2563eb' : 'rgba(255,255,255,0.15)',
                  background: selectedRes === res.v ? 'rgba(37,99,235,0.2)' : 'rgba(255,255,255,0.05)',
                  color: selectedRes === res.v ? '#60a5fa' : '#d1d5db',
                  cursor: 'pointer'
                }}>
                  <div style={{ fontWeight: 500 }}>{res.l}</div>
                  <div style={{ fontSize: '12px', opacity: 0.7 }}>{res.w}×{res.h}</div>
                </button>
              ))}
            </div>
            <button onClick={() => setShowResModal(false)} style={{
              width: '100%', marginTop: '16px', padding: '10px', borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.1)',
              color: '#d1d5db', cursor: 'pointer'
            }}>取消</button>
          </div>
        </div>
      )}
    </div>
  );
}
