// 短期计划模块 - 7/14/30天挑战 + 拼图点亮 + 每日独立任务设计
import { useState, useEffect, useMemo } from 'react';
import {
  useShortTermPlans,
  useActiveSession,
  useCalendar,
  useSettings,
  SHORT_TERM_TYPES,
  PHASE_PRESETS,
  generatePerDaySchedules,
  getTodayStr,
  playNotification,
} from '../focusStore';

// 生成拼图格子颜色
const PUZZLE_COLORS = [
  '#f97316', '#eab308', '#22c55e', '#14b8a6', '#3b82f6', '#8b5cf6', '#ec4899',
  '#ef4444', '#f59e0b', '#84cc16', '#06b6d4', '#6366f1', '#d946ef', '#f43f5e',
];

// 阶段颜色映射
const PHASE_COLORS = {
  '基础入门': 'from-green-500 to-emerald-500',
  '深入学习': 'from-blue-500 to-cyan-500',
  '复习巩固': 'from-orange-500 to-amber-500',
  '强化训练': 'from-red-500 to-pink-500',
  '冲刺复习': 'from-yellow-500 to-orange-500',
  'default': 'from-slate-500 to-slate-600',
};

export default function ShortTermPlan() {
  const {
    shortPlans,
    createShortTermPlan,
    markDayTask,
    deletePlan,
    getPlanProgress,
    updateDayTasks,
    updateShortTermPlan,
    getDayPhase,
  } = useShortTermPlans();
  const {
    session,
    startSession,
    completeSession,
    exitWithReason,
    emergencyExit,
    toggleSessionTask,
  } = useActiveSession();
  const { setDayStatus } = useCalendar();
  const { settings } = useSettings();

  const [showCreator, setShowCreator] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [showExitModal, setShowExitModal] = useState(false);
  const [exitReason, setExitReason] = useState('');
  const [elapsed, setElapsed] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [countdownTaskId, setCountdownTaskId] = useState(null);
  const [remainingSec, setRemainingSec] = useState(0);
  const [countdownPaused, setCountdownPaused] = useState(false);

  // 创建表单
  const [form, setForm] = useState({
    title: '',
    type: 7,
    goal: '',
    startDate: getTodayStr(),
    dailyScheduleText: '晨读30分钟\n深度学习90分钟\n运动30分钟',
    scheduleMode: 'uniform', // 'uniform' | 'perDay'
    perDaySchedules: null, // 每日独立日程
  });

  // 切换天数类型时，自动生成默认的每日独立日程
  useEffect(() => {
    if (form.scheduleMode === 'perDay' && !form.perDaySchedules) {
      setForm(f => ({ ...f, perDaySchedules: generatePerDaySchedules(f.type) }));
    }
  }, [form.type, form.scheduleMode]);

  // 专注会话计时器
  useEffect(() => {
    if (session && session.status === 'running') {
      const ts = session.startedAt;
      setElapsed(Math.floor((Date.now() - ts) / 1000));
      const timer = setInterval(() => {
        setElapsed(Math.floor((Date.now() - ts) / 1000));
      }, 1000);
      return () => clearInterval(timer);
    } else {
      setElapsed(0);
    }
  }, [session?.id, session?.status]);

  // 任务倒计时
  useEffect(() => {
    if (!countdownTaskId || countdownPaused) return;
    const timer = setInterval(() => {
      setRemainingSec(prev => {
        if (prev <= 1) {
          // 倒计时结束，自动标记完成
          completeTaskWithSound(countdownTaskId);
          setCountdownTaskId(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [countdownTaskId, countdownPaused]);

  // 处理任务完成并播放声音
  const completeTaskWithSound = (taskId) => {
    if (!session) {
      console.warn('[ShortTermPlan] completeTaskWithSound: no active session');
      return;
    }
    const task = session.tasks.find(t => t.id === taskId);
    if (!task) {
      console.warn('[ShortTermPlan] completeTaskWithSound: task not found, id=', taskId);
      return;
    }
    if (task.sessionCompleted) {
      console.log(`[ShortTermPlan] Task "${task.title}" already completed, skipping sound`);
      return;
    }
    
    console.log(`[ShortTermPlan] Completing task "${task.title}" (${task.durationMin}min), triggering sound`);
    toggleSessionTask(taskId);
    playNotification('task', settings);
    
    // 检查是否全部完成
    const willAllDone = session.tasks.every(t => 
      t.id === taskId ? true : t.sessionCompleted
    );
    if (willAllDone) {
      console.log('[ShortTermPlan] All day tasks completed, triggering celebration sound');
      setTimeout(() => playNotification('all', settings), 300);
    }
  };

  // 会话结束时清除倒计时
  useEffect(() => {
    if (!session) {
      setCountdownTaskId(null);
      setRemainingSec(0);
      setCountdownPaused(false);
    }
  }, [session?.id]);

  // 点击任务：未完成 → 启动倒计时；倒计时中 → 暂停/继续；已完成 → 取消完成
  const handleTaskClick = (task) => {
    if (task.sessionCompleted) {
      // 已完成 → 取消完成
      toggleSessionTask(task.id);
      return;
    }
    if (countdownTaskId === task.id) {
      // 正在倒计时 → 暂停/继续
      setCountdownPaused(p => !p);
      return;
    }
    // 未完成且不在倒计时 → 启动该任务的倒计时
    setCountdownTaskId(task.id);
    setRemainingSec(task.durationMin * 60);
    setCountdownPaused(false);
  };

  // 提前完成任务（倒计时未结束就标记完成）
  const handleFinishEarly = (taskId) => {
    completeTaskWithSound(taskId);
    setCountdownTaskId(null);
    setRemainingSec(0);
    setCountdownPaused(false);
  };

  const selectedPlan = shortPlans.find(p => p.id === selectedPlanId);

  // 解析任务文本为 [{title, durationMin}]
  const parseTaskText = (text) => {
    return text
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean)
      .map(line => {
        const m = line.match(/^(.*?)(\d+)\s*分/);
        let title = m ? m[1].trim().replace(/^\s*【.*?】\s*/, '').replace(/[:：\-]$/, '') : line;
        title = title.replace(/^\s*【.*?】\s*/, '');
        const durationMin = m ? parseInt(m[2], 10) : 30;
        return { title, durationMin };
      });
  };

  const handleCreate = () => {
    if (!form.title.trim()) return;

    if (form.scheduleMode === 'perDay' && form.perDaySchedules) {
      // 每日独立模式
      const perDaySchedules = form.perDaySchedules.map(dayTasks => {
        if (Array.isArray(dayTasks)) {
          // 如果已经是任务对象数组
          return dayTasks.map(t => {
            const m = (t.title || '').match(/^(.*?)(\d+)\s*分/);
            return {
              title: m ? m[1].trim().replace(/^\s*【.*?】\s*/, '') : t.title || '任务',
              durationMin: m ? parseInt(m[2], 10) : (t.durationMin || 30),
            };
          });
        }
        return parseTaskText(String(dayTasks));
      });
      createShortTermPlan({
        title: form.title.trim(),
        type: Number(form.type),
        goal: form.goal.trim(),
        startDate: form.startDate,
        dailySchedule: [],
        perDaySchedules,
      });
    } else {
      // 统一日程模式
      const dailySchedule = parseTaskText(form.dailyScheduleText);
      createShortTermPlan({
        title: form.title.trim(),
        type: Number(form.type),
        goal: form.goal.trim(),
        startDate: form.startDate,
        dailySchedule,
      });
    }
    setShowCreator(false);
    setForm({
      title: '',
      type: 7,
      goal: '',
      startDate: getTodayStr(),
      dailyScheduleText: '晨读30分钟\n深度学习90分钟\n运动30分钟',
      scheduleMode: 'uniform',
      perDaySchedules: null,
    });
  };

  const openEditMode = (plan) => {
    // 判断当前计划使用的是统一日程还是每日独立
    const firstDayTasks = plan.days[0]?.tasks || [];
    const allSame = plan.days.every(d => {
      if (d.tasks.length !== firstDayTasks.length) return false;
      return d.tasks.every((t, i) => t.title === firstDayTasks[i]?.title && t.durationMin === firstDayTasks[i]?.durationMin);
    });
    const scheduleMode = allSame && firstDayTasks.length > 0 ? 'uniform' : 'perDay';

    const dailyScheduleText = firstDayTasks.map(t => `${t.title}${t.durationMin}分钟`).join('\n');
    const perDaySchedules = scheduleMode === 'perDay'
      ? plan.days.map(d => d.tasks.map(t => ({ title: t.title, durationMin: t.durationMin })))
      : plan.days.map(() => firstDayTasks.map(t => ({ title: t.title, durationMin: t.durationMin })));

    setForm({
      title: plan.title,
      type: plan.type,
      goal: plan.goal || '',
      startDate: plan.startDate,
      dailyScheduleText,
      scheduleMode,
      perDaySchedules,
    });
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (!form.title.trim() || !selectedPlanId) return;

    if (form.scheduleMode === 'perDay' && form.perDaySchedules) {
      const perDaySchedules = form.perDaySchedules.map(dayTasks => {
        if (Array.isArray(dayTasks)) {
          return dayTasks.map(t => {
            const m = (t.title || '').match(/^(.*?)(\d+)\s*分/);
            return {
              title: m ? m[1].trim().replace(/^\s*【.*?】\s*/, '') : t.title || '任务',
              durationMin: m ? parseInt(m[2], 10) : (t.durationMin || 30),
            };
          });
        }
        return parseTaskText(String(dayTasks));
      });
      updateShortTermPlan(selectedPlanId, {
        title: form.title.trim(),
        goal: form.goal.trim(),
        perDaySchedules,
      });
    } else {
      const dailySchedule = parseTaskText(form.dailyScheduleText);
      updateShortTermPlan(selectedPlanId, {
        title: form.title.trim(),
        goal: form.goal.trim(),
        dailySchedule,
      });
    }
    setIsEditing(false);
    setForm({
      title: '',
      type: 7,
      goal: '',
      startDate: getTodayStr(),
      dailyScheduleText: '晨读30分钟\n深度学习90分钟\n运动30分钟',
      scheduleMode: 'uniform',
      perDaySchedules: null,
    });
  };

  const handleStartDaySession = (plan, dayIdx) => {
    // 从短期计划第N天创建会话
    const day = plan.days[dayIdx];
    startSession('shortTerm', plan.id, day.date, day.tasks);
  };

  const handleCompleteSession = () => {
    if (session && session.planType === 'shortTerm') {
      // 检查是否全部完成并播放声音
      const allDone = session.tasks.length > 0 && session.tasks.every(t => t.sessionCompleted);
      if (allDone) {
        playNotification('all', settings);
      }
      
      const plan = shortPlans.find(p => p.id === session.planId);
      if (plan) {
        const dayIdx = plan.days.findIndex(d => d.date === session.dateStr);
        if (dayIdx >= 0) {
          session.tasks.forEach(t => {
            markDayTask(session.planId, plan.days[dayIdx].dayIndex, t.id, t.sessionCompleted);
          });
          // 日历同步
          const dayRec = plan.days[dayIdx];
          const dayAllDone = dayRec.tasks.every(t => t.completed);
          const anyDone = dayRec.tasks.some(t => t.completed);
          if (dayAllDone) {
            setDayStatus(session.dateStr, 'sunny', `${plan.title} · 第${dayRec.dayIndex}天完成`);
          } else if (anyDone) {
            setDayStatus(session.dateStr, 'cloudy', `${plan.title} · 第${dayRec.dayIndex}天部分完成`);
          }
        }
      }
    }
    completeSession();
  };

  const handleConfirmExit = () => {
    const minLen = settings.exitReasonMinLength || 100;
    if (exitReason.trim().length < minLen) return;
    exitWithReason(exitReason.trim());
    setShowExitModal(false);
    setExitReason('');
  };

  const handleEmergencyExit = () => {
    if (!confirm('确认紧急退出？当天将记录为"雨天"。')) return;
    if (session) {
      setDayStatus(session.dateStr, 'rainy', '短期计划紧急退出');
    }
    emergencyExit();
  };

  const formatTime = (sec) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const exitReasonLen = exitReason.trim().length;
  const minReasonLen = settings.exitReasonMinLength || 100;

  // === 专注会话界面 ===
  if (session && session.status === 'running' && session.planType === 'shortTerm') {
    const plan = shortPlans.find(p => p.id === session.planId);
    const dayIdx = plan?.days.findIndex(d => d.date === session.dateStr) ?? -1;
    const dayInfo = plan?.days[dayIdx];
    const typeInfo = SHORT_TERM_TYPES[plan?.type] || SHORT_TERM_TYPES[7];

    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 rounded-3xl p-8 border border-purple-500/30 shadow-2xl">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                {plan?.title}
              </h2>
              <p className="text-indigo-300 text-sm mt-1">
                🏆 {typeInfo.label} · 第 {dayInfo?.dayIndex} / {plan?.days.length} 天 · {session.dateStr}
              </p>
            </div>
            <div className="text-3xl font-mono font-bold text-purple-300 tabular-nums">
              {formatTime(elapsed)}
            </div>
          </div>

          <div className="mb-6 p-4 bg-black/30 rounded-2xl border border-purple-400/20">
            <div className="flex justify-between text-sm text-purple-200 mb-3">
              <span>🎯 今日任务进度</span>
              <span>
                {session.tasks.filter(t => t.sessionCompleted).length} / {session.tasks.length}
              </span>
            </div>
            <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all"
                style={{
                  width: `${
                    session.tasks.length === 0
                      ? 0
                      : (session.tasks.filter(t => t.sessionCompleted).length / session.tasks.length) * 100
                  }%`,
                }}
              />
            </div>
          </div>

          {/* 大号倒计时显示区 - 当有任务倒计时时显示 */}
          {countdownTaskId && (() => {
            const task = session.tasks.find(t => t.id === countdownTaskId);
            if (!task) return null;
            const totalSec = task.durationMin * 60;
            const progressPct = Math.round(((totalSec - remainingSec) / totalSec) * 100);
            const isUrgent = remainingSec <= 60;
            const isWarning = remainingSec <= 300 && remainingSec > 60;
            return (
              <div className={`mb-6 p-6 rounded-2xl border-2 transition-all ${
                countdownPaused
                  ? 'bg-slate-800/50 border-slate-500'
                  : isUrgent
                  ? 'bg-red-500/20 border-red-500 animate-pulse'
                  : isWarning
                  ? 'bg-orange-500/15 border-orange-500/60'
                  : 'bg-purple-500/15 border-purple-500/60'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{countdownPaused ? '⏸' : isUrgent ? '🔴' : '⏳'}</span>
                    <div>
                      <div className="text-xs text-slate-400">
                        {countdownPaused ? '已暂停' : isUrgent ? '即将结束！' : isWarning ? '注意时间' : '专注中'}
                      </div>
                      <div className="text-sm font-medium text-white truncate max-w-xs">
                        {task.title}
                      </div>
                    </div>
                  </div>
                  <div className={`font-mono font-bold tabular-nums leading-none ${
                    countdownPaused
                      ? 'text-slate-400 text-4xl'
                      : isUrgent
                      ? 'text-red-400 text-6xl animate-pulse'
                      : isWarning
                      ? 'text-orange-400 text-6xl'
                      : 'text-purple-300 text-6xl'
                  }`}>
                    {formatTime(remainingSec)}
                  </div>
                </div>
                {/* 大进度条 */}
                <div className="h-3 bg-slate-900 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-1000 ${
                      countdownPaused
                        ? 'bg-slate-500'
                        : isUrgent
                        ? 'bg-red-500'
                        : isWarning
                        ? 'bg-orange-500'
                        : 'bg-gradient-to-r from-purple-500 to-pink-500'
                    }`}
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
                <div className="flex justify-between mt-2 text-xs text-slate-400">
                  <span>已专注 {task.durationMin - Math.floor(remainingSec / 60)} 分钟</span>
                  <span>共 {task.durationMin} 分钟</span>
                </div>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => setCountdownPaused(p => !p)}
                    className={`flex-1 px-4 py-2 rounded-xl font-medium text-sm transition ${
                      countdownPaused
                        ? 'bg-purple-500/30 hover:bg-purple-500/40 text-purple-200 border border-purple-500/50'
                        : 'bg-slate-700/50 hover:bg-slate-700 text-slate-300 border border-slate-600'
                    }`}
                  >
                    {countdownPaused ? '▶ 继续专注' : '⏸ 暂停'}
                  </button>
                  <button
                    onClick={() => handleFinishEarly(task.id)}
                    className="flex-1 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/40 rounded-xl text-green-300 font-medium text-sm transition"
                  >
                    ✓ 提前完成
                  </button>
                </div>
              </div>
            );
          })()}

          <div className="space-y-3 mb-8 max-h-[28rem] overflow-y-auto pr-2">
            {session.tasks.map((task, idx) => {
              const isCounting = countdownTaskId === task.id;
              const totalSec = task.durationMin * 60;
              const progressPct = isCounting
                ? Math.round(((totalSec - remainingSec) / totalSec) * 100)
                : task.sessionCompleted
                ? 100
                : 0;
              return (
                <div
                  key={task.id}
                  className={`p-4 rounded-2xl transition-all ${
                    task.sessionCompleted
                      ? 'bg-green-500/10 border-2 border-green-500/40'
                      : isCounting
                      ? 'bg-purple-500/10 border-2 border-purple-500/60 shadow-lg shadow-purple-500/20'
                      : 'bg-white/5 border border-white/10 hover:border-purple-400/40 cursor-pointer'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleTaskClick(task)}
                      className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center transition shrink-0 ${
                        task.sessionCompleted
                          ? 'bg-green-500 border-green-500 text-white'
                          : isCounting
                          ? 'bg-purple-500 border-purple-500 text-white animate-pulse'
                          : 'border-slate-500 hover:border-purple-400 cursor-pointer'
                      }`}
                    >
                      {task.sessionCompleted ? '✓' : isCounting ? (countdownPaused ? '⏸' : '▶') : ''}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div
                          className={`font-medium truncate ${
                            task.sessionCompleted
                              ? 'text-green-400 line-through'
                              : isCounting
                              ? 'text-white'
                              : 'text-white'
                          }`}
                        >
                          {idx + 1}. {task.title}
                        </div>
                        {isCounting && (
                          <div className="flex items-center gap-2 shrink-0">
                            <span className={`font-mono text-lg font-bold tabular-nums ${
                              remainingSec <= 60 ? 'text-red-400' : 'text-purple-300'
                            }`}>
                              {formatTime(remainingSec)}
                            </span>
                            <button
                              onClick={() => handleFinishEarly(task.id)}
                              className="px-3 py-1 bg-green-500/20 hover:bg-green-500/30 border border-green-500/40 rounded-lg text-green-300 text-xs font-medium transition whitespace-nowrap"
                            >
                              提前完成
                            </button>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-slate-400">
                          {isCounting
                            ? countdownPaused
                              ? '⏸ 已暂停'
                              : '⏳ 专注中...'
                            : task.sessionCompleted
                            ? '✅ 已完成'
                            : `预计 ${task.durationMin} 分钟 · 点击开始倒计时`}
                        </span>
                      </div>
                      {/* 倒计时进度条 */}
                      {(isCounting || task.sessionCompleted) && (
                        <div className="mt-2 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all ${
                              task.sessionCompleted
                                ? 'bg-green-500'
                                : remainingSec <= 60
                                ? 'bg-red-500'
                                : 'bg-gradient-to-r from-purple-500 to-pink-500'
                            }`}
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="space-y-3">
            <button
              onClick={handleCompleteSession}
              className="w-full p-5 bg-gradient-to-r from-purple-600 to-pink-600 hover:brightness-110 rounded-2xl text-white font-bold text-lg shadow-lg shadow-purple-500/30 transition"
            >
              ✅ 完成今日打卡，点亮拼图
            </button>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowExitModal(true)}
                className="px-2.5 py-1 text-[11px] text-slate-500 hover:text-amber-400 transition"
                title="需要写不少于指定字数的理由才能退出"
              >
                写理由退出
              </button>
              <span className="text-slate-700 text-[11px]">·</span>
              <button
                onClick={handleEmergencyExit}
                className="px-2.5 py-1 text-[11px] text-slate-600 hover:text-red-400 transition"
                title="紧急退出将记录为雨天，影响拼图完整性"
              >
                紧急退出
              </button>
            </div>
            <div className="text-center text-[10px] text-slate-600">
              💪 坚持就是胜利 · 退出会留下"雨天"记录
            </div>
          </div>
        </div>

        {showExitModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 rounded-3xl p-6 max-w-lg w-full border border-amber-500/30">
              <h3 className="text-xl font-bold text-white mb-2">📝 填写退出理由</h3>
              <p className="text-sm text-slate-400 mb-4">
                至少 <span className="text-amber-300 font-bold">{minReasonLen}</span> 字。
                当前：<span className={`font-bold ${exitReasonLen >= minReasonLen ? 'text-green-400' : 'text-red-400'}`}>{exitReasonLen}</span> / {minReasonLen} 字
              </p>
              <textarea
                value={exitReason}
                onChange={(e) => setExitReason(e.target.value)}
                placeholder="思考为什么想放弃，这样会影响到你坚持多久..."
                rows={8}
                className="w-full bg-slate-800 border border-slate-700 rounded-2xl p-4 text-white placeholder-slate-500 focus:border-amber-500 outline-none resize-none"
              />
              <div className="flex gap-3 mt-5">
                <button
                  onClick={() => {
                    setShowExitModal(false);
                    setExitReason('');
                  }}
                  className="flex-1 p-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 transition"
                >
                  继续专注
                </button>
                <button
                  onClick={handleConfirmExit}
                  disabled={exitReasonLen < minReasonLen}
                  className={`flex-1 p-3 rounded-xl font-medium transition ${
                    exitReasonLen >= minReasonLen
                      ? 'bg-amber-500 hover:bg-amber-400 text-white'
                      : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  确认退出
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // === 详情视图 ===
  if (selectedPlan && !showCreator) {
    // 编辑模式
    if (isEditing) {
      const lockedDays = selectedPlan.days.filter(d => d.completed).length;
      return (
        <div className="p-6 max-w-2xl mx-auto">
          <button
            onClick={() => setIsEditing(false)}
            className="mb-4 text-slate-400 hover:text-white transition flex items-center gap-2"
          >
            ← 返回详情
          </button>

          <div className="bg-slate-900 rounded-3xl p-6 border border-purple-500/30">
            <h3 className="text-xl font-bold text-white mb-2">✏️ 编辑挑战计划</h3>
            {lockedDays > 0 && (
              <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-200 text-sm">
                ⚠️ 已有 {lockedDays} 天完成打卡，这些天的任务将保持不变。修改仅对未完成的天生效。
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-300 mb-2">挑战标题</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:border-purple-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-2">目标宣言（可选）</label>
                <input
                  value={form.goal}
                  onChange={(e) => setForm(f => ({ ...f, goal: e.target.value }))}
                  placeholder="写下本次挑战的最终目标"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:border-purple-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-2">日程安排模式</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setForm(f => ({ ...f, scheduleMode: 'uniform', perDaySchedules: null }))}
                    className={`p-3 rounded-xl text-sm font-medium transition border ${
                      form.scheduleMode === 'uniform'
                        ? 'bg-purple-500/20 border-purple-500 text-purple-200'
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'
                    }`}
                  >
                    📋 统一日程<br/>
                    <span className="text-xs">每天相同的任务</span>
                  </button>
                  <button
                    onClick={() => setForm(f => ({
                      ...f,
                      scheduleMode: 'perDay',
                      perDaySchedules: f.perDaySchedules || generatePerDaySchedules(f.type),
                    }))}
                    className={`p-3 rounded-xl text-sm font-medium transition border ${
                      form.scheduleMode === 'perDay'
                        ? 'bg-purple-500/20 border-purple-500 text-purple-200'
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'
                    }`}
                  >
                    🗓️ 每日独立设计<br/>
                    <span className="text-xs">不同天数不同任务（推荐）</span>
                  </button>
                </div>
              </div>

              {form.scheduleMode === 'uniform' ? (
                <div>
                  <label className="block text-sm text-slate-300 mb-2">
                    每日固定日程（每行一个，格式：任务名 + 时长分钟）
                  </label>
                  <textarea
                    value={form.dailyScheduleText}
                    onChange={(e) => setForm(f => ({ ...f, dailyScheduleText: e.target.value }))}
                    rows={6}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:border-purple-500 outline-none resize-none text-sm"
                    style={{ fontFamily: '-apple-system, "PingFang SC", "Microsoft YaHei", sans-serif' }}
                    placeholder={'晨读30分钟\n深度学习90分钟\n运动30分钟'}
                  />
                  <div className="text-xs text-slate-500 mt-2">
                    💡 不同天数可以设置不同的时间安排，建议使用「每日独立设计」模式
                  </div>
                </div>
              ) : (
                <PerDayEditor
                  type={form.type}
                  schedules={form.perDaySchedules || []}
                  onChange={(s) => setForm(f => ({ ...f, perDaySchedules: s }))}
                />
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex-1 p-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 transition"
                >
                  取消
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={!form.title.trim()}
                  className={`flex-1 p-3 rounded-xl font-medium transition ${
                    form.title.trim()
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:brightness-110 text-white'
                      : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  💾 保存修改
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }
    const typeInfo = SHORT_TERM_TYPES[selectedPlan.type] || SHORT_TERM_TYPES[7];
    const progress = getPlanProgress(selectedPlan.id);
    const pieces = typeInfo.puzzlePieces;

    // 根据天数自动拼图块列数
    const gridCols =
      pieces <= 7 ? 'grid-cols-7' : pieces <= 14 ? 'grid-cols-7' : 'grid-cols-6';

    return (
      <div className="p-6 max-w-5xl mx-auto">
        <button
          onClick={() => setSelectedPlanId(null)}
          className="mb-4 text-slate-400 hover:text-white transition flex items-center gap-2"
        >
          ← 返回计划列表
        </button>

        <div className="bg-gradient-to-br from-slate-800/80 to-purple-900/20 rounded-3xl p-8 border border-purple-500/20 mb-6">
          <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-3xl font-bold text-white">{selectedPlan.title}</h2>
                {selectedPlan.puzzleCompleted && (
                  <span className="px-3 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full text-xs font-bold text-black">
                    🏆 已完成
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4 text-sm text-slate-400">
                <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full border border-purple-500/30">
                  {typeInfo.label}
                </span>
                <span>📅 {selectedPlan.startDate} 起</span>
                <span>⚡ {progress.done}/{progress.total} 天完成</span>
              </div>
              {selectedPlan.goal && (
                <div className="mt-3 p-3 bg-black/30 rounded-xl text-slate-300 text-sm">
                  🎯 目标：{selectedPlan.goal}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              {!selectedPlan.puzzleCompleted && (
                <button
                  onClick={() => openEditMode(selectedPlan)}
                  className="p-2 text-slate-400 hover:text-purple-400 transition"
                  title="编辑计划"
                >
                  ✏️
                </button>
              )}
              <button
                onClick={() => {
                  if (confirm('确定删除此挑战计划？此操作不可恢复。')) {
                    deletePlan(selectedPlan.id);
                    setSelectedPlanId(null);
                  }
                }}
                className="p-2 text-slate-500 hover:text-red-400 transition"
              >
                🗑️
              </button>
            </div>
          </div>

          {/* 进度条 */}
          <div className="h-4 bg-slate-900 rounded-full overflow-hidden mb-8">
            <div
              className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-400 transition-all"
              style={{ width: `${progress.rate * 100}%` }}
            />
          </div>

          {/* 拼图区 */}
          <div className="mb-8">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              🧩 拼图收集板 <span className="text-slate-400 text-sm">（每天点亮一块，完成即集齐）</span>
            </h3>
            <div className={`grid ${gridCols} gap-2`}>
              {selectedPlan.days.map((day, idx) => {
                const color = PUZZLE_COLORS[idx % PUZZLE_COLORS.length];
                const isToday = day.date === getTodayStr();
                const isPast = day.date < getTodayStr();
                return (
                  <button
                    key={day.dayIndex}
                    onClick={() => {
                      if (isToday && !day.completed) {
                        handleStartDaySession(selectedPlan, idx);
                      }
                    }}
                    className={`aspect-square rounded-2xl flex flex-col items-center justify-center transition-all relative ${
                      day.completed
                        ? 'shadow-lg scale-100'
                        : 'bg-slate-800/70 border-2 border-dashed border-slate-700 hover:border-slate-500'
                    } ${isToday ? 'ring-4 ring-yellow-400/50' : ''}`}
                    style={
                      day.completed
                        ? {
                            background: `linear-gradient(135deg, ${color}, ${color}dd 60%, #00000066)`,
                            boxShadow: `0 0 24px ${color}66`,
                          }
                        : {}
                    }
                  >
                    {day.completed ? (
                      <>
                        <div className="text-2xl">⭐</div>
                        <div className="text-xs text-white/90 font-bold">第{day.dayIndex}天</div>
                      </>
                    ) : (
                      <>
                        <div className="text-2xl text-slate-600">{idx + 1}</div>
                        <div className="text-[10px] text-slate-500 mt-1">{day.date.slice(5)}</div>
                      </>
                    )}
                    {isToday && !day.completed && (
                      <span className="absolute -top-2 -right-2 px-2 py-0.5 bg-yellow-500 text-black text-[10px] font-bold rounded-full animate-pulse">
                        今天
                      </span>
                    )}
                    {!day.completed && isPast && (
                      <span className="absolute bottom-1 text-[10px] text-red-400">跳过</span>
                    )}
                  </button>
                );
              })}
            </div>
            {selectedPlan.puzzleCompleted && (
              <div className="mt-6 p-6 bg-gradient-to-r from-yellow-500/20 to-pink-500/20 border-2 border-yellow-500/40 rounded-2xl text-center">
                <div className="text-5xl mb-3 animate-bounce">🎉🏆🎉</div>
                <div className="text-xl font-bold text-yellow-300">
                  恭喜！{typeInfo.label}挑战成功！
                </div>
                <div className="text-sm text-slate-300 mt-2">
                  完整拼图已点亮，这是你自律的证明
                </div>
              </div>
            )}
          </div>

          {/* 阶段总览 */}
          {(() => {
            const phaseInfo = getDayPhase(selectedPlan);
            if (!phaseInfo || phaseInfo.length === 0) return null;
            return (
              <div className="mb-6 p-4 bg-slate-900/60 rounded-2xl border border-slate-700">
                <div className="text-sm font-semibold text-slate-300 mb-3">🎯 挑战阶段规划</div>
                <div className="flex flex-wrap gap-2">
                  {phaseInfo.map((p, i) => (
                    <div
                      key={i}
                      className={`px-3 py-2 rounded-xl text-xs font-medium text-white bg-gradient-to-r ${PHASE_COLORS[p.phase] || PHASE_COLORS.default}`}
                    >
                      {p.phase} · {p.range}
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* 每天详情 */}
          <div className="space-y-3 max-h-[28rem] overflow-y-auto pr-2">
            {selectedPlan.days.map((day, idx) => {
              const isToday = day.date === getTodayStr();
              return (
                <div
                  key={day.dayIndex}
                  className={`p-4 rounded-2xl border transition ${
                    day.completed
                      ? 'bg-green-500/5 border-green-500/30'
                      : isToday
                      ? 'bg-yellow-500/5 border-yellow-500/30'
                      : 'bg-slate-900/40 border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold ${
                          day.completed
                            ? 'bg-green-500 text-white'
                            : 'bg-slate-700 text-slate-300'
                        }`}
                      >
                        {day.dayIndex}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-white">
                            第 {day.dayIndex} 天 · {day.date}
                          </span>
                          {isToday && (
                            <span className="px-2 py-0.5 bg-yellow-500 text-black text-xs font-bold rounded-full">
                              今天
                            </span>
                          )}
                        </div>
                        {day.completedAt && (
                          <div className="text-xs text-slate-500">
                            完成于 {new Date(day.completedAt).toLocaleString('zh-CN')}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {isToday && !day.completed && (
                        <button
                          onClick={() => handleStartDaySession(selectedPlan, idx)}
                          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:brightness-110 rounded-xl text-white text-sm font-medium transition"
                        >
                          🚀 开始今日
                        </button>
                      )}
                    </div>
                  </div>
                  {day.tasks.length > 0 && (
                    <div className="ml-13 pl-12 space-y-1">
                      {day.tasks.map(t => (
                        <div
                          key={t.id}
                          className={`flex items-center gap-2 text-sm ${
                            t.completed ? 'text-green-400' : 'text-slate-400'
                          }`}
                        >
                          <span>{t.completed ? '✅' : '⬜'}</span>
                          <span className={t.completed ? 'line-through' : ''}>
                            {t.title}
                          </span>
                          <span className="text-xs text-slate-600">({t.durationMin}分)</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // === 计划列表 ===
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-white">🏅 短期挑战计划</h2>
          <p className="text-slate-400 text-sm mt-1">
            7 / 14 / 30 天挑战 · 每天打卡点亮一块拼图
          </p>
        </div>
        <button
          onClick={() => setShowCreator(true)}
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:brightness-110 rounded-xl text-white font-medium shadow-lg transition"
        >
          + 新建挑战
        </button>
      </div>

      {/* 预设卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[
          { t: 7, emoji: '🌱', desc: '快速习惯养成，小目标试手', color: 'from-green-600 to-emerald-500' },
          { t: 14, emoji: '🔥', desc: '两周深度冲刺，明显改变', color: 'from-orange-500 to-red-500' },
          { t: 30, emoji: '🏆', desc: '一个月蜕变，固化新习惯', color: 'from-purple-600 to-pink-500' },
        ].map(preset => (
          <div
            key={preset.t}
            className={`bg-gradient-to-br ${preset.color} rounded-2xl p-5 text-white shadow-lg cursor-pointer transition hover:scale-105`}
            onClick={() => {
              setForm(f => ({ ...f, type: preset.t }));
              setShowCreator(true);
            }}
          >
            <div className="text-5xl mb-2">{preset.emoji}</div>
            <div className="text-xl font-bold">{SHORT_TERM_TYPES[preset.t].label}</div>
            <div className="text-sm text-white/80 mt-1">{preset.desc}</div>
          </div>
        ))}
      </div>

      {shortPlans.length === 0 ? (
        <div className="p-16 text-center text-slate-400 border-2 border-dashed border-slate-700 rounded-3xl">
          <div className="text-6xl mb-4">🎯</div>
          <p className="text-lg">还没有挑战计划，来开启第一个吧！</p>
          <p className="text-sm text-slate-500 mt-2">
            选择 7 天、14 天或 30 天模式，坚持打卡就能点亮完整拼图
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {shortPlans.map(plan => {
            const typeInfo = SHORT_TERM_TYPES[plan.type] || SHORT_TERM_TYPES[7];
            const progress = getPlanProgress(plan.id);
            const todayStr = getTodayStr();
            const todayIdx = plan.days.findIndex(d => d.date === todayStr);
            const todayDay = todayIdx >= 0 ? plan.days[todayIdx] : null;
            const canFocusToday = todayDay && !todayDay.completed && todayDay.tasks.length > 0;
            return (
              <div
                key={plan.id}
                onClick={() => setSelectedPlanId(plan.id)}
                className="text-left bg-slate-800/60 hover:bg-slate-800 rounded-2xl p-6 border border-slate-700 hover:border-purple-500/50 transition group cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-xl font-bold text-white group-hover:text-purple-300 transition">
                        {plan.title}
                      </h3>
                      {plan.puzzleCompleted && (
                        <span className="text-yellow-400">🏆</span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400">
                      {typeInfo.label} · 开始于 {plan.startDate}
                    </div>
                  </div>
                  {canFocusToday && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartDaySession(plan, todayIdx);
                      }}
                      className="shrink-0 px-3 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:brightness-110 rounded-xl text-white text-sm font-medium shadow-lg transition flex items-center gap-1.5"
                      title={`立即开始今日专注（第 ${todayDay.dayIndex} 天）`}
                    >
                      🚀 专注今日
                    </button>
                  )}
                </div>
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-slate-400 mb-1.5">
                    <span>进度</span>
                    <span>{progress.done} / {progress.total} 天 · {Math.round(progress.rate * 100)}%</span>
                  </div>
                  <div className="h-2 bg-slate-900 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                      style={{ width: `${progress.rate * 100}%` }}
                    />
                  </div>
                </div>
                {todayDay && (
                  <div className="mb-3 text-xs text-slate-400">
                    {todayDay.completed ? (
                      <span className="text-green-400">✅ 今日已完成</span>
                    ) : (
                      <span>
                        📅 今日任务 · 第 {todayDay.dayIndex} 天 · 共 {todayDay.tasks.length} 项 · 合计 {todayDay.tasks.reduce((s, t) => s + t.durationMin, 0)} 分钟
                      </span>
                    )}
                  </div>
                )}
                <div className="flex -space-x-1">
                  {plan.days.slice(0, 14).map((d, i) => (
                    <div
                      key={i}
                      className={`w-5 h-5 rounded-md border-2 border-slate-800 ${
                        d.completed ? 'bg-purple-500' : 'bg-slate-700'
                      }`}
                      style={
                        d.completed
                          ? { backgroundColor: PUZZLE_COLORS[i % PUZZLE_COLORS.length] }
                          : {}
                      }
                    />
                  ))}
                  {plan.days.length > 14 && (
                    <div className="w-5 h-5 rounded-md bg-slate-700 border-2 border-slate-800 flex items-center justify-center text-[9px] text-slate-400">
                      +{plan.days.length - 14}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 创建弹窗 */}
      {showCreator && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 rounded-3xl p-6 max-w-2xl w-full border border-purple-500/30 my-8">
            <h3 className="text-xl font-bold text-white mb-5">🎯 创建新挑战</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-300 mb-2">挑战标题</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="例如：30天考研冲刺、早起21天打卡"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:border-purple-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-slate-300 mb-2">挑战天数</label>
                  <select
                    value={form.type}
                    onChange={(e) => {
                      const newType = Number(e.target.value);
                      setForm(f => ({
                        ...f,
                        type: newType,
                        perDaySchedules: f.scheduleMode === 'perDay'
                          ? generatePerDaySchedules(newType)
                          : null,
                      }));
                    }}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-purple-500 outline-none"
                  >
                    {Object.entries(SHORT_TERM_TYPES).map(([k, v]) => (
                      <option key={k} value={k}>{v.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-300 mb-2">开始日期</label>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={(e) => setForm(f => ({ ...f, startDate: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-purple-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-2">目标宣言（可选）</label>
                <input
                  value={form.goal}
                  onChange={(e) => setForm(f => ({ ...f, goal: e.target.value }))}
                  placeholder="写下本次挑战的最终目标，激励自己"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:border-purple-500 outline-none"
                />
              </div>

              {/* 日程模式切换 */}
              <div>
                <label className="block text-sm text-slate-300 mb-2">日程安排模式</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setForm(f => ({ ...f, scheduleMode: 'uniform', perDaySchedules: null }))}
                    className={`p-3 rounded-xl text-sm font-medium transition border ${
                      form.scheduleMode === 'uniform'
                        ? 'bg-purple-500/20 border-purple-500 text-purple-200'
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'
                    }`}
                  >
                    📋 统一日程<br/>
                    <span className="text-xs">每天相同的任务</span>
                  </button>
                  <button
                    onClick={() => setForm(f => ({
                      ...f,
                      scheduleMode: 'perDay',
                      perDaySchedules: generatePerDaySchedules(f.type),
                    }))}
                    className={`p-3 rounded-xl text-sm font-medium transition border ${
                      form.scheduleMode === 'perDay'
                        ? 'bg-purple-500/20 border-purple-500 text-purple-200'
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'
                    }`}
                  >
                    🗓️ 每日独立设计<br/>
                    <span className="text-xs">不同天数不同任务（推荐）</span>
                  </button>
                </div>
              </div>

              {/* 统一日程模式 */}
              {form.scheduleMode === 'uniform' && (
                <div>
                  <label className="block text-sm text-slate-300 mb-2">
                    每日固定日程 <span className="text-slate-500 text-xs">（每行一个，格式：任务名 + 时长分钟）</span>
                  </label>
                  <textarea
                    value={form.dailyScheduleText}
                    onChange={(e) => setForm(f => ({ ...f, dailyScheduleText: e.target.value }))}
                    rows={6}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:border-purple-500 outline-none resize-none font-mono text-sm"
                  />
                  <div className="text-xs text-slate-500 mt-2">
                    提示：不同挑战天数可以设置不同的时间安排
                  </div>
                </div>
              )}

              {/* 每日独立设计模式 */}
              {form.scheduleMode === 'perDay' && form.perDaySchedules && (
                <PerDayEditor
                  type={form.type}
                  schedules={form.perDaySchedules}
                  onChange={(schedules) => setForm(f => ({ ...f, perDaySchedules: schedules }))}
                />
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowCreator(false);
                  setForm({
                    title: '',
                    type: 7,
                    goal: '',
                    startDate: getTodayStr(),
                    dailyScheduleText: '晨读30分钟\n深度学习90分钟\n运动30分钟',
                    scheduleMode: 'uniform',
                    perDaySchedules: null,
                  });
                }}
                className="flex-1 p-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 transition"
              >
                取消
              </button>
              <button
                onClick={handleCreate}
                disabled={!form.title.trim()}
                className={`flex-1 p-3 rounded-xl font-medium transition ${
                  form.title.trim()
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:brightness-110 text-white'
                    : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                }`}
              >
                创建挑战
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// === 每日独立任务编辑器 ===
function PerDayEditor({ type, schedules, onChange }) {
  const typeInfo = SHORT_TERM_TYPES[type] || SHORT_TERM_TYPES[7];
  const presets = PHASE_PRESETS[type] || PHASE_PRESETS[7];
  const [activeDay, setActiveDay] = useState(0);
  const [localText, setLocalText] = useState('');

  const getPhaseForDay = (dayIdx) => {
    for (const p of presets) {
      if (p.days.includes(dayIdx)) return p;
    }
    return null;
  };

  const activePhase = getPhaseForDay(activeDay + 1);

  const serializeSchedules = (dayTasks) => {
    if (!dayTasks) return '';
    if (Array.isArray(dayTasks) && dayTasks.length > 0 && typeof dayTasks[0] === 'object') {
      return dayTasks.map(t => `${t.title}${t.durationMin}分钟`).join('\n');
    }
    if (Array.isArray(dayTasks)) {
      return dayTasks.map(t => String(t).replace(/^\s*【.*?】\s*/, '')).join('\n');
    }
    return String(dayTasks).split('\n').filter(l => !l.includes('【')).join('\n');
  };

  const handleDayClick = (idx) => {
    setActiveDay(idx);
    setLocalText(serializeSchedules(schedules?.[idx]));
  };

  const handleTextChange = (text) => {
    setLocalText(text);
    const tasks = text
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean)
      .map(line => {
        const m = line.match(/^(.*?)(\d+)\s*分/);
        const title = m ? m[1].trim() : line;
        const durationMin = m ? parseInt(m[2], 10) : 30;
        return { title, durationMin };
      });
    const newSchedules = [...schedules];
    newSchedules[activeDay] = tasks;
    onChange(newSchedules);
  };

  const handleResetDay = () => {
    const newSchedules = [...schedules];
    newSchedules[activeDay] = generatePerDaySchedules(type)[activeDay];
    setLocalText(serializeSchedules(newSchedules[activeDay]));
    onChange(newSchedules);
  };

  const totalMinutes = useMemo(() => {
    if (!schedules || !Array.isArray(schedules[activeDay])) return 0;
    return schedules[activeDay].reduce((s, t) => s + (t.durationMin || 0), 0);
  }, [schedules, activeDay]);

  const taskCount = schedules?.[activeDay]?.length || 0;

  return (
    <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700">
      <div className="mb-3">
        <div className="text-xs text-slate-400 mb-2">
          选择要编辑的天数（可自由修改每天的任务，不受阶段限制）：
        </div>
        <div className="flex gap-1 flex-wrap">
          {Array.from({ length: typeInfo.days }, (_, i) => (
            <button
              key={i}
              onClick={() => handleDayClick(i)}
              className={`w-9 h-9 rounded-lg text-xs font-bold transition ${
                activeDay === i
                  ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white scale-110 shadow-lg'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-3 p-3 rounded-xl bg-slate-900/60 border border-slate-700 flex items-center justify-between">
        <div>
          <div className="font-bold text-white">
            第 {activeDay + 1} 天
            {activePhase && (
              <span className="ml-2 text-xs text-slate-400">
                （参考：{activePhase.phase}）
              </span>
            )}
          </div>
          {activePhase && (
            <div className="text-[10px] text-slate-500 mt-0.5">
              该天默认为「{activePhase.phase}」阶段内容，可自由修改
            </div>
          )}
        </div>
        <div className="text-right">
          <div className="text-xs text-slate-400">总时长</div>
          <div className="font-bold text-white text-lg">{totalMinutes} 分钟</div>
        </div>
      </div>

      <div>
        <label className="block text-xs text-slate-400 mb-2">
          当天任务列表（每行一个任务，格式：任务名 + 时长分钟，如：晨读30分钟）
        </label>
        <textarea
          value={localText}
          onChange={(e) => handleTextChange(e.target.value)}
          rows={Math.min(10, Math.max(4, taskCount + 1))}
          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:border-purple-500 outline-none resize-none text-sm leading-relaxed"
          style={{ fontFamily: '-apple-system, "PingFang SC", "Microsoft YaHei", sans-serif' }}
          placeholder={'输入当天的任务，每行一个，例如：\n晨读30分钟\n深度学习90分钟\n运动30分钟'}
          autoComplete="off"
          spellCheck={false}
        />
        <div className="flex items-center justify-between mt-2">
          <div className="text-xs text-slate-500">
            共 {taskCount} 个任务 · {totalMinutes} 分钟
          </div>
          <button
            onClick={handleResetDay}
            className="text-xs text-slate-400 hover:text-white transition"
          >
            ↻ 重置为阶段默认
          </button>
        </div>
      </div>
    </div>
  );
}
