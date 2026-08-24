// 开发测试面板 - 一键注入模拟数据测试核心逻辑
import { useState } from 'react';
import { storage, STORAGE_KEYS, getTodayStr, genId, generatePerDaySchedules, PHASE_PRESETS } from '../focusStore';

// 日期格式化
const formatDate = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

// 生成N天前的日期字符串
const daysAgo = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return formatDate(d);
};

export default function DevTestPanel() {
  const today = getTodayStr();

  // === 测试1：模拟紧急退出记雨天 ===
  // 验证逻辑：点击后今天应显示为🌧️雨天，日历tab中今天格子显示雨天符号
  const testEmergencyExitRainy = () => {
    const records = storage.get(STORAGE_KEYS.CALENDAR_RECORDS, {});
    records[today] = {
      status: 'rainy',
      note: '【测试】模拟紧急退出 → 自动记为雨天',
      updatedAt: Date.now(),
    };
    storage.set(STORAGE_KEYS.CALENDAR_RECORDS, records);
    alert('✅ 已模拟"紧急退出"：\n今天已被标记为 🌧️ 雨天\n\n点击确定后页面将刷新，请切换到"日历打卡"tab查看效果');
    window.location.reload();
  };

  // === 测试2：拼图部分点亮（7天挑战，完成3天） ===
  // 验证逻辑：7天拼图板中前3块应为彩色点亮，后4块为灰色未完成
  const testPuzzlePartial = () => {
    const plans = storage.get(STORAGE_KEYS.SHORT_TERM_PLANS, []);
    const start = new Date();
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      const dateStr = formatDate(d);
      const completed = i < 3; // 前3天完成
      days.push({
        date: dateStr,
        dayIndex: i + 1,
        completed,
        tasks: [
          { id: genId(), title: '晨读', durationMin: 30, completed },
          { id: genId(), title: '深度学习', durationMin: 90, completed },
        ],
        completedAt: completed ? d.getTime() : null,
      });
    }
    plans.push({
      id: genId(),
      title: '【测试】7天习惯（3/7已点亮）',
      type: 7,
      goal: '验证拼图部分点亮效果',
      startDate: today,
      createdAt: Date.now(),
      days,
      puzzleCompleted: false,
    });
    storage.set(STORAGE_KEYS.SHORT_TERM_PLANS, plans);
    alert('✅ 已创建7天挑战（前3天完成）\n\n点击确定后页面将刷新，请切换到"短期挑战"tab查看拼图效果');
    window.location.reload();
  };

  // === 测试3：拼图全部点亮（30天挑战，全部完成） ===
  // 验证逻辑：30块拼图全部彩色点亮 + 🏆完成徽章 + 庆祝动画
  const testPuzzleCompleted = () => {
    const plans = storage.get(STORAGE_KEYS.SHORT_TERM_PLANS, []);
    const start = new Date();
    start.setDate(start.getDate() - 29); // 30天前开始
    const days = [];
    for (let i = 0; i < 30; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      const dateStr = formatDate(d);
      days.push({
        date: dateStr,
        dayIndex: i + 1,
        completed: true,
        tasks: [
          { id: genId(), title: '晨读', durationMin: 30, completed: true },
          { id: genId(), title: '深度学习', durationMin: 90, completed: true },
          { id: genId(), title: '运动', durationMin: 30, completed: true },
        ],
        completedAt: d.getTime() + 86400000,
      });
    }
    plans.push({
      id: genId(),
      title: '【测试】30天蜕变（全部点亮🏆）',
      type: 30,
      goal: '验证拼图完整点亮 + 庆祝效果',
      startDate: formatDate(start),
      createdAt: Date.now() - 30 * 86400000,
      days,
      puzzleCompleted: true,
    });
    storage.set(STORAGE_KEYS.SHORT_TERM_PLANS, plans);
    alert('✅ 已创建30天挑战（全部完成）\n\n点击确定后页面将刷新，请切换到"短期挑战"tab查看完整拼图+🏆庆祝效果');
    window.location.reload();
  };

  // === 测试4：注入30天日历历史数据 ===
  // 验证逻辑：日历tab中过去30天显示各种天气符号 + 月度统计正确
  const testCalendarHistory = () => {
    const records = storage.get(STORAGE_KEYS.CALENDAR_RECORDS, {});
    const notes = {
      sunny: ['全部完成！', '高效一天', '专注力满分', '按时打卡'],
      cloudy: ['部分完成', '差一点', '被打断', '完成60%'],
      rainy: ['紧急退出', '未完成', '放弃计划', '被打扰'],
    };
    for (let i = 1; i <= 30; i++) {
      const dateStr = daysAgo(i);
      if (records[dateStr]) continue; // 不覆盖已有记录
      const r = Math.random();
      const status = r < 0.55 ? 'sunny' : r < 0.8 ? 'cloudy' : 'rainy';
      const notePool = notes[status];
      records[dateStr] = {
        status,
        note: `【模拟】${notePool[Math.floor(Math.random() * notePool.length)]}`,
        updatedAt: new Date(dateStr).getTime(),
      };
    }
    storage.set(STORAGE_KEYS.CALENDAR_RECORDS, records);
    alert('✅ 已注入30天模拟日历数据（随机晴/阴/雨）\n\n点击确定后页面将刷新，请切换到"日历打卡"tab查看效果');
    window.location.reload();
  };

  // === 测试5：一键全套测试 ===
  // 同时注入日历历史 + 紧急退出今天 + 两个短期挑战
  const testAllInOne = () => {
    // 5-1 日历历史
    const records = storage.get(STORAGE_KEYS.CALENDAR_RECORDS, {});
    for (let i = 1; i <= 30; i++) {
      const dateStr = daysAgo(i);
      if (records[dateStr]) continue;
      const r = Math.random();
      const status = r < 0.55 ? 'sunny' : r < 0.8 ? 'cloudy' : 'rainy';
      records[dateStr] = {
        status,
        note: `【模拟】${status === 'sunny' ? '全部完成' : status === 'cloudy' ? '部分完成' : '未完成'}`,
        updatedAt: new Date(dateStr).getTime(),
      };
    }
    // 5-2 今天设为雨天（紧急退出）
    records[today] = {
      status: 'rainy',
      note: '【测试】模拟紧急退出 → 雨天',
      updatedAt: Date.now(),
    };
    storage.set(STORAGE_KEYS.CALENDAR_RECORDS, records);

    // 5-3 7天部分完成
    const plans = storage.get(STORAGE_KEYS.SHORT_TERM_PLANS, []);
    const start7 = new Date();
    const days7 = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(start7);
      d.setDate(d.getDate() + i);
      const completed = i < 3;
      days7.push({
        date: formatDate(d),
        dayIndex: i + 1,
        completed,
        tasks: [
          { id: genId(), title: '晨读', durationMin: 30, completed },
          { id: genId(), title: '深度学习', durationMin: 90, completed },
        ],
        completedAt: completed ? d.getTime() : null,
      });
    }
    plans.push({
      id: genId(),
      title: '【测试】7天挑战（3/7点亮）',
      type: 7,
      goal: '测试部分拼图',
      startDate: today,
      createdAt: Date.now(),
      days: days7,
      puzzleCompleted: false,
    });

    // 5-4 30天全部完成
    const start30 = new Date();
    start30.setDate(start30.getDate() - 29);
    const days30 = [];
    for (let i = 0; i < 30; i++) {
      const d = new Date(start30);
      d.setDate(d.getDate() + i);
      days30.push({
        date: formatDate(d),
        dayIndex: i + 1,
        completed: true,
        tasks: [
          { id: genId(), title: '晨读', durationMin: 30, completed: true },
          { id: genId(), title: '深度学习', durationMin: 90, completed: true },
        ],
        completedAt: d.getTime() + 86400000,
      });
    }
    plans.push({
      id: genId(),
      title: '【测试】30天挑战（全部点亮🏆）',
      type: 30,
      goal: '测试完整拼图',
      startDate: formatDate(start30),
      createdAt: Date.now() - 30 * 86400000,
      days: days30,
      puzzleCompleted: true,
    });
    storage.set(STORAGE_KEYS.SHORT_TERM_PLANS, plans);

    alert('✅ 全套模拟数据已注入！\n\n• 今天 = 🌧️雨天（紧急退出）\n• 过去30天 = 随机天气\n• 7天挑战 = 3/7点亮\n• 30天挑战 = 全部点亮\n\n点击确定刷新页面');
    window.location.reload();
  };

  // === 清除所有数据 ===
  const clearAll = () => {
    if (!confirm('⚠️ 确认清除所有数据？\n\n这将删除所有日历记录、每日计划、短期挑战和设置，不可恢复。')) return;
    Object.values(STORAGE_KEYS).forEach(key => storage.remove(key));
    alert('✅ 所有数据已清除');
    window.location.reload();
  };

  // === 测试6：每日独立任务（7天挑战，不同天不同任务） ===
  // 验证逻辑：不同天显示不同任务（基础入门/深入学习/复习巩固阶段）
  const testPerDaySchedules = () => {
    const plans = storage.get(STORAGE_KEYS.SHORT_TERM_PLANS, []);
    const start = new Date();
    const perDaySchedules = generatePerDaySchedules(7);
    const presets = PHASE_PRESETS[7];

    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      const dateStr = formatDate(d);
      const phase = presets.find(p => p.days.includes(i + 1));
      const rawTasks = perDaySchedules[i];
      // 解析任务
      const tasks = rawTasks.map(line => {
        const str = typeof line === 'string' ? line : `${line.title}${line.durationMin}分钟`;
        const m = str.match(/^(.*?)(\d+)\s*分/);
        return {
          id: genId(),
          title: m ? m[1].trim().replace(/^\s*【.*?】\s*/, '') : str,
          durationMin: m ? parseInt(m[2], 10) : 30,
          completed: false,
        };
      });
      days.push({
        date: dateStr,
        dayIndex: i + 1,
        completed: false,
        tasks,
        completedAt: null,
      });
    }
    plans.push({
      id: genId(),
      title: '【测试】7天每日独立任务',
      type: 7,
      goal: '验证不同天显示不同任务 + 阶段标签',
      startDate: today,
      createdAt: Date.now(),
      days,
      puzzleCompleted: false,
    });
    storage.set(STORAGE_KEYS.SHORT_TERM_PLANS, plans);
    alert('✅ 已创建7天每日独立任务挑战\n\n不同天有不同的任务安排：\n• 第1-2天：基础入门（查找概念、阅读教材）\n• 第3-5天：深入学习（背诵、做题、专题）\n• 第6-7天：复习巩固（回顾、找漏洞、模拟测试）\n\n点击确定后页面将刷新，请切换到「短期挑战」查看');
    window.location.reload();
  };

  // === 测试7：14天每日独立任务 ===
  const testPerDay14Days = () => {
    const plans = storage.get(STORAGE_KEYS.SHORT_TERM_PLANS, []);
    const start = new Date();
    const perDaySchedules = generatePerDaySchedules(14);
    const presets = PHASE_PRESETS[14];

    const days = [];
    for (let i = 0; i < 14; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      const dateStr = formatDate(d);
      const phase = presets.find(p => p.days.includes(i + 1));
      const rawTasks = perDaySchedules[i];
      const tasks = rawTasks.map(line => {
        const str = typeof line === 'string' ? line : `${line.title}${line.durationMin}分钟`;
        const m = str.match(/^(.*?)(\d+)\s*分/);
        return {
          id: genId(),
          title: m ? m[1].trim().replace(/^\s*【.*?】\s*/, '') : str,
          durationMin: m ? parseInt(m[2], 10) : 30,
          completed: false,
        };
      });
      days.push({
        date: dateStr,
        dayIndex: i + 1,
        completed: false,
        tasks,
        completedAt: null,
      });
    }
    plans.push({
      id: genId(),
      title: '【测试】14天每日独立任务',
      type: 14,
      goal: '验证14天多阶段任务规划',
      startDate: today,
      createdAt: Date.now(),
      days,
      puzzleCompleted: false,
    });
    storage.set(STORAGE_KEYS.SHORT_TERM_PLANS, plans);
    alert('✅ 已创建14天每日独立任务挑战\n\n4个阶段：\n• 第1-4天：基础入门\n• 第5-10天：深入学习\n• 第11-14天：复习巩固\n\n点击确定后页面将刷新，请切换到「短期挑战」查看');
    window.location.reload();
  };

  // === 测试8：今日专注按钮（今天有未完成任务） ===
  // 验证逻辑：计划列表卡片右上角应显示"🚀 专注今日"按钮 + 今日任务信息行
  const testTodayFocus = () => {
    const plans = storage.get(STORAGE_KEYS.SHORT_TERM_PLANS, []);
    const start = new Date();
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      const dateStr = formatDate(d);
      // 今天（i=0）有3个未完成任务
      const isToday = i === 0;
      const tasks = isToday
        ? [
            { id: genId(), title: '晨读英语', durationMin: 30, completed: false },
            { id: genId(), title: '深度学习', durationMin: 90, completed: false },
            { id: genId(), title: '运动锻炼', durationMin: 30, completed: false },
          ]
        : [
            { id: genId(), title: '待安排', durationMin: 30, completed: false },
          ];
      days.push({
        date: dateStr,
        dayIndex: i + 1,
        completed: false,
        tasks,
        completedAt: null,
      });
    }
    plans.push({
      id: genId(),
      title: '【测试】今日专注测试',
      type: 7,
      goal: '验证计划列表的"🚀 专注今日"按钮显示和跳转',
      startDate: today,
      createdAt: Date.now(),
      days,
      puzzleCompleted: false,
    });
    storage.set(STORAGE_KEYS.SHORT_TERM_PLANS, plans);
    alert('✅ 已创建测试计划（今天有3个未完成任务）\n\n验证要点：\n• 计划卡片右上角显示"🚀 专注今日"按钮\n• 卡片显示"📅 今日任务 · 第 1 天 · 共 3 项 · 合计 150 分钟"\n• 点击按钮 → 直接进入专注会话界面\n• 点击卡片空白处 → 进入详情页\n\n点击确定后页面将刷新');
    window.location.reload();
  };

  const TEST_CARDS = [
    {
      title: '1. 紧急退出记雨天',
      desc: '模拟点击"紧急退出"按钮，今天应被标记为🌧️雨天',
      btn: '🌧️ 模拟紧急退出',
      color: 'from-red-500 to-rose-600',
      onClick: testEmergencyExitRainy,
      verify: '切换到「日历打卡」tab → 今天格子应显示🌧️，右侧详情显示雨天',
    },
    {
      title: '2. 拼图部分点亮（7天）',
      desc: '创建7天挑战，前3天已完成。验证前3块拼图彩色，后4块灰色',
      btn: '🧩 创建7天（3/7）',
      color: 'from-purple-500 to-indigo-600',
      onClick: testPuzzlePartial,
      verify: '切换到「短期挑战」→ 点击该计划 → 拼图板前3块彩色发光，后4块灰色',
    },
    {
      title: '3. 拼图全部点亮（30天）',
      desc: '创建30天挑战全部完成。验证30块全亮+🏆徽章+庆祝动画',
      btn: '🏆 创建30天（全亮）',
      color: 'from-yellow-500 to-orange-600',
      onClick: testPuzzleCompleted,
      verify: '切换到「短期挑战」→ 点击该计划 → 全部彩色 + 🏆已完成徽章 + 庆祝横幅',
    },
    {
      title: '4. 日历历史数据',
      desc: '注入过去30天随机天气（晴/阴/雨），验证日历显示和月度统计',
      btn: '📅 注入30天历史',
      color: 'from-blue-500 to-cyan-600',
      onClick: testCalendarHistory,
      verify: '切换到「日历打卡」→ 过去30天显示各种天气符号 + 月度统计数字正确',
    },
    {
      title: '5. 一键全套测试',
      desc: '同时注入：今天雨天 + 30天历史 + 7天部分挑战 + 30天完成挑战',
      btn: '⚡ 一键全套注入',
      color: 'from-pink-500 to-purple-600',
      onClick: testAllInOne,
      verify: '刷新后各tab查看：日历有数据+今天雨天，短期挑战有两个计划',
    },
    {
      title: '6. 每日独立任务（7天）',
      desc: '创建7天挑战，不同天数不同任务（基础入门/深入学习/复习巩固）',
      btn: '🗓️ 创建7天每日独立',
      color: 'from-emerald-500 to-teal-600',
      onClick: testPerDaySchedules,
      verify: '短期挑战 → 详情页 → 每天任务各不相同，有阶段标签',
    },
    {
      title: '7. 每日独立任务（14天）',
      desc: '创建14天挑战，4个阶段渐进式任务安排',
      btn: '📅 创建14天每日独立',
      color: 'from-cyan-500 to-blue-600',
      onClick: testPerDay14Days,
      verify: '短期挑战 → 详情页 → 14天不同任务 + 阶段总览',
    },
    {
      title: '8. 今日专注按钮测试',
      desc: '创建7天挑战，今天有3个未完成任务（晨读英语/深度学习/运动锻炼），用于测试"🚀 专注今日"按钮',
      btn: '🚀 创建今日专注测试',
      color: 'from-fuchsia-500 to-pink-600',
      onClick: testTodayFocus,
      verify: '短期挑战 → 列表卡片右上角应显示"🚀 专注今日"按钮 + 今日任务信息行；点击按钮直接进入专注会话',
    },
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6 p-5 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-2xl">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          🧪 开发测试面板
        </h2>
        <p className="text-slate-300 text-sm mt-2">
          点击下方按钮一键注入模拟数据，页面会自动刷新，然后切换到对应 tab 查看效果。
          所有模拟数据均存入 localStorage，与真实数据无差别。
        </p>
      </div>

      <div className="space-y-4 mb-8">
        {TEST_CARDS.map((card, idx) => (
          <div
            key={idx}
            className="bg-slate-800/50 rounded-2xl p-5 border border-slate-700 hover:border-slate-600 transition"
          >
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex-1 min-w-60">
                <h3 className="text-lg font-bold text-white mb-1">{card.title}</h3>
                <p className="text-sm text-slate-400 mb-3">{card.desc}</p>
                <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-xl">
                  <div className="text-xs text-green-400 font-medium mb-1">✅ 验证方法</div>
                  <div className="text-xs text-slate-300">{card.verify}</div>
                </div>
              </div>
              <button
                onClick={card.onClick}
                className={`px-6 py-4 bg-gradient-to-r ${card.color} hover:brightness-110 rounded-xl text-white font-bold shadow-lg transition whitespace-nowrap`}
              >
                {card.btn}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 数据状态查看 */}
      <DataInspector />

      {/* 清除按钮 */}
      <div className="mt-8 pt-6 border-t border-slate-700">
        <button
          onClick={clearAll}
          className="w-full p-4 bg-red-500/10 hover:bg-red-500/20 border-2 border-red-500/40 hover:border-red-500/60 rounded-2xl text-red-400 font-bold transition"
        >
          🗑️ 清除所有数据（恢复初始状态）
        </button>
      </div>

      <div className="mt-6 p-4 bg-slate-900/50 rounded-xl text-xs text-slate-400 leading-relaxed">
        <div className="font-bold text-slate-300 mb-2">📌 测试说明</div>
        <ul className="space-y-1 list-disc list-inside">
          <li>模拟数据标题都带【测试】前缀，方便与真实数据区分</li>
          <li>每次注入会追加到已有数据上（不会覆盖），可多次点击</li>
          <li>如需重新开始，点击底部"清除所有数据"按钮</li>
          <li>数据通过 localStorage 持久化，刷新/关闭浏览器不会丢失</li>
        </ul>
      </div>
    </div>
  );
}

// === 数据查看器：实时显示 localStorage 中的数据 ===
function DataInspector() {
  const [refreshKey, setRefreshKey] = useState(0);

  const data = {
    calendarRecords: storage.get(STORAGE_KEYS.CALENDAR_RECORDS, {}),
    dailyPlans: storage.get(STORAGE_KEYS.DAILY_PLANS, {}),
    shortTermPlans: storage.get(STORAGE_KEYS.SHORT_TERM_PLANS, []),
    settings: storage.get(STORAGE_KEYS.SETTINGS, {}),
    activeSession: storage.get(STORAGE_KEYS.ACTIVE_SESSION, null),
  };

  const todayRecord = data.calendarRecords[getTodayStr()];

  return (
    <div className="bg-slate-900/70 rounded-2xl p-5 border border-slate-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold flex items-center gap-2">
          🔍 当前数据快照
        </h3>
        <button
          onClick={() => setRefreshKey(k => k + 1)}
          className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-xs text-slate-300 transition"
        >
          🔄 刷新
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3" key={refreshKey}>
        {/* 今天的状态 */}
        <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700">
          <div className="text-xs text-slate-400 mb-1">今天 ({getTodayStr()})</div>
          {todayRecord ? (
            <div>
              <div className={`text-2xl font-bold ${
                todayRecord.status === 'sunny' ? 'text-yellow-400'
                  : todayRecord.status === 'rainy' ? 'text-blue-400'
                    : 'text-slate-300'
              }`}>
                {todayRecord.status === 'sunny' ? '☀️ 晴天'
                  : todayRecord.status === 'rainy' ? (
                    <span>🌧️<span className="text-red-500 font-bold">!!</span> 雨天</span>
                  )
                    : '⛅ 阴天'}
              </div>
              <div className="text-xs text-slate-500 mt-1">{todayRecord.note}</div>
            </div>
          ) : (
            <div className="text-slate-500 text-sm">未打卡</div>
          )}
        </div>

        {/* 数据统计 */}
        <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700">
          <div className="text-xs text-slate-400 mb-2">数据量统计</div>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-300">日历记录天数</span>
              <span className="text-white font-mono">{Object.keys(data.calendarRecords).length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-300">每日计划天数</span>
              <span className="text-white font-mono">{Object.keys(data.dailyPlans).length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-300">短期挑战数量</span>
              <span className="text-white font-mono">{data.shortTermPlans.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-300">活跃会话</span>
              <span className="text-white font-mono">{data.activeSession ? '有' : '无'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 短期挑战详情 */}
      {data.shortTermPlans.length > 0 && (
        <div className="mt-3 p-4 bg-slate-800/50 rounded-xl border border-slate-700">
          <div className="text-xs text-slate-400 mb-2">短期挑战列表</div>
          <div className="space-y-2">
            {data.shortTermPlans.map((p, i) => {
              const done = p.days.filter(d => d.completed).length;
              return (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="text-slate-300 truncate">{p.title}</span>
                  <span className="text-slate-400 font-mono ml-2 shrink-0">
                    {done}/{p.days.length} {p.puzzleCompleted ? '🏆' : ''}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
