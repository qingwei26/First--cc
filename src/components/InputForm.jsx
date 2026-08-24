import { useState, useMemo } from 'react';
import { findPlayReference } from '../data/playStageReference';

const genres = [
  { v: 'jingju', l: '京剧', desc: '国粹经典', origin: '清代道光年间' },
  { v: 'kunqu', l: '昆曲', desc: '百戏之祖', origin: '明代中期' },
  { v: 'yueju', l: '越剧', desc: '江南灵秀', origin: '清末民初' },
  { v: 'huangmei', l: '黄梅戏', desc: '淳朴清新', origin: '清代乾隆' },
  { v: 'yuji', l: '豫剧', desc: '中原之声', origin: '明代中后期' },
  { v: 'qinqiang', l: '秦腔', desc: '西北豪迈', origin: '先秦/明代成熟' },
  { v: 'zangxi', l: '藏戏', desc: '雪域梵音', origin: '8世纪/17世纪形成' },
  { v: 'puxian', l: '莆仙戏', desc: '宋元遗响', origin: '宋代' },
  { v: 'piying', l: '皮影', desc: '光影傀儡', origin: '汉代' },
  { v: 'muou', l: '木偶戏', desc: '提线人生', origin: '汉代' },
  { v: 'xiangsheng', l: '相声', desc: '说学逗唱', origin: '清代咸丰' },
  { v: 'pingshu', l: '评书', desc: '拍案惊奇', origin: '唐宋' },
  { v: 'pingtan', l: '苏州评弹', desc: '吴侬软语', origin: '清代乾隆' },
  { v: 'jingyun', l: '京韵大鼓', desc: '韵鼓激昂', origin: '清代末年' },
  { v: 'errenzhuan', l: '二人转', desc: '东北风情', origin: '清代康熙' },
  { v: 'shandong', l: '山东快书', desc: '快板铿锵', origin: '清代道光' },
  { v: 'henanzhuizi', l: '河南坠子', desc: '弦歌悠扬', origin: '清末民初' },
];

const allEras = [
  { v: 'tang', l: '唐代', desc: '盛世华章' },
  { v: 'song', l: '宋代', desc: '风雅婉约' },
  { v: 'ming', l: '明代', desc: '古朴典雅' },
  { v: 'qing', l: '清代', desc: '繁复精致' },
  { v: 'modern', l: '现代', desc: '创新融合' },
];

const styles = [
  { v: 'shadow', l: '皮影戏', desc: '光影交织' },
  { v: 'paper', l: '剪纸艺术', desc: '镂金裁云' },
  { v: 'mask', l: '戏曲脸谱', desc: '色彩斑斓' },
  { v: 'ancient', l: '古建筑', desc: '飞檐斗拱' },
  { v: 'ink', l: '水墨画', desc: '水墨丹青' },
  { v: 'embroidery', l: '刺绣', desc: '丝韵锦绣' },
];

const budgets = [
  { v: 'low', l: '简约', desc: '5万以下', max: 50000 },
  { v: 'medium', l: '标准', desc: '5-15万', max: 150000 },
  { v: 'high', l: '精致', desc: '15-30万', max: 300000 },
  { v: 'ultra', l: '豪华', desc: '30万以上', max: 1000000 },
  { v: 'custom', l: '自定义', desc: '自行输入', max: null },
];

const genreEraMap = {
  piying:  ['tang','song','ming','qing','modern'],
  muou:    ['tang','song','ming','qing','modern'],
  pingshu: ['song','ming','qing','modern'],
  puxian:  ['song','ming','qing','modern'],
  kunqu:   ['ming','qing','modern'],
  zangxi:  ['tang','ming','qing','modern'],
  qinqiang:['tang','song','ming','qing','modern'],
  yuji:    ['ming','qing','modern'],
  jingju:  ['qing','modern'],
  yueju:   ['qing','modern'],
  huangmei:['qing','modern'],
  pingtan: ['qing','modern'],
  jingyun: ['qing','modern'],
  errenzhuan:['qing','modern'],
  shandong:['qing','modern'],
  henanzhuizi:['qing','modern'],
  xiangsheng:['qing','modern'],
};

const cardBg = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '24px', marginBottom: '32px' };
const labelStyle = { color: '#d1d5db', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' };
const sectionTitle = { color: '#fff', fontSize: '20px', fontWeight: 600, marginBottom: '4px' };
const sectionSub = { color: '#9ca3af', fontSize: '14px' };

function InputForm({ onGenerate }) {
  const [form, setForm] = useState(() => {
    const saved = localStorage.getItem('stageAI_input');
    if (saved) {
      const data = JSON.parse(saved);
      return {
        g: data.g || '',
        e: data.e || '',
        s: data.s || '',
        length: data.length || '',
        width: data.width || '',
        height: data.height || '',
        budget: data.budget || '',
        budgetValue: data.budgetValue || '',
        playName: data.playName || '',
        script: data.script || '',
      };
    }
    return { g: '', e: '', s: '', length: '', width: '', height: '', budget: '', budgetValue: '', playName: '', script: '' };
  });

  const matchedRefs = useMemo(() => findPlayReference(form.playName), [form.playName]);
  const matchedRef = matchedRefs[0] || null;

  const selectedGenre = genres.find(g => g.v === form.g);

  const availableEras = useMemo(() => {
    if (!form.g) return allEras;
    const allowed = genreEraMap[form.g] || allEras.map(e => e.v);
    return allEras.map(e => ({ ...e, disabled: !allowed.includes(e.v) }));
  }, [form.g]);

  const updateField = (key, value) => {
    setForm(prev => {
      const next = { ...prev, [key]: value };
      if (key === 'g') {
        const allowed = genreEraMap[value] || [];
        if (next.e && !allowed.includes(next.e)) {
          next.e = '';
        }
      }
      return next;
    });
  };

  // 必填：剧种、年代、长、宽、高、预算；风格可选。自定义预算时需填金额
  const budgetFilled = form.budget && (form.budget !== 'custom' || (form.budget === 'custom' && form.budgetValue));
  const isDisabled = !form.g || !form.e || !form.length || !form.width || !form.height || !budgetFilled;

  /* ── 区块分隔线 ── */
  const sectionGap = { marginBottom: '28px', paddingBottom: '24px', borderBottom: '1px solid rgba(255,255,255,0.06)' };
  const lastSectionGap = { marginBottom: '24px' };

  /* ── 大标签样式（剧种用） ── */
  const bigTag = (active, color) => ({
    padding: '10px 22px', borderRadius: '8px', border: '1px solid',
    borderColor: active ? color : 'rgba(255,255,255,0.12)',
    background: active ? `linear-gradient(135deg,${color},${color}dd)` : 'rgba(255,255,255,0.03)',
    color: active ? '#fff' : '#9ca3af',
    fontSize: '14px', fontWeight: active ? 600 : 400,
    cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap',
    boxShadow: active ? `0 4px 16px ${color}40` : 'none'
  });

  /* ── 小标签样式（年代、风格、预算用） ── */
  const smallTag = (active, color) => ({
    padding: '8px 18px', borderRadius: '20px', border: '1px solid',
    borderColor: active ? color : 'rgba(255,255,255,0.12)',
    background: active ? `${color}22` : 'rgba(255,255,255,0.03)',
    color: active ? '#fff' : '#9ca3af',
    fontSize: '13px', fontWeight: active ? 600 : 400,
    cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap'
  });
  const smallTagDisabled = {
    padding: '8px 18px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.06)',
    background: 'rgba(255,255,255,0.02)', color: '#4b5563',
    fontSize: '13px', cursor: 'not-allowed', whiteSpace: 'nowrap'
  };

  const generateBtn = isDisabled
    ? { padding: '16px 56px', borderRadius: '10px', fontSize: '16px', fontWeight: 600, background: '#374151', color: '#6b7280', cursor: 'not-allowed', border: 'none', width: '100%', maxWidth: '400px' }
    : { padding: '16px 56px', borderRadius: '10px', fontSize: '16px', fontWeight: 600, background: 'linear-gradient(90deg,#dc2626,#d97706,#ea580c)', color: '#fff', cursor: 'pointer', border: 'none', boxShadow: '0 4px 24px rgba(220,38,38,0.45)', width: '100%', maxWidth: '400px' };

  const inputStyle = {
    width: '100%', padding: '12px 14px', borderRadius: '10px',
    border: '1px solid rgba(255,255,255,0.15)', background: '#1e1e3a',
    color: '#e5e7eb', fontSize: '15px', outline: 'none', fontFamily: 'inherit'
  };

  const numberInputs = [
    { key: 'length', label: '长（米）', placeholder: '12' },
    { key: 'width', label: '宽（米）', placeholder: '8' },
    { key: 'height', label: '高（米）', placeholder: '6' },
  ];

  /* ── 小区块标题 ── */
  const subLabel = (icon, text, hint) => (
    <div style={{ color: '#e5e7eb', fontSize: '15px', fontWeight: 600, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
      <span>{icon}</span>
      {text}
      {hint && <span style={{ color: '#6b7280', fontSize: '13px', fontWeight: 400 }}>{hint}</span>}
    </div>
  );

  return (
    <div style={cardBg}>
      {/* 标题 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '28px' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg,#dc2626,#d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
          🎭
        </div>
        <div>
          <div style={sectionTitle}>非遗戏曲舞台 AI 生成器</div>
          <div style={sectionSub}>选择剧种、年代与舞台参数，一键生成可落地的舞台视觉方案</div>
        </div>
      </div>

      {/* ===== 第1区：剧目类型（独占整行） ===== */}
      <div style={sectionGap}>
        {subLabel('🎭', '剧目类型')}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {genres.map(item => (
            <button key={item.v} onClick={() => updateField('g', item.v)}
              title={`起源：${item.origin}`}
              style={bigTag(form.g === item.v, '#dc2626')}
              onMouseEnter={e => { if (form.g !== item.v) { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#d1d5db'; } }}
              onMouseLeave={e => { if (form.g !== item.v) { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.color = '#9ca3af'; } }}>
              {item.l}
            </button>
          ))}
        </div>
      </div>

      {/* ===== 第2区：年代 + 风格（并排） ===== */}
      <div style={{ ...sectionGap, display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '260px' }}>
          {subLabel('📅', '年代风格', selectedGenre && `（${selectedGenre.l}始于${selectedGenre.origin.split('/')[0]}）`)}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {availableEras.map(item => (
              <button key={item.v}
                onClick={() => !item.disabled && updateField('e', item.v)}
                style={item.disabled ? smallTagDisabled : smallTag(form.e === item.v, '#d97706')}
                onMouseEnter={e => { if (!item.disabled && form.e !== item.v) { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#d1d5db'; } }}
                onMouseLeave={e => { if (!item.disabled && form.e !== item.v) { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.color = '#9ca3af'; } }}>
                {item.l}
              </button>
            ))}
          </div>
        </div>
        <div style={{ flex: 1, minWidth: '260px' }}>
          {subLabel('🎨', '非遗风格', '（可选）')}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {styles.map(item => (
              <button key={item.v} onClick={() => updateField('s', form.s === item.v ? '' : item.v)}
                style={smallTag(form.s === item.v, '#2563eb')}
                onMouseEnter={e => { if (form.s !== item.v) { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#d1d5db'; } }}
                onMouseLeave={e => { if (form.s !== item.v) { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.color = '#9ca3af'; } }}>
                {item.l}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ===== 第3区：尺寸 + 预算 + 剧本名（三列网格） ===== */}
      <div style={{ ...sectionGap, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '28px' }}>
        {/* 尺寸 */}
        <div>
          {subLabel('📏', '舞台尺寸')}
          <div style={{ display: 'flex', gap: '10px' }}>
            {numberInputs.map(item => (
              <div key={item.key} style={{ flex: 1 }}>
                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '6px' }}>{item.label}</div>
                <input
                  type="number"
                  min="1"
                  max="100"
                  step="0.1"
                  value={form[item.key]}
                  onChange={e => updateField(item.key, e.target.value)}
                  placeholder={item.placeholder}
                  style={inputStyle}
                />
              </div>
            ))}
          </div>
          {form.length && form.width && form.height && (
            <div style={{ color: '#6b7280', fontSize: '12px', marginTop: '8px' }}>
              体积约 {Math.round(parseFloat(form.length) * parseFloat(form.width) * parseFloat(form.height))} m³
            </div>
          )}
        </div>

        {/* 预算 */}
        <div>
          {subLabel('💰', '预算')}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {budgets.map(item => (
              <button key={item.v} onClick={() => updateField('budget', item.v)}
                style={smallTag(form.budget === item.v, '#7c3aed')}
                onMouseEnter={e => { if (form.budget !== item.v) { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#d1d5db'; } }}
                onMouseLeave={e => { if (form.budget !== item.v) { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.color = '#9ca3af'; } }}>
                {item.l}
              </button>
            ))}
          </div>
          {form.budget === 'custom' && (
            <div style={{ marginTop: '12px', display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input
                type="number"
                min="1"
                step="0.1"
                value={form.budgetValue}
                onChange={e => updateField('budgetValue', e.target.value)}
                placeholder="预算金额（万元）"
                style={{ ...inputStyle, width: '160px' }}
              />
              {form.budgetValue && (
                <span style={{ color: '#9ca3af', fontSize: '13px' }}>{form.budgetValue} 万元</span>
              )}
            </div>
          )}
        </div>

        {/* 剧本名 */}
        <div>
          {subLabel('📖', '剧本名称', '（可选）')}
          <input
            type="text"
            value={form.playName}
            onChange={e => updateField('playName', e.target.value)}
            placeholder="如《我的大观园》《霸王别姬》等"
            style={inputStyle}
          />
        </div>
      </div>

      {/* 匹配到的真实舞台参考 */}
      {matchedRef && (
        <div style={{ ...lastSectionGap, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '14px', padding: '20px 24px', borderLeft: '4px solid #dc2626' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <span style={{ fontSize: '20px' }}>🎭</span>
            <span style={{ color: '#fff', fontWeight: 600, fontSize: '16px' }}>
              已匹配真实舞台参考：{matchedRef.names[0]}
            </span>
            <span style={{ color: '#6b7280', fontSize: '13px' }}>
              {matchedRef.venue} · {matchedRef.year}
            </span>
          </div>

          {/* 固定结构 */}
          <div style={{ marginBottom: '14px' }}>
            <div style={{ color: '#9ca3af', fontSize: '13px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#6b7280', display: 'inline-block' }} />
              固定舞台结构（不可更改）
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {matchedRef.fixedStructure.map((item, i) => (
                <span key={i} style={{ background: 'rgba(107,114,128,0.15)', color: '#9ca3af', fontSize: '12px', padding: '4px 10px', borderRadius: '6px', border: '1px solid rgba(107,114,128,0.25)' }}>
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* 可变元素 */}
          <div style={{ marginBottom: '14px' }}>
            <div style={{ color: '#9ca3af', fontSize: '13px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#16a34a', display: 'inline-block' }} />
              可变元素
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
              {matchedRef.variableElements.lighting && matchedRef.variableElements.lighting.length > 0 && (
                <div style={{ background: 'rgba(22,163,74,0.08)', borderRadius: '8px', padding: '10px', border: '1px solid rgba(22,163,74,0.15)' }}>
                  <div style={{ color: '#4ade80', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>💡 灯光</div>
                  <ul style={{ margin: 0, paddingLeft: '14px', color: '#d1d5db', fontSize: '12px', lineHeight: 1.6 }}>
                    {matchedRef.variableElements.lighting.slice(0, 3).map((item, i) => (
                      <li key={i}>{item.replace(/^[^：]*：/, '').slice(0, 30)}{item.replace(/^[^：]*：/, '').length > 30 ? '...' : ''}</li>
                    ))}
                  </ul>
                </div>
              )}
              {matchedRef.variableElements.projection && matchedRef.variableElements.projection.length > 0 && (
                <div style={{ background: 'rgba(37,99,235,0.08)', borderRadius: '8px', padding: '10px', border: '1px solid rgba(37,99,235,0.15)' }}>
                  <div style={{ color: '#60a5fa', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>🖥️ 投影/多媒体</div>
                  <ul style={{ margin: 0, paddingLeft: '14px', color: '#d1d5db', fontSize: '12px', lineHeight: 1.6 }}>
                    {matchedRef.variableElements.projection.slice(0, 3).map((item, i) => (
                      <li key={i}>{item.replace(/^[^：]*：/, '').slice(0, 30)}{item.replace(/^[^：]*：/, '').length > 30 ? '...' : ''}</li>
                    ))}
                  </ul>
                </div>
              )}
              {matchedRef.variableElements.props && matchedRef.variableElements.props.length > 0 && (
                <div style={{ background: 'rgba(217,119,6,0.08)', borderRadius: '8px', padding: '10px', border: '1px solid rgba(217,119,6,0.15)' }}>
                  <div style={{ color: '#fbbf24', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>🛠️ 可移动道具</div>
                  <ul style={{ margin: 0, paddingLeft: '14px', color: '#d1d5db', fontSize: '12px', lineHeight: 1.6 }}>
                    {matchedRef.variableElements.props.slice(0, 3).map((item, i) => (
                      <li key={i}>{item.slice(0, 30)}{item.length > 30 ? '...' : ''}</li>
                    ))}
                  </ul>
                </div>
              )}
              {matchedRef.variableElements.colorPalette && matchedRef.variableElements.colorPalette.length > 0 && (
                <div style={{ background: 'rgba(220,38,38,0.08)', borderRadius: '8px', padding: '10px', border: '1px solid rgba(220,38,38,0.15)' }}>
                  <div style={{ color: '#f87171', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>🎨 主色调</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {matchedRef.variableElements.colorPalette.map((item, i) => (
                      <span key={i} style={{ color: '#d1d5db', fontSize: '12px' }}>{item}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 设计建议 */}
          <div>
            <div style={{ color: '#9ca3af', fontSize: '13px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#d97706', display: 'inline-block' }} />
              设计建议
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {matchedRef.designSuggestions.map((item, i) => (
                <div key={i} style={{ color: '#e5e7eb', fontSize: '12px', lineHeight: 1.6, paddingLeft: '12px', position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 0, top: '6px', width: '4px', height: '4px', borderRadius: '50%', background: '#d97706' }} />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 剧本内容输入框 */}
      <div style={matchedRef ? { marginTop: '24px' } : lastSectionGap}>
        {subLabel('📝', '剧本内容', '（可选）')}
        <textarea
          value={form.script}
          onChange={e => updateField('script', e.target.value)}
          placeholder="在此输入剧本内容，AI 将根据剧本场景智能生成对应舞台视觉...&#10;示例：&#10;第一幕 宫廷夜宴&#10;第二幕 战场厮杀&#10;第三幕 月下重逢"
          style={{
            width: '100%', minHeight: '120px', padding: '14px 16px',
            borderRadius: '12px', border: '1px solid rgba(255,255,255,0.15)',
            background: '#1e1e3a', color: '#e5e7eb', fontSize: '14px',
            lineHeight: 1.6, resize: 'vertical', outline: 'none',
            fontFamily: 'inherit'
          }}
        />
        {form.script && (
          <div style={{ color: '#6b7280', fontSize: '12px', marginTop: '6px' }}>
            已输入 {form.script.length} 字，将根据剧本内容生成场景
          </div>
        )}
      </div>

      <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'center' }}>
        <button onClick={() => !isDisabled && onGenerate(form)} disabled={isDisabled} style={generateBtn}>
          {isDisabled ? '⚡ 请填写必填项' : '✨ 一键生成舞台方案'}
        </button>
      </div>
    </div>
  );
}

export default InputForm;
