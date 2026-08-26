// 专注力控制软件 - 数据存储与状态管理工具
import { useState, useEffect } from 'react';

const STORAGE_KEYS = {
  DAILY_PLANS: 'focus_dailyPlans',
  CALENDAR_RECORDS: 'focus_calendarRecords',
  SHORT_TERM_PLANS: 'focus_shortTermPlans',
  SETTINGS: 'focus_settings',
  ACTIVE_SESSION: 'focus_activeSession',
};

// 初始化默认设置
const DEFAULT_SETTINGS = {
  allowedApps: ['电话', '微信', '短信'],
  notificationFilter: 'whitelist', // whitelist: 仅白名单显示; all: 全部显示; none: 全部不显示
  emergencyPenalty: true, // 紧急退出是否标记为雨天
  exitReasonMinLength: 100, // 退出理由最少字数
  theme: 'dark',
  // 声音与震动
  soundMode: 'sound', // 'sound': 声音; 'vibrate': 震动; 'mute': 静音
  taskCompleteSound: true, // 完成单个任务时播放提示音
  allCompleteSound: true, // 完成全部任务时播放庆祝音
  soundVolume: 0.7, // 音量 0-1
};

// 本地存储辅助函数
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
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  },
  remove(key) {
    localStorage.removeItem(key);
  },
};

// 获取今天日期字符串 YYYY-MM-DD
export const getTodayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

// 生成唯一ID
export const genId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

// === 设置相关 ===
export const useSettings = () => {
  const [settings, setSettings] = useState(() => {
    const saved = storage.get(STORAGE_KEYS.SETTINGS);
    return saved ? { ...DEFAULT_SETTINGS, ...saved } : DEFAULT_SETTINGS;
  });

  useEffect(() => {
    storage.set(STORAGE_KEYS.SETTINGS, settings);
  }, [settings]);

  const updateSettings = (patch) => {
    setSettings(prev => ({ ...prev, ...patch }));
  };

  const addAllowedApp = (appName) => {
    setSettings(prev => ({
      ...prev,
      allowedApps: [...new Set([...prev.allowedApps, appName])],
    }));
  };

  const removeAllowedApp = (appName) => {
    setSettings(prev => ({
      ...prev,
      allowedApps: prev.allowedApps.filter(a => a !== appName),
    }));
  };

  return { settings, updateSettings, addAllowedApp, removeAllowedApp };
};

// === 日历记录相关 ===
// 状态: 'sunny' 晴天(全部完成), 'cloudy' 阴天(部分完成), 'rainy' 雨天(未完成/紧急退出)
export const useCalendar = () => {
  const [records, setRecords] = useState(() => storage.get(STORAGE_KEYS.CALENDAR_RECORDS, {}));

  useEffect(() => {
    storage.set(STORAGE_KEYS.CALENDAR_RECORDS, records);
  }, [records]);

  const setDayStatus = (dateStr, status, note = '') => {
    setRecords(prev => ({
      ...prev,
      [dateStr]: { status, note, updatedAt: Date.now() },
    }));
  };

  const getDayStatus = (dateStr) => records[dateStr] || null;

  // 获取某月所有记录
  const getMonthRecords = (year, month) => {
    // month: 0-11
    const result = {};
    Object.keys(records).forEach(dateStr => {
      const [y, m] = dateStr.split('-').map(Number);
      if (y === year && m === month + 1) {
        result[dateStr] = records[dateStr];
      }
    });
    return result;
  };

  return { records, setDayStatus, getDayStatus, getMonthRecords };
};

// === 每日计划相关 ===
export const useDailyPlans = () => {
  const [plans, setPlans] = useState(() => storage.get(STORAGE_KEYS.DAILY_PLANS, {}));

  useEffect(() => {
    storage.set(STORAGE_KEYS.DAILY_PLANS, plans);
  }, [plans]);

  const createDailyPlan = (dateStr, tasks) => {
    // tasks: [{ id, title, durationMin, completed, completedAt, appRestriction: [] }]
    setPlans(prev => ({
      ...prev,
      [dateStr]: {
        date: dateStr,
        createdAt: Date.now(),
        tasks: tasks.map(t => ({
          id: genId(),
          completed: false,
          completedAt: null,
          ...t,
        })),
      },
    }));
  };

  const getDailyPlan = (dateStr) => plans[dateStr] || null;

  const toggleTask = (dateStr, taskId) => {
    setPlans(prev => {
      const day = prev[dateStr];
      if (!day) return prev;
      return {
        ...prev,
        [dateStr]: {
          ...day,
          tasks: day.tasks.map(t =>
            t.id === taskId
              ? { ...t, completed: !t.completed, completedAt: !t.completed ? Date.now() : null }
              : t
          ),
        },
      };
    });
  };

  const updateTask = (dateStr, taskId, patch) => {
    setPlans(prev => {
      const day = prev[dateStr];
      if (!day) return prev;
      return {
        ...prev,
        [dateStr]: {
          ...day,
          tasks: day.tasks.map(t => (t.id === taskId ? { ...t, ...patch } : t)),
        },
      };
    });
  };

  const addTask = (dateStr, task) => {
    setPlans(prev => {
      const day = prev[dateStr] || { date: dateStr, createdAt: Date.now(), tasks: [] };
      return {
        ...prev,
        [dateStr]: {
          ...day,
          tasks: [...day.tasks, { id: genId(), completed: false, completedAt: null, ...task }],
        },
      };
    });
  };

  const removeTask = (dateStr, taskId) => {
    setPlans(prev => {
      const day = prev[dateStr];
      if (!day) return prev;
      return {
        ...prev,
        [dateStr]: {
          ...day,
          tasks: day.tasks.filter(t => t.id !== taskId),
        },
      };
    });
  };

  // 检查某天是否所有任务完成
  const isDayCompleted = (dateStr) => {
    const day = plans[dateStr];
    if (!day || day.tasks.length === 0) return false;
    return day.tasks.every(t => t.completed);
  };

  // 获取完成率
  const getDayProgress = (dateStr) => {
    const day = plans[dateStr];
    if (!day || day.tasks.length === 0) return { done: 0, total: 0, rate: 0 };
    const done = day.tasks.filter(t => t.completed).length;
    return { done, total: day.tasks.length, rate: done / day.tasks.length };
  };

  return {
    plans,
    createDailyPlan,
    getDailyPlan,
    toggleTask,
    updateTask,
    addTask,
    removeTask,
    isDayCompleted,
    getDayProgress,
  };
};

// === 短期计划相关 ===
// 类型: 7天, 14天, 30天
export const SHORT_TERM_TYPES = {
  7: { days: 7, label: '7天挑战', puzzlePieces: 7 },
  14: { days: 14, label: '14天挑战', puzzlePieces: 14 },
  30: { days: 30, label: '30天挑战', puzzlePieces: 30 },
};

// 阶段预设：按天数自动生成阶段性日程
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

// 根据天数生成每日独立日程
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

export const useShortTermPlans = () => {
  const [shortPlans, setShortPlans] = useState(() => storage.get(STORAGE_KEYS.SHORT_TERM_PLANS, []));

  useEffect(() => {
    storage.set(STORAGE_KEYS.SHORT_TERM_PLANS, shortPlans);
  }, [shortPlans]);

  const createShortTermPlan = ({ title, type, goal, startDate, dailySchedule = [], perDaySchedules = null }) => {
    // dailySchedule: 统一每日任务 [{ title, durationMin }]（兼容旧版）
    // perDaySchedules: 每日独立任务 [[{ title, durationMin }], ...]，数组索引 = dayIndex-1
    const typeInfo = SHORT_TERM_TYPES[type] || SHORT_TERM_TYPES[7];
    const daysArr = [];
    const start = new Date(startDate);
    for (let i = 0; i < typeInfo.days; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const dayTasks = perDaySchedules && perDaySchedules[i]
        ? perDaySchedules[i]
        : dailySchedule;
      daysArr.push({
        date: dateStr,
        dayIndex: i + 1,
        completed: false,
        tasks: dayTasks.map(t => ({ ...t, id: genId(), completed: false })),
        completedAt: null,
      });
    }
    const newPlan = {
      id: genId(),
      title,
      type,
      goal,
      startDate,
      createdAt: Date.now(),
      days: daysArr,
      puzzleCompleted: false,
    };
    setShortPlans(prev => [...prev, newPlan]);
    return newPlan.id;
  };

  const markDayCompleted = (planId, dayIndex) => {
    setShortPlans(prev =>
      prev.map(p => {
        if (p.id !== planId) return p;
        const newDays = p.days.map(d =>
          d.dayIndex === dayIndex
            ? { ...d, completed: true, completedAt: Date.now() }
            : d
        );
        const allDone = newDays.every(d => d.completed);
        return {
          ...p,
          days: newDays,
          puzzleCompleted: allDone,
        };
      })
    );
  };

  const markDayTask = (planId, dayIndex, taskId, completed, remainingTime = null) => {
    setShortPlans(prev =>
      prev.map(p => {
        if (p.id !== planId) return p;
        return {
          ...p,
          days: p.days.map(d => {
            if (d.dayIndex !== dayIndex) return d;
            const newTasks = d.tasks.map(t =>
              t.id === taskId ? { ...t, completed } : t
            );
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
      })
    );
  };

  const getPlanProgress = (planId) => {
    const plan = shortPlans.find(p => p.id === planId);
    if (!plan) return { done: 0, total: 0, rate: 0 };
    const done = plan.days.filter(d => d.completed).length;
    return { done, total: plan.days.length, rate: done / plan.days.length };
  };

  const deletePlan = (planId) => {
    setShortPlans(prev => prev.filter(p => p.id !== planId));
  };

  const updateDayTasks = (planId, dayIndex, newTasks) => {
    setShortPlans(prev =>
      prev.map(p => {
        if (p.id !== planId) return p;
        return {
          ...p,
          days: p.days.map(d => {
            if (d.dayIndex !== dayIndex) return d;
            const updatedTasks = newTasks.map(t => ({
              ...t,
              id: t.id || genId(),
              completed: t.completed || false,
            }));
            const allDone = updatedTasks.length > 0 && updatedTasks.every(t => t.completed);
            return {
              ...d,
              tasks: updatedTasks,
              completed: allDone,
              completedAt: allDone ? Date.now() : null,
            };
          }),
        };
      })
    );
  };

  const updateShortTermPlan = (planId, updates) => {
    // updates: { title?, goal?, startDate?, dailySchedule?, perDaySchedules? }
    setShortPlans(prev =>
      prev.map(p => {
        if (p.id !== planId) return p;
        const newDays = p.days.map((d, idx) => {
          // 已完成的天保持不变
          if (d.completed) return d;

          // 统一日程模式
          if (updates.dailySchedule) {
            return {
              ...d,
              tasks: updates.dailySchedule.map(t => ({
                ...t,
                id: genId(),
                completed: false,
              })),
              completed: false,
              completedAt: null,
            };
          }

          // 每日独立模式
          if (updates.perDaySchedules && updates.perDaySchedules[idx]) {
            return {
              ...d,
              tasks: updates.perDaySchedules[idx].map(t => ({
                ...t,
                id: genId(),
                completed: false,
              })),
              completed: false,
              completedAt: null,
            };
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
      })
    );
  };

  // 获取某天所属的阶段信息
  const getDayPhase = (plan) => {
    if (!plan) return {};
    const presets = PHASE_PRESETS[plan.type] || PHASE_PRESETS[7];
    return presets.map(p => {
      const range = p.days.length === 1 ? `第${p.days[0]}天` : `第${p.days[0]}-${p.days[p.days.length - 1]}天`;
      return { ...p, range };
    });
  };

  return {
    shortPlans,
    createShortTermPlan,
    markDayCompleted,
    markDayTask,
    getPlanProgress,
    deletePlan,
    updateDayTasks,
    updateShortTermPlan,
    getDayPhase,
  };
};

// === 专注会话控制 ===
// 用于控制计划期间不能退出
export const useActiveSession = () => {
  const [session, setSession] = useState(() => storage.get(STORAGE_KEYS.ACTIVE_SESSION, null));

  useEffect(() => {
    if (session) {
      storage.set(STORAGE_KEYS.ACTIVE_SESSION, session);
    } else {
      storage.remove(STORAGE_KEYS.ACTIVE_SESSION);
    }
  }, [session]);

  const startSession = (planType, planId, dateStr, tasks) => {
    const s = {
      id: genId(),
      planType, // 'daily' | 'shortTerm'
      planId,
      dateStr,
      startedAt: Date.now(),
      tasks: tasks.map(t => ({ ...t, sessionCompleted: false })),
      status: 'running', // running | paused | completed | exited | emergency
    };
    setSession(s);
    return s;
  };

  const completeSession = () => {
    setSession(prev => prev ? { ...prev, status: 'completed', endedAt: Date.now() } : null);
    // 清除
    setTimeout(() => setSession(null), 500);
  };

  const exitWithReason = (reason) => {
    setSession(prev => prev ? { ...prev, status: 'exited', exitReason: reason, endedAt: Date.now() } : null);
    setTimeout(() => setSession(null), 500);
  };

  const emergencyExit = () => {
    setSession(prev => prev ? { ...prev, status: 'emergency', endedAt: Date.now() } : null);
    setTimeout(() => setSession(null), 500);
  };

  const toggleSessionTask = (taskId) => {
    setSession(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        tasks: prev.tasks.map(t =>
          t.id === taskId ? { ...t, sessionCompleted: !t.sessionCompleted } : t
        ),
      };
    });
  };

  return {
    session,
    startSession,
    completeSession,
    exitWithReason,
    emergencyExit,
    toggleSessionTask,
  };
};

// 导出 storage
export { storage, STORAGE_KEYS };

// === 声音与震动工具 ===
let audioCtx = null;

const getAudioCtx = () => {
  if (!audioCtx) {
    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      console.log('[Sound] AudioContext created, state:', audioCtx.state, 'sampleRate:', audioCtx.sampleRate);
    } catch (err) {
      console.error('[Sound] Failed to create AudioContext:', err);
      return null;
    }
  }
  if (audioCtx.state === 'suspended') {
    console.log('[Sound] AudioContext suspended, resuming...');
    audioCtx.resume().then(() => {
      console.log('[Sound] AudioContext resumed');
    }).catch(err => {
      console.error('[Sound] Failed to resume AudioContext:', err);
    });
  }
  return audioCtx;
};

// 播放单个提示音（短促清脆）
const playBeep = (freq = 880, duration = 0.15, volume = 0.7) => {
  console.log(`[Sound] playBeep called: freq=${freq}, duration=${duration}s, volume=${volume}`);
  const ctx = getAudioCtx();
  if (!ctx) {
    console.warn('[Sound] playBeep aborted: no AudioContext available');
    return;
  }
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
    console.log(`[Sound] playBeep started: ${freq}Hz for ${duration}s at volume ${volume}`);
  } catch (err) {
    console.error('[Sound] playBeep error:', err);
  }
};

// 播放完成单个任务的提示音
const playTaskCompleteSound = (volume = 0.7) => {
  console.log(`[Sound] playTaskCompleteSound triggered, volume=${volume}`);
  const ctx = getAudioCtx();
  if (!ctx) {
    console.warn('[Sound] playTaskCompleteSound aborted: no AudioContext');
    return;
  }
  console.log('[Sound] Playing task-complete beep: 880Hz + 1175Hz');
  playBeep(880, 0.1, volume);
  setTimeout(() => {
    console.log('[Sound] Playing second beep: 1175Hz');
    playBeep(1175, 0.12, volume);
  }, 100);
};

// 播放全部完成的庆祝音（三音阶上升）
const playAllCompleteSound = (volume = 0.7) => {
  console.log(`[Sound] playAllCompleteSound triggered, volume=${volume}`);
  const ctx = getAudioCtx();
  if (!ctx) {
    console.warn('[Sound] playAllCompleteSound aborted: no AudioContext');
    return;
  }
  const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
  console.log('[Sound] Playing celebration notes:', notes.join(', '));
  notes.forEach((freq, i) => {
    setTimeout(() => {
      console.log(`[Sound] Celebration note ${i+1}/4: ${freq}Hz`);
      playBeep(freq, 0.2, volume);
    }, i * 150);
  });
};

// 震动模式
const vibrate = (pattern) => {
  console.log(`[Vibrate] vibrate called with pattern:`, pattern);
  if (navigator.vibrate) {
    try {
      const result = navigator.vibrate(pattern);
      console.log('[Vibrate] navigator.vibrate result:', result);
    } catch (err) {
      console.error('[Vibrate] navigator.vibrate error:', err);
    }
  } else {
    console.warn('[Vibrate] navigator.vibrate not supported on this device');
  }
};

// 统一的提示入口
export const playNotification = (type, settings) => {
  console.log(`[Sound] playNotification called: type="${type}"`, {
    soundMode: settings?.soundMode,
    taskCompleteSound: settings?.taskCompleteSound,
    allCompleteSound: settings?.allCompleteSound,
    soundVolume: settings?.soundVolume,
  });
  
  if (!settings) {
    console.warn('[Sound] No settings provided, skipping');
    return;
  }
  
  const { soundMode, taskCompleteSound, allCompleteSound, soundVolume } = settings;
  
  if (soundMode === 'mute') {
    console.log('[Sound] MUTE mode: no notification played');
    return;
  }
  
  if (soundMode === 'vibrate') {
    if (type === 'task' && taskCompleteSound) {
      console.log('[Sound] VIBRATE mode: task complete vibration');
      vibrate([50, 50, 50]);
    } else if (type === 'all' && allCompleteSound) {
      console.log('[Sound] VIBRATE mode: all complete vibration');
      vibrate([100, 50, 100, 50, 200]);
    } else {
      console.log('[Sound] VIBRATE mode: sound disabled for this type or type unknown');
    }
    return;
  }
  
  // sound mode
  if (type === 'task') {
    if (taskCompleteSound) {
      console.log('[Sound] SOUND mode: playing task-complete sound');
      playTaskCompleteSound(soundVolume);
    } else {
      console.log('[Sound] SOUND mode: task sound disabled in settings');
    }
  } else if (type === 'all') {
    if (allCompleteSound) {
      console.log('[Sound] SOUND mode: playing celebration sound');
      playAllCompleteSound(soundVolume);
    } else {
      console.log('[Sound] SOUND mode: celebration sound disabled in settings');
    }
  } else {
    console.warn(`[Sound] Unknown notification type: "${type}"`);
  }
};

// 测试音效
export const testSound = (type, settings) => {
  console.log(`[Sound] testSound: type="${type}"`);
  const s = settings || { soundVolume: 0.7 };
  if (type === 'task') {
    playTaskCompleteSound(s.soundVolume);
  } else if (type === 'all') {
    playAllCompleteSound(s.soundVolume);
  }
};

export const testVibrate = (type) => {
  console.log(`[Sound] testVibrate: type="${type}"`);
  if (type === 'task') {
    vibrate([50, 50, 50]);
  } else if (type === 'all') {
    vibrate([100, 50, 100, 50, 200]);
  }
};

// === 成就与统计系统 ===
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

// 计算连续打卡天数
const calcMaxStreak = (records) => {
  const dates = Object.keys(records).filter(d => records[d].status === 'sunny').sort();
  if (dates.length === 0) return 0;
  let maxStreak = 1;
  let currentStreak = 1;
  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i - 1]);
    const curr = new Date(dates[i]);
    const diffDays = (curr - prev) / (1000 * 60 * 60 * 24);
    if (diffDays === 1) {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else {
      currentStreak = 1;
    }
  }
  return maxStreak;
};

// 获取统计数据
export const getStatistics = () => {
  const records = storage.get(STORAGE_KEYS.CALENDAR_RECORDS, {});
  const dailyPlans = storage.get(STORAGE_KEYS.DAILY_PLANS, {});
  const shortTermPlans = storage.get(STORAGE_KEYS.SHORT_TERM_PLANS, []);

  const allDays = Object.keys(records);
  const sunnyDays = allDays.filter(d => records[d].status === 'sunny').length;
  const cloudyDays = allDays.filter(d => records[d].status === 'cloudy').length;
  const rainyDays = allDays.filter(d => records[d].status === 'rainy').length;
  const maxStreak = calcMaxStreak(records);

  // 总完成任务数
  let totalTasks = 0;
  Object.values(dailyPlans).forEach(plan => {
    if (plan.tasks) {
      totalTasks += plan.tasks.filter(t => t.completed).length;
    }
  });

  // 已完成短期挑战数
  const completedShortPlans = shortTermPlans.filter(p => p.puzzleCompleted).length;

  // 当月统计
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const monthDays = allDays.filter(d => {
    const [y, m] = d.split('-').map(Number);
    return y === year && m === month;
  });
  const monthSunny = monthDays.filter(d => records[d].status === 'sunny').length;
  const monthTotal = monthDays.length;

  // 总专注时长估算（基于任务时长）
  let totalMinutes = 0;
  Object.values(dailyPlans).forEach(plan => {
    if (plan.tasks) {
      plan.tasks.forEach(t => {
        if (t.completed) totalMinutes += t.durationMin || 0;
      });
    }
  });

  const stats = {
    sunnyDays,
    cloudyDays,
    rainyDays,
    maxStreak,
    totalTasks,
    completedShortPlans,
    monthSunny,
    monthTotal,
    totalMinutes,
  };

  // 计算等级
  const exp = sunnyDays * 10 + totalTasks * 2 + completedShortPlans * 50;
  let currentLevel = LEVELS[0];
  let nextLevel = LEVELS[1];
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (exp >= LEVELS[i].minExp) {
      currentLevel = LEVELS[i];
      nextLevel = LEVELS[i + 1] || null;
      break;
    }
  }

  const unlockedAchievements = ACHIEVEMENTS.filter(a => a.check(stats)).map(a => a.id);

  return {
    ...stats,
    exp,
    currentLevel,
    nextLevel,
    progressToNext: nextLevel ? Math.min(100, Math.round(((exp - currentLevel.minExp) / (nextLevel.minExp - currentLevel.minExp)) * 100)) : 100,
    unlockedAchievements,
  };
};

// === 数据备份 ===
export const exportAllData = () => {
  const data = {};
  Object.values(STORAGE_KEYS).forEach(key => {
    data[key] = storage.get(key, null);
  });
  data.__exportMeta = {
    timestamp: Date.now(),
    version: 1,
    app: 'FocusSelf',
  };
  return JSON.stringify(data, null, 2);
};

export const importAllData = (jsonString) => {
  try {
    const data = JSON.parse(jsonString);
    if (!data.__exportMeta || data.__exportMeta.app !== 'FocusSelf') {
      return { success: false, error: '无效的备份文件' };
    }
    let importedCount = 0;
    Object.keys(STORAGE_KEYS).forEach(key => {
      if (data[key] !== null && data[key] !== undefined) {
        storage.set(key, data[key]);
        importedCount++;
      }
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
  const dateStr = getTodayStr();
  a.href = url;
  a.download = `focus-self-backup-${dateStr}.json`;
  a.click();
  URL.revokeObjectURL(url);
};
