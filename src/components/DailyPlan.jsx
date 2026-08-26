// 每日计划模块 - 含专注会话控制
import { useState, useEffect, useMemo } from 'react';
import {
  useDailyPlans,
  useActiveSession,
  useCalendar,
  useSettings,
  getTodayStr,
  playNotification,
} from '../focusStore';

const DAILY_DEFAULT_TASKS = [
  { title: '晨间阅读', durationMin: 30, appRestriction: [] },
  { title: '深度学习', durationMin: 90, appRestriction: [] },
  { title: '复习整理', durationMin: 45, appRestriction: [] },
];

export default function DailyPlan() {
  const today = getTodayStr();
  const { settings } = useSettings();
  const {
    getDailyPlan,
    addTask,
    removeTask,
    toggleTask,
    isDayCompleted,
    getDayProgress,
  } = useDailyPlans();
  const { setDayStatus, getDayStatus } = useCalendar();
  const {
    session,
    startSession,
    completeSession,
    exitWithReason,
    emergencyExit,
    toggleSessionTask,
  } = useActiveSession();

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDuration, setNewTaskDuration] = useState(30);
  const [showExitModal, setShowExitModal] = useState(false);
  const [exitReason, setExitReason] = useState('');
  const [elapsed, setElapsed] = useState(0);
  const [remaining, setRemaining] = useState(0);

  const dailyPlan = getDailyPlan(today);
  const progress = getDayProgress(today);
  const todayRecord = getDayStatus(today);

  // 计算任务总时长（秒）
  const totalDurationSec = useMemo(() => {
    if (!session || !session.tasks) return 0;
    return session.tasks.reduce((s, t) => s + (Number(t.durationMin) || 0) * 60, 0);
  }, [session?.id, session?.tasks]);

  // 专注倒计时
  useEffect(() => {
    if (session && session.status === 'running' && totalDurationSec > 0) {
      const startElapsed = Math.floor((Date.now() - session.startedAt) / 1000);
      setElapsed(startElapsed);
      setRemaining(Math.max(0, totalDurationSec - startElapsed));
      const timer = setInterval(() => {
        const e = Math.floor((Date.now() - session.startedAt) / 1000);
        setElapsed(e);
        setRemaining(Math.max(0, totalDurationSec - e));
      }, 1000);
      return () => clearInterval(timer);
    } else {
      setElapsed(0);
      setRemaining(0);
    }
  }, [session?.id, session?.status, totalDurationSec]);

  // 倒计时结束自动完成
  useEffect(() => {
    if (session && session.status === 'running' && remaining === 0 && totalDurationSec > 0 && elapsed > 0) {
      const allDone = session.tasks.length > 0 && session.tasks.every(t => t.sessionCompleted);
      if (!allDone) {
        session.tasks.forEach(t => {
          if (!t.sessionCompleted) toggleSessionTask(t.id);
        });
        setTimeout(() => {
          playNotification('all', settings);
          session.tasks.forEach(t => toggleTask(today, t.id));
          completeSession();
        }, 500);
      }
    }
  }, [remaining]);

  // 更新今日日历状态
  useEffect(() => {
    if (!dailyPlan || dailyPlan.tasks.length === 0) return;
    if (todayRecord && todayRecord.status === 'rainy') return; // 紧急退出过不再覆盖
    const { rate } = progress;
    if (rate >= 1) {
      setDayStatus(today, 'sunny', '全部完成！');
    } else if (rate > 0) {
      setDayStatus(today, 'cloudy', `完成 ${Math.round(rate * 100)}%`);
    }
  }, [progress.rate, todayRecord?.status, dailyPlan?.tasks?.length]);

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return;
    addTask(today, {
      title: newTaskTitle.trim(),
      durationMin: Number(newTaskDuration) || 30,
      appRestriction: [],
    });
    setNewTaskTitle('');
  };

  const handleStartSession = () => {
    if (!dailyPlan || dailyPlan.tasks.length === 0) return;
    startSession('daily', today, today, dailyPlan.tasks);
  };

  // 处理任务勾选 - 播放声音提示
  const handleToggleTask = (taskId) => {
    if (!session) {
      console.warn('[DailyPlan] handleToggleTask: no active session');
      return;
    }
    const task = session.tasks.find(t => t.id === taskId);
    if (!task) {
      console.warn('[DailyPlan] handleToggleTask: task not found, id=', taskId);
      return;
    }
    
    const wasCompleted = task.sessionCompleted;
    console.log(`[DailyPlan] Toggle task "${task.title}": ${wasCompleted ? 'completed→undo' : 'uncompleted→complete'}`);
    
    toggleSessionTask(taskId);
    
    // 从未完成变为完成时播放提示音
    if (!wasCompleted) {
      console.log('[DailyPlan] Triggering task-complete sound');
      playNotification('task', settings);
      
      // 检查是否全部完成
      const willAllDone = session.tasks.every(t => 
        t.id === taskId ? true : t.sessionCompleted
      );
      if (willAllDone) {
        console.log('[DailyPlan] All tasks completed, triggering celebration sound');
        setTimeout(() => playNotification('all', settings), 300);
      }
    }
  };

  const handleCompleteSession = () => {
    // 检查是否全部完成
    if (session) {
      const allDone = session.tasks.length > 0 && session.tasks.every(t => t.sessionCompleted);
      if (allDone) {
        playNotification('all', settings);
      }
      // 同步会话中完成的任务到每日计划
      session.tasks.forEach(t => {
        if (t.sessionCompleted) {
          toggleTask(today, t.id);
        }
      });
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
    if (!confirm('确认紧急退出？今天将被记录为"雨天"（未完成），且此状态无法撤销。')) return;
    emergencyExit();
    // 紧急退出标记雨天
    setDayStatus(today, 'rainy', '紧急退出，未完成计划');
  };

  // 格式化为 时:分:秒
  const formatTime = (sec) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const totalPlannedMin = useMemo(() => {
    if (!dailyPlan) return 0;
    return dailyPlan.tasks.reduce((s, t) => s + (Number(t.durationMin) || 0), 0);
  }, [dailyPlan]);

  const exitReasonLen = exitReason.trim().length;
  const minReasonLen = settings.exitReasonMinLength || 100;

  // === 专注中界面 ===
  if (session && session.status === 'running') {
    const totalMin = Math.round(totalDurationSec / 60);
    const remainingMin = Math.ceil(remaining / 60);
    const progressPct = totalDurationSec > 0 ? ((totalDurationSec - remaining) / totalDurationSec) * 100 : 0;
    const isUrgent = remaining <= 60 && remaining > 0;
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className={`rounded-3xl p-8 border shadow-2xl transition-all ${
          isUrgent
            ? 'bg-gradient-to-br from-red-950 via-red-900 to-slate-900 border-red-500/50 animate-pulse'
            : 'bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border-indigo-500/30'
        }`}>
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${isUrgent ? 'bg-red-500' : 'bg-red-500 animate-pulse'}`} />
              专注倒计时
            </h2>
            <div className={`text-4xl font-mono font-bold tabular-nums ${
              isUrgent ? 'text-red-400' : 'text-indigo-300'
            }`}>
              {formatTime(remaining)}
            </div>
          </div>

          {/* 倒计时进度条 */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-indigo-200 mb-2">
              <span>⏱️ 已用时 {formatTime(elapsed)}</span>
              <span className="font-mono">剩余 {remainingMin} 分 / 共 {totalMin} 分</span>
            </div>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-1000 ${
                  isUrgent
                    ? 'bg-gradient-to-r from-red-500 to-orange-500'
                    : 'bg-gradient-to-r from-indigo-500 to-purple-500'
                }`}
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          <div className="mb-6 p-4 bg-black/30 rounded-2xl border border-indigo-400/20">
            <div className="flex justify-between text-sm text-indigo-200 mb-3">
              <span>🎯 完成进度</span>
              <span>
                {session.tasks.filter(t => t.sessionCompleted).length} / {session.tasks.length}
              </span>
            </div>
            <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all"
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

          <div className="space-y-3 mb-8 max-h-96 overflow-y-auto pr-2">
            {session.tasks.map((task, idx) => (
              <div
                key={task.id}
                className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${
                  task.sessionCompleted
                    ? 'bg-green-500/10 border-2 border-green-500/40'
                    : 'bg-white/5 border border-white/10 hover:border-indigo-400/40'
                }`}
              >
                <button
                  onClick={() => handleToggleTask(task.id)}
                  className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center transition shrink-0 ${
                    task.sessionCompleted
                      ? 'bg-green-500 border-green-500 text-white'
                      : 'border-slate-500 hover:border-indigo-400'
                  }`}
                >
                  {task.sessionCompleted && '✓'}
                </button>
                <div className="flex-1">
                  <div
                    className={`font-medium ${
                      task.sessionCompleted
                        ? 'text-green-400 line-through decoration-green-500/50'
                        : 'text-white'
                    }`}
                  >
                    {idx + 1}. {task.title}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    预计 {task.durationMin} 分钟
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <button
              onClick={handleCompleteSession}
              className="w-full p-5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-2xl text-white font-bold text-lg shadow-lg shadow-indigo-500/30 transition"
            >
              ✅ 全部完成，结束计划
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
                title="紧急退出将记录为雨天，影响连续打卡"
              >
                紧急退出
              </button>
            </div>
            <div className="text-center text-[10px] text-slate-600">
              💪 坚持就是胜利 · 退出会留下"雨天"记录
            </div>
          </div>

          <div className="mt-6 p-4 bg-slate-800/50 rounded-xl text-sm text-slate-400">
            💡 <strong className="text-slate-300">计划规则：</strong>
            计划进行中不能直接退出。正常退出需要写满 <span className="text-amber-300 font-mono">{minReasonLen}字</span> 理由；
            紧急退出会将今天标记为<span className="text-red-400">雨天</span>，影响连续打卡。
          </div>
        </div>

        {/* 退出理由弹窗 */}
        {showExitModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 rounded-3xl p-6 max-w-lg w-full border border-amber-500/30">
              <h3 className="text-xl font-bold text-white mb-2">📝 请填写退出理由</h3>
              <p className="text-sm text-slate-400 mb-4">
                必须至少 <span className="text-amber-300 font-bold">{minReasonLen}</span> 字才能提交。
                当前：<span className={`font-bold ${exitReasonLen >= minReasonLen ? 'text-green-400' : 'text-red-400'}`}>{exitReasonLen}</span> / {minReasonLen} 字
              </p>
              <textarea
                value={exitReason}
                onChange={(e) => setExitReason(e.target.value)}
                placeholder="请认真写下你为什么要放弃今天的计划，思考这样做的后果……"
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

  // === 日常计划编辑界面 ===
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-white">📋 每日计划 · {today}</h2>
          <p className="text-slate-400 text-sm mt-1">
            制定计划后点击"开始专注"，期间不可随意退出
          </p>
        </div>
        <div className="flex items-center gap-3">
          {todayRecord && (
            <div
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                todayRecord.status === 'sunny'
                  ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                  : todayRecord.status === 'rainy'
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                  : 'bg-slate-500/20 text-slate-300 border border-slate-500/30'
              }`}
            >
              {todayRecord.status === 'sunny' ? '☀️ 晴天' : todayRecord.status === 'rainy' ? (
                <span>🌧️<span className="text-red-500 font-bold">!!</span> 雨天</span>
              ) : '⛅ 阴天'}
              {todayRecord.note && ` · ${todayRecord.note}`}
            </div>
          )}
        </div>
      </div>

      {/* 进度概览 */}
      <div className="bg-slate-800/50 rounded-2xl p-5 mb-6 border border-slate-700">
        <div className="flex justify-between text-sm text-slate-300 mb-2">
          <span>今日进度</span>
          <span className="font-mono">
            {progress.done} / {progress.total} 个任务 · {totalPlannedMin} 分钟
          </span>
        </div>
        <div className="h-3 bg-slate-900 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all"
            style={{ width: `${progress.rate * 100}%` }}
          />
        </div>
      </div>

      {/* 添加任务 */}
      <div className="bg-slate-800/50 rounded-2xl p-5 mb-6 border border-slate-700">
        <h3 className="text-white font-semibold mb-3">➕ 添加任务</h3>
        <div className="flex flex-wrap gap-3">
          <input
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
            placeholder="任务名称，如：学习高数第3章"
            className="flex-1 min-w-64 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:border-indigo-500 outline-none"
          />
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={5}
              max={480}
              value={newTaskDuration}
              onChange={(e) => setNewTaskDuration(e.target.value)}
              className="w-28 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white text-center focus:border-indigo-500 outline-none"
            />
            <span className="text-slate-400">分钟</span>
          </div>
          <button
            onClick={handleAddTask}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white font-medium transition"
          >
            添加
          </button>
        </div>
        <div className="flex gap-2 mt-3 flex-wrap">
          {DAILY_DEFAULT_TASKS.map((t, i) => (
            <button
              key={i}
              onClick={() => {
                addTask(today, t);
              }}
              className="px-3 py-1.5 bg-slate-700/50 hover:bg-slate-700 rounded-lg text-sm text-slate-300 transition"
            >
              + {t.title}（{t.durationMin}分）
            </button>
          ))}
        </div>
      </div>

      {/* 任务列表 */}
      <div className="bg-slate-800/50 rounded-2xl border border-slate-700 overflow-hidden">
        {!dailyPlan || dailyPlan.tasks.length === 0 ? (
          <div className="p-10 text-center text-slate-400">
            <div className="text-5xl mb-3">📭</div>
            <p>今日暂无计划，先添加几个任务吧</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-700/50">
            {dailyPlan.tasks.map((task, idx) => (
              <div
                key={task.id}
                className={`p-4 flex items-center gap-4 hover:bg-slate-700/30 transition ${
                  task.completed ? 'bg-green-900/10' : ''
                }`}
              >
                <button
                  onClick={() => toggleTask(today, task.id)}
                  className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center transition shrink-0 ${
                    task.completed
                      ? 'bg-green-500 border-green-500 text-white'
                      : 'border-slate-500 hover:border-green-400'
                  }`}
                >
                  {task.completed && '✓'}
                </button>
                <div className="flex-1 min-w-0">
                  <div
                    className={`font-medium ${
                      task.completed ? 'text-green-400 line-through' : 'text-white'
                    }`}
                  >
                    {idx + 1}. {task.title}
                  </div>
                  <div className="text-xs text-slate-400 mt-1 flex items-center gap-3">
                    <span>⏱️ {task.durationMin} 分钟</span>
                    {task.completed && task.completedAt && (
                      <span>✅ {new Date(task.completedAt).toLocaleTimeString('zh-CN')}</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => removeTask(today, task.id)}
                  className="p-2 text-slate-500 hover:text-red-400 transition"
                  title="删除"
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 开始按钮 */}
      {dailyPlan && dailyPlan.tasks.length > 0 && !session && (
        <button
          onClick={handleStartSession}
          className="w-full mt-8 p-5 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:brightness-110 rounded-2xl text-white font-bold text-xl shadow-2xl transition"
        >
          🚀 开始今日专注计划 · 预计 {totalPlannedMin} 分钟
        </button>
      )}
    </div>
  );
}
