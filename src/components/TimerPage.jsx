// 计时器模块 - 正计时和倒计时（优化版）
import { useState, useEffect, useRef, useCallback } from 'react';

const LS_KEY_PRESETS = 'timer_countdown_presets';
const LS_KEY_LAST = 'timer_last_countdown';

const PRESETS_DEFAULT = [
  { label: '1分钟', h: 0, m: 1, s: 0 },
  { label: '3分钟', h: 0, m: 3, s: 0 },
  { label: '5分钟', h: 0, m: 5, s: 0 },
  { label: '10分钟', h: 0, m: 10, s: 0 },
  { label: '15分钟', h: 0, m: 15, s: 0 },
  { label: '25分钟', h: 0, m: 25, s: 0 },
  { label: '30分钟', h: 0, m: 30, s: 0 },
  { label: '45分钟', h: 0, m: 45, s: 0 },
  { label: '60分钟', h: 1, m: 0, s: 0 },
];

const formatStopwatch = (ms) => {
  const totalMs = Math.max(0, ms);
  const h = Math.floor(totalMs / 3600000);
  const m = Math.floor((totalMs % 3600000) / 60000);
  const s = Math.floor((totalMs % 60000) / 1000);
  const cs = Math.floor((totalMs % 1000) / 10); // 百分之一秒
  if (h > 0) return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(cs).padStart(2, '0')}`;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(cs).padStart(2, '0')}`;
};

const formatCountdown = (sec) => {
  sec = Math.max(0, sec);
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  if (h > 0) return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

// ---------- 音频管理（单例 AudioContext，避免泄漏） ----------
let audioCtx = null;
const getAudioCtx = () => {
  if (!audioCtx) {
    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    } catch { /* ignore */ }
  }
  return audioCtx;
};

const playFinishBeep = () => {
  const ctx = getAudioCtx();
  if (!ctx) return;
  const now = ctx.currentTime;
  [
    { f: 880, t: now, d: 0.2 },
    { f: 880, t: now + 0.25, d: 0.2 },
    { f: 1100, t: now + 0.5, d: 0.3 },
    { f: 1320, t: now + 0.85, d: 0.4 },
  ].forEach(({ f, t, d }) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = f;
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + d);
    osc.start(t);
    osc.stop(t + d);
  });
};

// ---------- 主入口 ----------
export default function TimerPage() {
  const [mode, setMode] = useState(() => {
    try { return localStorage.getItem('timer_mode') || 'stopwatch'; } catch { return 'stopwatch'; }
  });

  useEffect(() => {
    try { localStorage.setItem('timer_mode', mode); } catch { /* ignore */ }
  }, [mode]);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-white">⏱️ 计时器</h2>
          <p className="text-slate-400 text-sm mt-1">
            {mode === 'stopwatch' ? '精确到 10 毫秒的正计时 · 空格键开始/暂停' : '倒计时 · 空格键开始/暂停'}
          </p>
        </div>
        <div className="flex bg-slate-800/50 rounded-xl p-1 border border-slate-700">
          <button
            onClick={() => setMode('stopwatch')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              mode === 'stopwatch' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            ⏱️ 正计时
          </button>
          <button
            onClick={() => setMode('countdown')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              mode === 'countdown' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            ⏳ 倒计时
          </button>
        </div>
      </div>

      {mode === 'stopwatch' ? <Stopwatch /> : <Countdown />}
    </div>
  );
}

// ---------- 正计时 ----------
function Stopwatch() {
  const [elapsedMs, setElapsedMs] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [laps, setLaps] = useState([]); // [{totalMs, splitMs}]
  const startTimeRef = useRef(null);
  const accumulatedRef = useRef(0);
  const rafRef = useRef(null);

  // RAF 驱动的高精度计时
  useEffect(() => {
    if (!isRunning) return;
    const tick = () => {
      setElapsedMs(accumulatedRef.current + (Date.now() - startTimeRef.current));
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [isRunning]);

  // 标签页标题
  useEffect(() => {
    const base = '⏱️ 计时器';
    if (isRunning) {
      document.title = `${formatStopwatch(elapsedMs)} · 计时中`;
    } else if (elapsedMs > 0) {
      document.title = `${formatStopwatch(elapsedMs)} · 已暂停`;
    } else {
      document.title = base;
    }
    return () => { document.title = base; };
  }, [elapsedMs, isRunning]);

  const handleStart = useCallback(() => {
    if (isRunning) return;
    startTimeRef.current = Date.now();
    setIsRunning(true);
  }, [isRunning]);

  const handlePause = useCallback(() => {
    if (!isRunning) return;
    accumulatedRef.current += Date.now() - startTimeRef.current;
    setIsRunning(false);
  }, [isRunning]);

  const handleReset = useCallback(() => {
    setIsRunning(false);
    setElapsedMs(0);
    setLaps([]);
    accumulatedRef.current = 0;
    startTimeRef.current = null;
  }, []);

  const handleLap = useCallback(() => {
    const current = accumulatedRef.current + (isRunning ? Date.now() - startTimeRef.current : 0);
    setLaps(prev => {
      const prevTotal = prev[0]?.totalMs ?? 0;
      return [{ totalMs: current, splitMs: current - prevTotal }, ...prev];
    });
  }, [isRunning]);

  // 键盘快捷键
  useEffect(() => {
    const handler = (e) => {
      const tag = e.target?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.code === 'Space') {
        e.preventDefault();
        if (isRunning) handlePause(); else handleStart();
      } else if (e.key === 'r' || e.key === 'R') {
        if (elapsedMs > 0) handleReset();
      } else if (e.key === 'l' || e.key === 'L') {
        if (isRunning) handleLap();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isRunning, elapsedMs, handleStart, handlePause, handleReset, handleLap]);

  return (
    <div className="space-y-6">
      {/* 主显示区 */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-8 border border-indigo-500/30 shadow-2xl">
        <div className="text-center py-8">
          <div className={`font-mono font-bold tabular-nums mb-2 ${
            elapsedMs >= 3600000 ? 'text-5xl text-indigo-300' : 'text-7xl text-indigo-300'
          }`}>
            {formatStopwatch(elapsedMs)}
          </div>
          <div className="text-sm text-slate-400">
            {isRunning ? '🟢 计时中...' : elapsedMs > 0 ? '⏸ 已暂停' : '准备就绪'}
          </div>
        </div>

        {/* 控制按钮 */}
        <div className="flex justify-center gap-4 mt-6 flex-wrap">
          {!isRunning ? (
            <button
              onClick={handleStart}
              className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 rounded-2xl text-white font-bold text-lg shadow-lg transition"
            >
              ▶ 开始
            </button>
          ) : (
            <>
              <button
                onClick={handleLap}
                className="px-6 py-4 bg-slate-700 hover:bg-slate-600 rounded-2xl text-white font-medium transition"
              >
                🏁 计次
              </button>
              <button
                onClick={handlePause}
                className="px-8 py-4 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 rounded-2xl text-white font-bold text-lg shadow-lg transition"
              >
                ⏸ 暂停
              </button>
            </>
          )}
          <button
            onClick={handleReset}
            disabled={elapsedMs === 0}
            className={`px-6 py-4 rounded-2xl font-medium transition ${
              elapsedMs === 0
                ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                : 'bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30'
            }`}
          >
            🔄 重置
          </button>
        </div>
        <div className="text-center text-xs text-slate-500 mt-4">
          💡 快捷键：<kbd className="px-1.5 py-0.5 bg-slate-700 rounded text-slate-300">Space</kbd> 开始/暂停 · 
          <kbd className="px-1.5 py-0.5 bg-slate-700 rounded text-slate-300">L</kbd> 计次 · 
          <kbd className="px-1.5 py-0.5 bg-slate-700 rounded text-slate-300">R</kbd> 重置
        </div>
      </div>

      {/* 计次列表 */}
      {laps.length > 0 && (
        <div className="bg-slate-800/50 rounded-2xl p-5 border border-slate-700">
          <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
            🏁 计次记录 <span className="text-xs text-slate-500 font-normal">（显示每段耗时）</span>
          </h3>
          <div className="max-h-64 overflow-y-auto space-y-2">
            {laps.map((lap, idx) => {
              const isFastest = laps.length > 1 && lap.splitMs === Math.min(...laps.map(l => l.splitMs));
              const isSlowest = laps.length > 1 && lap.splitMs === Math.max(...laps.map(l => l.splitMs));
              return (
                <div
                  key={idx}
                  className={`flex justify-between items-center px-4 py-2 rounded-lg ${
                    isFastest ? 'bg-green-900/30 border border-green-700/50' :
                    isSlowest ? 'bg-red-900/30 border border-red-700/50' :
                    'bg-slate-900/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400 text-sm">#{laps.length - idx}</span>
                    {isFastest && <span className="text-xs text-green-400">⚡ 最快</span>}
                    {isSlowest && <span className="text-xs text-red-400">🐢 最慢</span>}
                  </div>
                  <div className="flex gap-4 text-sm">
                    <span className="text-slate-400">+<span className="font-mono text-yellow-300">{formatStopwatch(lap.splitMs)}</span></span>
                    <span className="font-mono text-indigo-300">{formatStopwatch(lap.totalMs)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ---------- 倒计时 ----------
function Countdown() {
  // 从 localStorage 恢复上次设置
  const [hours, setHours] = useState(() => {
    try { return parseInt(localStorage.getItem(LS_KEY_LAST + '_h')) || 0; } catch { return 0; }
  });
  const [minutes, setMinutes] = useState(() => {
    try { return parseInt(localStorage.getItem(LS_KEY_LAST + '_m')) || 5; } catch { return 5; }
  });
  const [seconds, setSeconds] = useState(() => {
    try { return parseInt(localStorage.getItem(LS_KEY_LAST + '_s')) || 0; } catch { return 0; }
  });
  const [presets, setPresets] = useState(() => {
    try {
      const saved = localStorage.getItem(LS_KEY_PRESETS);
      return saved ? JSON.parse(saved) : PRESETS_DEFAULT;
    } catch { return PRESETS_DEFAULT; }
  });

  const [remaining, setRemaining] = useState(0);
  const [initialTotal, setInitialTotal] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [showPresetModal, setShowPresetModal] = useState(false);
  const [newPresetLabel, setNewPresetLabel] = useState('');
  const endTimeRef = useRef(null);
  const timerRef = useRef(null);

  const totalSetSeconds = hours * 3600 + minutes * 60 + seconds;

  // 保存设置
  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY_LAST + '_h', String(hours));
      localStorage.setItem(LS_KEY_LAST + '_m', String(minutes));
      localStorage.setItem(LS_KEY_LAST + '_s', String(seconds));
    } catch { /* ignore */ }
  }, [hours, minutes, seconds]);

  useEffect(() => {
    try { localStorage.setItem(LS_KEY_PRESETS, JSON.stringify(presets)); } catch { /* ignore */ }
  }, [presets]);

  // 倒计时 tick
  useEffect(() => {
    if (!isRunning || isPaused || isFinished) return;
    const tick = () => {
      const now = Date.now();
      const newRemaining = Math.max(0, Math.floor((endTimeRef.current - now) / 1000));
      setRemaining(newRemaining);
      if (newRemaining <= 0) {
        setIsRunning(false);
        setIsFinished(true);
        playFinishBeep();
        // 尝试移动端振动
        if (navigator.vibrate) navigator.vibrate([500, 200, 500]);
      }
    };
    tick();
    timerRef.current = setInterval(tick, 250);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isRunning, isPaused, isFinished]);

  // 标签页标题 + 快结束闪烁
  useEffect(() => {
    const base = '⏳ 计时器';
    if (isFinished) {
      document.title = '🎉 时间到！';
    } else if (isRunning) {
      document.title = `${formatCountdown(remaining)} · ${remaining <= 10 ? '🔴 即将结束' : '倒计时'}`;
    } else if (isPaused) {
      document.title = `${formatCountdown(remaining)} · 已暂停`;
    } else {
      document.title = base;
    }
    return () => { document.title = base; };
  }, [isRunning, isPaused, isFinished, remaining]);

  const handleStart = useCallback(() => {
    if (totalSetSeconds <= 0 || isRunning) return;
    endTimeRef.current = Date.now() + totalSetSeconds * 1000;
    setInitialTotal(totalSetSeconds);
    setRemaining(totalSetSeconds);
    setIsRunning(true);
    setIsPaused(false);
    setIsFinished(false);
  }, [totalSetSeconds, isRunning]);

  const handlePause = useCallback(() => {
    if (!isRunning || isPaused) return;
    setIsPaused(true);
  }, [isRunning, isPaused]);

  const handleResume = useCallback(() => {
    if (!isRunning || !isPaused) return;
    endTimeRef.current = Date.now() + remaining * 1000;
    setIsPaused(false);
  }, [isRunning, isPaused, remaining]);

  const handleReset = useCallback(() => {
    setIsRunning(false);
    setIsPaused(false);
    setIsFinished(false);
    setRemaining(0);
    setInitialTotal(0);
    endTimeRef.current = null;
  }, []);

  // 键盘快捷键
  useEffect(() => {
    const handler = (e) => {
      const tag = e.target?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.code === 'Space') {
        e.preventDefault();
        if (!isRunning && !isFinished) handleStart();
        else if (isRunning && !isPaused) handlePause();
        else if (isRunning && isPaused) handleResume();
      } else if (e.key === 'r' || e.key === 'R') {
        if (isRunning || isPaused || isFinished || remaining > 0) handleReset();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isRunning, isPaused, isFinished, remaining, handleStart, handlePause, handleResume, handleReset]);

  const setPreset = (p) => {
    setHours(p.h); setMinutes(p.m); setSeconds(p.s);
  };

  const addPreset = () => {
    const label = newPresetLabel.trim();
    if (!label) return;
    const newP = { label, h: hours, m: minutes, s: seconds };
    setPresets(prev => [...prev, newP]);
    setNewPresetLabel('');
  };

  const removePreset = (label) => {
    setPresets(prev => prev.filter(p => p.label !== label));
  };

  const adjustTime = (type, delta) => {
    if (isRunning && !isPaused) return;
    if (type === 'h') setHours(h => Math.max(0, Math.min(23, h + delta)));
    if (type === 'm') setMinutes(m => Math.max(0, Math.min(59, m + delta)));
    if (type === 's') setSeconds(s => Math.max(0, Math.min(59, s + delta)));
  };

  const progressPct = initialTotal > 0 ? ((initialTotal - remaining) / initialTotal) * 100 : 0;
  const displayTime = isRunning || isPaused ? remaining : totalSetSeconds;
  const isUrgent = (isRunning || isPaused) && remaining <= 10 && remaining > 0;
  const circumference = 2 * Math.PI * 120;
  const strokeDashoffset = circumference * (1 - progressPct / 100);

  return (
    <div className="space-y-6">
      {/* 主显示区 */}
      <div className={`rounded-3xl p-8 border-2 shadow-2xl transition-all ${
        isFinished
          ? 'bg-gradient-to-br from-green-900 to-emerald-900 border-green-500 animate-pulse'
          : isUrgent
          ? 'bg-gradient-to-br from-red-950 to-slate-900 border-red-500'
          : 'bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 border-purple-500/30'
      }`}>
        <div className="flex flex-col md:flex-row items-center gap-8">
          {/* 圆环进度 */}
          {(isRunning || isPaused || isFinished) && (
            <div className="relative w-64 h-64 flex-shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 256 256">
                <circle
                  cx="128" cy="128" r="120"
                  fill="none" stroke="currentColor" strokeOpacity="0.1" strokeWidth="8"
                />
                <circle
                  cx="128" cy="128" r="120"
                  fill="none"
                  stroke={isFinished ? '#22c55e' : isUrgent ? '#ef4444' : '#a855f7'}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  style={{ transition: 'stroke-dashoffset 0.3s ease' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className={`text-5xl font-mono font-bold tabular-nums ${
                  isFinished ? 'text-green-400' : isUrgent ? 'text-red-400 animate-pulse' : 'text-purple-300'
                }`}>
                  {formatCountdown(displayTime)}
                </div>
                <div className="text-sm mt-2">
                  {isFinished ? '🎉 时间到！' : isPaused ? '⏸ 已暂停' : isUrgent ? '🔴 即将结束！' : '⏳ 倒计时中'}
                </div>
              </div>
            </div>
          )}

          {/* 时间设置区 */}
          {!isRunning && !isFinished && (
            <div className="flex-1 w-full">
              <div className="text-center text-slate-400 text-sm mb-4">设置倒计时时间</div>
              <div className="flex justify-center items-center gap-4">
                <EditableTimeInput
                  label="时" value={hours} max={23}
                  onChange={(v) => setHours(Math.max(0, Math.min(23, v)))}
                  onAdjust={(d) => adjustTime('h', d)}
                  disabled={isRunning && !isPaused}
                />
                <span className="text-4xl text-slate-500 font-mono">:</span>
                <EditableTimeInput
                  label="分" value={minutes} max={59}
                  onChange={(v) => setMinutes(Math.max(0, Math.min(59, v)))}
                  onAdjust={(d) => adjustTime('m', d)}
                  disabled={isRunning && !isPaused}
                />
                <span className="text-4xl text-slate-500 font-mono">:</span>
                <EditableTimeInput
                  label="秒" value={seconds} max={59}
                  onChange={(v) => setSeconds(Math.max(0, Math.min(59, v)))}
                  onAdjust={(d) => adjustTime('s', d)}
                  disabled={isRunning && !isPaused}
                />
              </div>
            </div>
          )}
        </div>

        {/* 控制按钮 */}
        <div className="flex justify-center gap-4 mt-6 flex-wrap">
          {!isRunning && !isFinished && (
            <button
              onClick={handleStart}
              disabled={totalSetSeconds === 0}
              className={`px-8 py-4 rounded-2xl font-bold text-lg shadow-lg transition ${
                totalSetSeconds === 0
                  ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white'
              }`}
            >
              ▶ 开始倒计时
            </button>
          )}

          {isRunning && !isPaused && !isFinished && (
            <>
              <button
                onClick={handlePause}
                className="px-8 py-4 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 rounded-2xl text-white font-bold text-lg shadow-lg transition"
              >
                ⏸ 暂停
              </button>
              <button
                onClick={handleReset}
                className="px-6 py-4 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 rounded-2xl text-red-400 font-medium transition"
              >
                🔄 重置
              </button>
            </>
          )}

          {isRunning && isPaused && !isFinished && (
            <>
              <button
                onClick={handleResume}
                className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 rounded-2xl text-white font-bold text-lg shadow-lg transition"
              >
                ▶ 继续
              </button>
              <button
                onClick={handleReset}
                className="px-6 py-4 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 rounded-2xl text-red-400 font-medium transition"
              >
                🔄 重置
              </button>
            </>
          )}

          {isFinished && (
            <button
              onClick={handleReset}
              className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-2xl text-white font-bold text-lg shadow-lg transition"
            >
              🔄 重新设置
            </button>
          )}
        </div>
        <div className="text-center text-xs text-slate-500 mt-4">
          💡 快捷键：<kbd className="px-1.5 py-0.5 bg-slate-700 rounded text-slate-300">Space</kbd> 开始/暂停 · 
          <kbd className="px-1.5 py-0.5 bg-slate-700 rounded text-slate-300">R</kbd> 重置
        </div>
      </div>

      {/* 快速预设 */}
      {!isRunning && !isFinished && (
        <div className="bg-slate-800/50 rounded-2xl p-5 border border-slate-700">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-white font-semibold">⚡ 快速设置</h3>
            <button
              onClick={() => setShowPresetModal(true)}
              className="text-xs text-indigo-400 hover:text-indigo-300 transition"
            >
              ⚙️ 管理预设
            </button>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {presets.map((p) => (
              <button
                key={p.label}
                onClick={() => setPreset(p)}
                className={`px-3 py-2 rounded-lg text-sm transition ${
                  hours === p.h && minutes === p.m && seconds === p.s
                    ? 'bg-indigo-600 text-white shadow'
                    : 'bg-slate-700/50 hover:bg-slate-700 text-slate-300'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 预设管理弹窗 */}
      {showPresetModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
             onClick={() => setShowPresetModal(false)}>
          <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 max-w-md w-full"
               onClick={e => e.stopPropagation()}>
            <h3 className="text-white font-semibold mb-4">⚙️ 管理预设</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto mb-4">
              {presets.map(p => (
                <div key={p.label} className="flex items-center justify-between px-3 py-2 bg-slate-900/50 rounded-lg">
                  <span className="text-slate-300 text-sm">{p.label} <span className="text-slate-500">({p.h}h {p.m}m {p.s}s)</span></span>
                  <button
                    onClick={() => removePreset(p.label)}
                    className="text-red-400 hover:text-red-300 text-sm"
                  >删除</button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newPresetLabel}
                onChange={e => setNewPresetLabel(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addPreset()}
                placeholder={`新增：${hours}h ${minutes}m ${seconds}s`}
                className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:border-indigo-500 outline-none"
              />
              <button
                onClick={addPreset}
                disabled={!newPresetLabel.trim()}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg text-sm transition"
              >添加</button>
            </div>
            <div className="mt-4 text-right">
              <button
                onClick={() => setShowPresetModal(false)}
                className="text-slate-400 hover:text-white text-sm transition"
              >关闭</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------- 可编辑时间输入 ----------
function EditableTimeInput({ label, value, max, onChange, onAdjust, disabled }) {
  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center gap-1">
        <button
          onClick={() => onAdjust(-1)}
          disabled={disabled}
          className="w-10 h-10 bg-slate-700 hover:bg-slate-600 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg text-white transition"
        >−</button>
        <input
          type="number"
          value={value}
          min="0"
          max={max}
          disabled={disabled}
          onChange={(e) => {
            const v = parseInt(e.target.value);
            if (!isNaN(v)) onChange(v);
          }}
          onFocus={(e) => e.target.select()}
          className="w-20 bg-slate-900 border border-slate-700 rounded-lg py-3 text-4xl font-mono text-center text-purple-300 focus:border-purple-500 outline-none disabled:opacity-50"
        />
        <button
          onClick={() => onAdjust(1)}
          disabled={disabled}
          className="w-10 h-10 bg-slate-700 hover:bg-slate-600 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg text-white transition"
        >+</button>
      </div>
      <span className="text-xs text-slate-400 mt-1">{label}</span>
    </div>
  );
}
