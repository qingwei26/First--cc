// 专注力控制软件 - 统一状态管理（Zustand）
// 所有模块共享同一份状态，修复了之前多 Hook 多副本导致的数据不一致问题
import { create } from 'zustand';

// === 常量 ===
export const STORAGE_KEYS = {
  DAILY_PLANS: 'focus_dailyPlans',
  CALENDAR_RECORDS: 'focus_calendarRecords',
  SHORT_TERM_PLANS: 'focus_shortTermPlans',
  SETTINGS: 'focus_settings',
  ACTIVE_SESSION: 'focus_activeSession',
};

const DEFAULT_SETTINGS = {
  allowedApps: ['电话', '微信', '短信'],
  notificationFilter: 'whitelist',
  emergencyPenalty: true,
  exitReasonMinLength: 100,
  theme: 'dark',
  soundMode: 'sound',
  taskCompleteSound: true,
  allCompleteSound: true,
  soundVolume: 0.7,
};

export const SHORT_TERM_TYPES = {
  7: { days: 7, label: '7天挑战', puzzlePieces: 7 },
  14: { days: 14, label: '14天挑战', puzzlePieces: 14 },
  30: { days: 30, label: '30天挑战', puzzlePieces: 30 },
};

export const PHASE_PRESETS = {
  7: [
    { phase: '基础入门', days: [1, 2], tasks: '查找基本概念及知识30分钟\n阅读入门教材45分钟\n整理笔记15分钟' },
    { phase: '深入学习', days: [3, 4, 5], tasks: '深入学习核心内容60分钟\n背诵重要知识点30分钟\n做题/练习45分钟' },
    { phase: '复习巩固', days: [6, 7], tasks: '回顾全部知识点45分钟\n查找漏洞并补强30分钟\n模拟测试45分钟' },
  ],
  14: [
    { phase: '基础入门', days: [1, 2, 3, 4], tasks: '查找基本概念及知识30分钟\n阅读入门教材45分钟\n观看入门视频30分钟\n整理笔记20分钟' },
    { phase: '深入学习', days: [5, 6, 7, 8, 9, 10], tasks: '深入学习核心内容60分钟\n背诵重要知识点45分钟\n做题/练习60分钟\n专题研究30分钟' },
    { phase: '复习巩固', days: [11, 12, 13, 14], tasks: '回顾全部知识点45分钟\n查找漏洞并补强45分钟\n模拟测试60分钟\n总结复盘30分钟' },
  ],
  30: [
    { phase: '基础入门', days: [1, 2, 3, 4, 5, 6, 7, 8], tasks: '查找基本概念及知识30分钟\n阅读入门教材45分钟\n观看入门视频30分钟\n整理笔记20分钟' },
    { phase: '深入学习', days: [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20], tasks: '深入学习核心内容60分钟\n背诵重要知识点45分钟\n做题/练习60分钟\n专题研究45分钟\n思维导图整理30分钟' },
    { phase: '强化训练', days: [21, 22, 23, 24, 25], tasks: '高强度刷题90分钟\n难点攻克60分钟\n错题回顾30分钟\n模拟考试60分钟' },
    { phase: '冲刺复习', days: [26, 27, 28, 29, 30], tasks: '全面回顾45分钟\n查找漏洞并补强60分钟\n全真模拟测试90分钟\n总结复盘30分钟' },
  ],
};

export const ACHIEVEMENTS = [
  { id: 'first_day', name: '初次打卡', desc: '完成第一天的所有任务', emoji: '🌱', check: (s) => s.sunnyDays >= 1 },
  { id: 'streak_3', name: '坚持3天', desc: '连续3天完成全部任务', emoji: '🔥', check: (s) => s.maxStreak >= 3 },
  { id: 'streak_7', name: '一周战士', desc: '连续7天完成全部任务', emoji: '🏅', check: (s) => s.maxStreak >= 7 },
  { id: 'streak_14', name: '两周勇者', desc: '连续14天完成全部任务', emoji: '💎', check: (s) => s.maxStreak >= 14 },
  { id: 'streak_30', name: '月度达人', desc: '连续30天完成全部任务', emoji: '👑', check: (s) => s.maxStreak >= 30 },
  { id: 'short_7', name: '7天挑战', desc: '完成一个7天短期挑战', emoji: '🎯', check: (s) => s.completedShortPlans >= 1 },
  { id: 'short_14', name: '14天挑战', desc: '完成一个14天短期挑战', emoji: '🚀', check: (s) => s.completedShortPlans >= 2 },
  { id: 'short_30', name: '30天挑战', desc: '完成一个30天短期挑战', emoji: '🌟', check: (s) => s.completedShortPlans >= 3 },
  { id: 'total_50', name: '50天阳光', desc: '累计50天全部完成', emoji: '☀️', check: (s) => s.sunnyDays >= 50 },
  { id: 'total_100', name: '百日筑基', desc: '累计100天全部完成', emoji: '🏆', check: (s) => s.sunnyDays >= 100 },
  { id: 'tasks_100', name: '百项任务', desc: '累计完成100个任务', emoji: '✅', check: (s) => s.totalTasks >= 100 },
  { id: 'tasks_500', name: '五百任务', desc: '累计完成500个任务', emoji: '🎖️', check: (s) => s.totalTasks >= 500 },
];

export const LEVELS = [
  { level: 1, name: '初心者', emoji: '🌱', minExp: 0 },
  { level: 2, name: '入门者', emoji: '🌿', minExp: 100 },
  { level: 3, name: '进阶者', emoji: '🌳', minExp: 300 },
  { level: 4, name: '熟练者', emoji: '⭐', minExp: 600 },
  { level: 5, name: '精通者', emoji: '🌟', minExp: 1000 },
  { level: 6, name: '专家', emoji: '💎', minExp: 1500 },
  { level: 7, name: '大师', emoji: '👑', minExp: 2500 },
  { level: 8, name: '传奇', emoji: '🏆', minExp: 5000 },
];

// === 工具函数 ===
export const getTodayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const genId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

// 本地存储辅助 + debounce
const storage = {
  get(key, defaultValue = null) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : defaultValue;
    } catch {
      return defaultValue;
    }
  },
  set(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* quota */ }
  },
  remove(key) { localStorage.removeItem(key); },
};

// debounce 封装，避免高频写入 localStorage
const debouncedWrites = {};
const debouncedSet = (key, value, delay = 300) => {
  if (debouncedWrites[key]) clearTimeout(debouncedWrites[key]);
  debouncedWrites[key] = setTimeout(() => {
    storage.set(key, value);
    delete debouncedWrites[key];
  }, delay);
};

// === 统一 Zustand Store ===
const createInitialState = () => ({
  settings: { ...DEFAULT_SETTINGS, ...storage.get(STORAGE_KEYS.SETTINGS, {}) },
  records: storage.get(STORAGE_KEYS.CALENDAR_RECORDS, {}),
  plans: storage.get(STORAGE_KEYS.DAILY_PLANS, {}),
  shortPlans: storage.get(STORAGE_KEYS.SHORT_TERM_PLANS, []),
  session: storage.get(STORAGE_KEYS.ACTIVE_SESSION, null),
});

// 持久化 effect 包装器 —— 自动 debounce 写 localStorage
const persist = (key, selector) => (set, get) => (listener) => {
  const unsubscribe = get.subscribe((state, prevState) => {
    const next = selector(state);
    const prev = selector(prevState);
    if (next !== prev) debouncedSet(key, next);
  });
  return unsubscribe;
};

export const useStore = create((set, get) => ({
  ...createInitialState(),

  // === 设置 ===
  updateSettings: (patch) => set(s => ({ settings: { ...s.settings, ...patch } })),
  addAllowedApp: (appName) => set(s => ({
    settings: { ...s.settings, allowedApps: [...new Set([...s.settings.allowedApps, appName])] }
  })),
  removeAllowedApp: (appName) => set(s => ({
    settings: { ...s.settings, allowedApps: s.settings.allowedApps.filter(a => a !== appName) }
  })),

  // === 日历 ===
  setDayStatus: (dateStr, status, note = '') => set(s => ({
    records: { ...s.records, [dateStr]: { status, note, updatedAt: Date.now() } }
  })),

  // === 每日计划 ===
  createDailyPlan: (dateStr, tasks) => set(s => ({
    plans: {
      ...s.plans,
      [dateStr]: {
        date: dateStr, createdAt: Date.now(),
        tasks: tasks.map(t => ({ id: genId(), completed: false, completedAt: null, ...t })),
      },
    },
  })),
  toggleTask: (dateStr, taskId) => set(s => {
    const day = s.plans[dateStr];
    if (!day) return {};
    return {
      plans: {
        ...s.plans,
        [dateStr]: {
          ...day,
          tasks: day.tasks.map(t =>
            t.id === taskId
              ? { ...t, completed: !t.completed, completedAt: !t.completed ? Date.now() : null }
              : t
          ),
        },
      },
    };
  }),
  setTaskCompleted: (dateStr, taskId, completed) => set(s => {
    const day = s.plans[dateStr];
    if (!day) return {};
    return {
      plans: {
        ...s.plans,
        [dateStr]: {
          ...day,
          tasks: day.tasks.map(t =>
            t.id === taskId
              ? { ...t, completed, completedAt: completed ? Date.now() : null }
              : t
          ),
        },
      },
    };
  }),
  updateTask: (dateStr, taskId, patch) => set(s => {
    const day = s.plans[dateStr];
    if (!day) return {};
    return {
      plans: {
        ...s.plans,
        [dateStr]: {
          ...day,
          tasks: day.tasks.map(t => (t.id === taskId ? { ...t, ...patch } : t)),
        },
      },
    };
  }),
  addTask: (dateStr, task) => set(s => {
    const day = s.plans[dateStr] || { date: dateStr, createdAt: Date.now(), tasks: [] };
    return {
      plans: {
        ...s.plans,
        [dateStr]: { ...day, tasks: [...day.tasks, { id: genId(), completed: false, completedAt: null, ...task }] },
      },
    };
  }),
  removeTask: (dateStr, taskId) => set(s => {
    const day = s.plans[dateStr];
    if (!day) return {};
    return {
      plans: {
        ...s.plans,
        [dateStr]: { ...day, tasks: day.tasks.filter(t => t.id !== taskId) },
      },
    };
  }),

  // === 短期计划 ===
  createShortTermPlan: ({ title, type, goal, startDate, dailySchedule = [], perDaySchedules = null }) => {
    const typeInfo = SHORT_TERM_TYPES[type] || SHORT_TERM_TYPES[7];
    const daysArr = [];
    const start = new Date(startDate);
    for (let i = 0; i < typeInfo.days; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const dayTasks = perDaySchedules && perDaySchedules[i] ? perDaySchedules[i] : dailySchedule;
      daysArr.push({
        date: dateStr, dayIndex: i + 1, completed: false,
        tasks: dayTasks.map(t => ({ ...t, id: genId(), completed: false })),
        completedAt: null,
      });
    }
    const newPlan = {
      id: genId(), title, type, goal, startDate, createdAt: Date.now(),
      days: daysArr, puzzleCompleted: false,
    };
    set(s => ({ shortPlans: [...s.shortPlans, newPlan] }));
    return newPlan.id;
  },
  markDayCompleted: (planId, dayIndex) => set(s => ({
    shortPlans: s.shortPlans.map(p => {
      if (p.id !== planId) return p;
      const newDays = p.days.map(d =>
        d.dayIndex === dayIndex ? { ...d, completed: true, completedAt: Date.now() } : d
      );
      const allDone = newDays.every(d => d.completed);
      return { ...p, days: newDays, puzzleCompleted: allDone };
    }),
  })),
  markDayTask: (planId, dayIndex, taskId, completed, remainingTime = null) => set(s => ({
    shortPlans: s.shortPlans.map(p => {
      if (p.id !== planId) return p;
      return {
        ...p,
        days: p.days.map(d => {
          if (d.dayIndex !== dayIndex) return d;
          const newTasks = d.tasks.map(t => (t.id === taskId ? { ...t, completed } : t));
          const allTasksDone = newTasks.length > 0 && newTasks.every(t => t.completed);
          return {
            ...d,
            tasks: newTasks,
            completed: allTasksDone,
            completedAt: allTasksDone ? Date.now() : d.completedAt,
            remainingTime: allTasksDone && remainingTime !== null ? remainingTime : d.remainingTime,
          };
        }),
      };
    }),
  })),
  deletePlan: (planId) => set(s => ({ shortPlans: s.shortPlans.filter(p => p.id !== planId) })),
  updateDayTasks: (planId, dayIndex, newTasks) => set(s => ({
    shortPlans: s.shortPlans.map(p => {
      if (p.id !== planId) return p;
      return {
        ...p,
        days: p.days.map(d => {
          if (d.dayIndex !== dayIndex) return d;
          const updatedTasks = newTasks.map(t => ({ ...t, id: t.id || genId(), completed: t.completed || false }));
          const allDone = updatedTasks.length > 0 && updatedTasks.every(t => t.completed);
          return { ...d, tasks: updatedTasks, completed: allDone, completedAt: allDone ? Date.now() : null };
        }),
      };
    }),
  })),
  updateShortTermPlan: (planId, updates) => set(s => ({
    shortPlans: s.shortPlans.map(p => {
      if (p.id !== planId) return p;
      const newDays = p.days.map((d, idx) => {
        if (d.completed) return d;
        if (updates.dailySchedule) {
          return { ...d, tasks: updates.dailySchedule.map(t => ({ ...t, id: genId(), completed: false })), completed: false, completedAt: null };
        }
        if (updates.perDaySchedules && updates.perDaySchedules[idx]) {
          return { ...d, tasks: updates.perDaySchedules[idx].map(t => ({ ...t, id: genId(), completed: false })), completed: false, completedAt: null };
        }
        return d;
      });
      return {
        ...p,
        title: updates.title ?? p.title,
        goal: updates.goal ?? p.goal,
        startDate: updates.startDate ?? p.startDate,
        days: newDays,
      };
    }),
  })),

  // === 专注会话 ===
  startSession: (planType, planId, dateStr, tasks) => {
    const s = {
      id: genId(), planType, planId, dateStr,
      startedAt: Date.now(),
      tasks: tasks.map(t => ({ ...t, sessionCompleted: !!t.completed })),
      status: 'running',
    };
    set({ session: s });
    return s;
  },
  completeSession: () => set(s => {
    // 用 Promise 模拟延迟清理，避免卸载警告；组件内部自己处理退出
    Promise.resolve().then(() => {
      if (get().session?.id === s.session?.id) set({ session: null });
    });
    return { session: s.session ? { ...s.session, status: 'completed', endedAt: Date.now() } : null };
  }),
  exitWithReason: (reason) => set(s => {
    Promise.resolve().then(() => {
      if (get().session?.id === s.session?.id) set({ session: null });
    });
    return { session: s.session ? { ...s.session, status: 'exited', exitReason: reason, endedAt: Date.now() } : null };
  }),
  emergencyExit: () => set(s => {
    Promise.resolve().then(() => {
      if (get().session?.id === s.session?.id) set({ session: null });
    });
    return { session: s.session ? { ...s.session, status: 'emergency', endedAt: Date.now() } : null };
  }),
  toggleSessionTask: (taskId) => set(s => {
    if (!s.session) return {};
    return {
      session: {
        ...s.session,
        tasks: s.session.tasks.map(t =>
          t.id === taskId ? { ...t, sessionCompleted: !t.sessionCompleted } : t
        ),
      },
    };
  }),
}));

// === 派生查询函数（避免组件重复计算） ===
export const getDayStatus = (dateStr) => useStore.getState().records[dateStr] || null;
export const getMonthRecords = (year, month) => {
  const records = useStore.getState().records;
  const result = {};
  Object.keys(records).forEach(dateStr => {
    const [y, m] = dateStr.split('-').map(Number);
    if (y === year && m === month + 1) result[dateStr] = records[dateStr];
  });
  return result;
};
export const getDailyPlan = (dateStr) => useStore.getState().plans[dateStr] || null;
export const isDayCompleted = (dateStr) => {
  const day = useStore.getState().plans[dateStr];
  return day && day.tasks.length > 0 && day.tasks.every(t => t.completed);
};
export const getDayProgress = (dateStr) => {
  const day = useStore.getState().plans[dateStr];
  if (!day || day.tasks.length === 0) return { done: 0, total: 0, rate: 0 };
  const done = day.tasks.filter(t => t.completed).length;
  return { done, total: day.tasks.length, rate: done / day.tasks.length };
};
export const getPlanProgress = (planId) => {
  const plan = useStore.getState().shortPlans.find(p => p.id === planId);
  if (!plan) return { done: 0, total: 0, rate: 0 };
  const done = plan.days.filter(d => d.completed).length;
  return { done, total: plan.days.length, rate: done / plan.days.length };
};
export const getDayPhase = (plan) => {
  if (!plan) return {};
  const presets = PHASE_PRESETS[plan.type] || PHASE_PRESETS[7];
  return presets.map(p => {
    const range = p.days.length === 1 ? `第${p.days[0]}天` : `第${p.days[0]}-${p.days[p.days.length - 1]}天`;
    return { ...p, range };
  });
};

// === 每日独立日程生成 ===
export const generatePerDaySchedules = (type) => {
  const typeInfo = SHORT_TERM_TYPES[type] || SHORT_TERM_TYPES[7];
  const presets = PHASE_PRESETS[type] || PHASE_PRESETS[7];
  const schedules = [];
  for (let i = 0; i < typeInfo.days; i++) {
    const dayIdx = i + 1;
    const phase = presets.find(p => p.days.includes(dayIdx));
    const taskText = phase
      ? `【${phase.phase}】\n${phase.tasks}`
      : '晨读30分钟\n深度学习90分钟\n运动30分钟';
    schedules.push(taskText.split('\n').map(line => line.trim()).filter(Boolean));
  }
  return schedules;
};

// === 统计 ===
const calcMaxStreak = (records) => {
  const dates = Object.keys(records).filter(d => records[d].status === 'sunny').sort();
  if (dates.length === 0) return 0;
  let maxStreak = 1, currentStreak = 1;
  for (let i = 1; i < dates.length; i++) {
    const diffDays = (new Date(dates[i]) - new Date(dates[i - 1])) / 86400000;
    if (diffDays === 1) { currentStreak++; maxStreak = Math.max(maxStreak, currentStreak); }
    else currentStreak = 1;
  }
  return maxStreak;
};

export const getStatistics = () => {
  const records = storage.get(STORAGE_KEYS.CALENDAR_RECORDS, {});
  const dailyPlans = storage.get(STORAGE_KEYS.DAILY_PLANS, {});
  const shortTermPlans = storage.get(STORAGE_KEYS.SHORT_TERM_PLANS, []);

  const allDays = Object.keys(records);
  const sunnyDays = allDays.filter(d => records[d].status === 'sunny').length;
  const cloudyDays = allDays.filter(d => records[d].status === 'cloudy').length;
  const rainyDays = allDays.filter(d => records[d].status === 'rainy').length;
  const maxStreak = calcMaxStreak(records);

  let totalTasks = 0, totalMinutes = 0;
  Object.values(dailyPlans).forEach(plan => {
    if (plan.tasks) {
      plan.tasks.forEach(t => {
        if (t.completed) { totalTasks++; totalMinutes += t.durationMin || 0; }
      });
    }
  });

  const completedShortPlans = shortTermPlans.filter(p => p.puzzleCompleted).length;

  const now = new Date();
  const year = now.getFullYear(), month = now.getMonth() + 1;
  const monthDays = allDays.filter(d => {
    const [y, m] = d.split('-').map(Number);
    return y === year && m === month;
  });
  const monthSunny = monthDays.filter(d => records[d].status === 'sunny').length;

  const stats = { sunnyDays, cloudyDays, rainyDays, maxStreak, totalTasks, completedShortPlans, monthSunny, monthTotal: monthDays.length, totalMinutes };

  const exp = sunnyDays * 10 + totalTasks * 2 + completedShortPlans * 50;
  let currentLevel = LEVELS[0], nextLevel = LEVELS[1];
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (exp >= LEVELS[i].minExp) {
      currentLevel = LEVELS[i];
      nextLevel = LEVELS[i + 1] || null;
      break;
    }
  }
  const unlockedAchievements = ACHIEVEMENTS.filter(a => a.check(stats)).map(a => a.id);
  return {
    ...stats, exp, currentLevel, nextLevel,
    progressToNext: nextLevel ? Math.min(100, Math.round(((exp - currentLevel.minExp) / (nextLevel.minExp - currentLevel.minExp)) * 100)) : 100,
    unlockedAchievements,
  };
};

// === 备份 ===
export const exportAllData = () => {
  const data = {};
  Object.values(STORAGE_KEYS).forEach(key => { data[key] = storage.get(key, null); });
  data.__exportMeta = { timestamp: Date.now(), version: 1, app: 'FocusSelf' };
  return JSON.stringify(data, null, 2);
};

export const importAllData = (jsonString) => {
  try {
    const data = JSON.parse(jsonString);
    if (!data.__exportMeta || data.__exportMeta.app !== 'FocusSelf') return { success: false, error: '无效的备份文件' };
    let importedCount = 0;
    Object.keys(STORAGE_KEYS).forEach(key => {
      if (data[key] !== null && data[key] !== undefined) { storage.set(key, data[key]); importedCount++; }
    });
    // 同步到 store
    useStore.setState({
      settings: { ...DEFAULT_SETTINGS, ...data[STORAGE_KEYS.SETTINGS] },
      records: data[STORAGE_KEYS.CALENDAR_RECORDS] || {},
      plans: data[STORAGE_KEYS.DAILY_PLANS] || {},
      shortPlans: data[STORAGE_KEYS.SHORT_TERM_PLANS] || [],
      session: data[STORAGE_KEYS.ACTIVE_SESSION] || null,
    });
    return { success: true, importedCount };
  } catch (err) {
    return { success: false, error: '解析失败，请检查文件格式' };
  }
};

export const downloadBackup = () => {
  const json = exportAllData();
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `focus-self-backup-${getTodayStr()}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

// === 声音系统（单例 AudioContext + 无 console.log） ===
let _audioCtx = null;
const getAudioCtx = () => {
  if (!_audioCtx) {
    try { _audioCtx = new (window.AudioContext || window.webkitAudioContext)(); }
    catch { return null; }
  }
  if (_audioCtx.state === 'suspended') _audioCtx.resume().catch(() => {});
  return _audioCtx;
};

const _activeTimeouts = new Set();
const scheduleTimeout = (fn, delay) => {
  const id = setTimeout(() => { _activeTimeouts.delete(id); fn(); }, delay);
  _activeTimeouts.add(id);
  return id;
};

export const clearAudioTimeouts = () => {
  _activeTimeouts.forEach(id => clearTimeout(id));
  _activeTimeouts.clear();
};

const playBeep = (freq = 880, duration = 0.15, volume = 0.7) => {
  const ctx = getAudioCtx();
  if (!ctx) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    osc.type = 'sine';
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch { /* ignore */ }
};

const playTaskCompleteSound = (volume = 0.7) => {
  playBeep(880, 0.1, volume);
  scheduleTimeout(() => playBeep(1175, 0.12, volume), 100);
};

const playAllCompleteSound = (volume = 0.7) => {
  [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
    scheduleTimeout(() => playBeep(freq, 0.2, volume), i * 150);
  });
};

const vibrate = (pattern) => {
  if (navigator.vibrate) {
    try { navigator.vibrate(pattern); } catch { /* ignore */ }
  }
};

export const playNotification = (type, settings) => {
  if (!settings || settings.soundMode === 'mute') return;
  const { soundMode, taskCompleteSound, allCompleteSound, soundVolume } = settings;

  if (soundMode === 'vibrate') {
    if (type === 'task' && taskCompleteSound) vibrate([50, 50, 50]);
    else if (type === 'all' && allCompleteSound) vibrate([100, 50, 100, 50, 200]);
    return;
  }

  if (type === 'task' && taskCompleteSound) playTaskCompleteSound(soundVolume);
  else if (type === 'all' && allCompleteSound) playAllCompleteSound(soundVolume);
};

export const testSound = (type, settings) => {
  const s = settings || { soundVolume: 0.7 };
  if (type === 'task') playTaskCompleteSound(s.soundVolume);
  else if (type === 'all') playAllCompleteSound(s.soundVolume);
};

export const testVibrate = (type) => {
  if (type === 'task') vibrate([50, 50, 50]);
  else if (type === 'all') vibrate([100, 50, 100, 50, 200]);
};

// 兼容旧 API 签名（仍然导出 storage）
export { storage };

// === 兼容旧 Hook 签名的函数（内部委托到 store） ===
export const useSettings = () => ({
  settings: useStore(s => s.settings),
  updateSettings: useStore(s => s.updateSettings),
  addAllowedApp: useStore(s => s.addAllowedApp),
  removeAllowedApp: useStore(s => s.removeAllowedApp),
});

export const useCalendar = () => ({
  records: useStore(s => s.records),
  setDayStatus: useStore(s => s.setDayStatus),
  getDayStatus,
  getMonthRecords,
});

export const useDailyPlans = () => ({
  plans: useStore(s => s.plans),
  createDailyPlan: useStore(s => s.createDailyPlan),
  getDailyPlan,
  toggleTask: useStore(s => s.toggleTask),
  setTaskCompleted: useStore(s => s.setTaskCompleted),
  updateTask: useStore(s => s.updateTask),
  addTask: useStore(s => s.addTask),
  removeTask: useStore(s => s.removeTask),
  isDayCompleted,
  getDayProgress,
});

export const useShortTermPlans = () => ({
  shortPlans: useStore(s => s.shortPlans),
  createShortTermPlan: useStore(s => s.createShortTermPlan),
  markDayCompleted: useStore(s => s.markDayCompleted),
  markDayTask: useStore(s => s.markDayTask),
  getPlanProgress,
  deletePlan: useStore(s => s.deletePlan),
  updateDayTasks: useStore(s => s.updateDayTasks),
  updateShortTermPlan: useStore(s => s.updateShortTermPlan),
  getDayPhase,
});

export const useActiveSession = () => ({
  session: useStore(s => s.session),
  startSession: useStore(s => s.startSession),
  completeSession: useStore(s => s.completeSession),
  exitWithReason: useStore(s => s.exitWithReason),
  emergencyExit: useStore(s => s.emergencyExit),
  toggleSessionTask: useStore(s => s.toggleSessionTask),
});
