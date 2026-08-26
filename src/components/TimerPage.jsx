// 计时器模块 - 正计时和倒计时
import { useState, useEffect, useRef } from 'react';

const formatTime = (sec) => {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  if (h > 0) return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

export default function TimerPage() {
  const [mode, setMode] = useState('stopwatch'); // 'stopwatch' | 'countdown'
  
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">⏱️ 计时器</h2>
          <p className="text-slate-400 text-sm mt-1">正计时和倒计时，专注你的时间</p>
        </div>
        <div className="flex bg-slate-800/50 rounded-xl p-1 border border-slate-700">
          <button
            onClick={() => setMode('stopwatch')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              mode === 'stopwatch'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            ⏱️ 正计时
          </button>
          <button
            onClick={() => setMode('countdown')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              mode === 'countdown'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
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

// 正计时组件
function Stopwatch() {
  const [elapsed, setElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [laps, setLaps] = useState([]);
  const startTimeRef = useRef(null);
  const accumulatedRef = useRef(0);

  useEffect(() => {
    let timer;
    if (isRunning) {
      timer = setInterval(() => {
        setElapsed(accumulatedRef.current + Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRunning]);

  const handleStart = () => {
    startTimeRef.current = Date.now();
    setIsRunning(true);
  };

  const handlePause = () => {
    accumulatedRef.current += Date.now() - startTimeRef.current;
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setElapsed(0);
    setLaps([]);
    accumulatedRef.current = 0;
    startTimeRef.current = null;
  };

  const handleLap = () => {
    setLaps(prev => [elapsed, ...prev]);
  };

  return (
    <div className="space-y-6">
      {/* 主显示区 */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-8 border border-indigo-500/30 shadow-2xl">
        <div className="text-center py-8">
          <div className="text-6xl font-mono font-bold text-indigo-300 tabular-nums mb-2">
            {formatTime(elapsed)}
          </div>
          <div className="text-sm text-slate-400">
            {isRunning ? '🟢 计时中...' : elapsed > 0 ? '⏸ 已暂停' : '准备就绪'}
          </div>
        </div>

        {/* 控制按钮 */}
        <div className="flex justify-center gap-4 mt-6">
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
            disabled={elapsed === 0}
            className={`px-6 py-4 rounded-2xl font-medium transition ${
              elapsed === 0
                ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                : 'bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30'
            }`}
          >
            🔄 重置
          </button>
        </div>
      </div>

      {/* 计次列表 */}
      {laps.length > 0 && (
        <div className="bg-slate-800/50 rounded-2xl p-5 border border-slate-700">
          <h3 className="text-white font-semibold mb-3">🏁 计次记录</h3>
          <div className="max-h-64 overflow-y-auto space-y-2">
            {laps.map((lap, idx) => (
              <div
                key={idx}
                className="flex justify-between items-center px-4 py-2 bg-slate-900/50 rounded-lg"
              >
                <span className="text-slate-400 text-sm">#{laps.length - idx}</span>
                <span className="font-mono text-indigo-300">{formatTime(lap)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// 倒计时组件
function Countdown() {
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(5);
  const [seconds, setSeconds] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const endTimeRef = useRef(null);

  useEffect(() => {
    let timer;
    if (isRunning && !isPaused && remaining > 0) {
      timer = setInterval(() => {
        const now = Date.now();
        const newRemaining = Math.max(0, Math.floor((endTimeRef.current - now) / 1000));
        setRemaining(newRemaining);
        if (newRemaining <= 0) {
          setIsRunning(false);
          setIsFinished(true);
          playBeep();
        }
      }, 100);
    }
    return () => clearInterval(timer);
  }, [isRunning, isPaused, remaining > 0]);

  const playBeep = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioCtx();
      const playTone = (freq, startTime, duration) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = freq;
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.3, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
        osc.start(startTime);
        osc.stop(startTime + duration);
      };
      const now = ctx.currentTime;
      playTone(880, now, 0.2);
      playTone(880, now + 0.3, 0.2);
      playTone(1100, now + 0.6, 0.3);
    } catch (e) {
      console.log('Audio not supported');
    }
  };

  const handleStart = () => {
    const totalSeconds = hours * 3600 + minutes * 60 + seconds;
    if (totalSeconds <= 0) return;
    endTimeRef.current = Date.now() + totalSeconds * 1000;
    setRemaining(totalSeconds);
    setIsRunning(true);
    setIsPaused(false);
    setIsFinished(false);
  };

  const handlePause = () => {
    setIsPaused(true);
  };

  const handleResume = () => {
    endTimeRef.current = Date.now() + remaining * 1000;
    setIsPaused(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setIsPaused(false);
    setIsFinished(false);
    setRemaining(0);
    endTimeRef.current = null;
  };

  const adjustTime = (type, delta) => {
    if (isRunning && !isPaused) return;
    if (type === 'h') setHours(h => Math.max(0, Math.min(23, h + delta)));
    if (type === 'm') setMinutes(m => Math.max(0, Math.min(59, m + delta)));
    if (type === 's') setSeconds(s => Math.max(0, Math.min(59, s + delta)));
  };

  const totalSetSeconds = hours * 3600 + minutes * 60 + seconds;
  const displayTime = isRunning ? remaining : totalSetSeconds;
  const progressPct = totalSetSeconds > 0 ? ((totalSetSeconds - remaining) / totalSetSeconds) * 100 : 0;
  const isUrgent = isRunning && remaining <= 10 && remaining > 0;

  return (
    <div className="space-y-6">
      {/* 主显示区 */}
      <div className={`rounded-3xl p-8 border-2 shadow-2xl transition-all ${
        isFinished
          ? 'bg-gradient-to-br from-green-900 to-emerald-900 border-green-500 animate-pulse'
          : isUrgent
          ? 'bg-gradient-to-br from-red-950 to-slate-900 border-red-500 animate-pulse'
          : 'bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 border-purple-500/30'
      }`}>
        {/* 时间设置 */}
        {!isRunning && !isFinished && (
          <div className="mb-6">
            <div className="text-center text-slate-400 text-sm mb-4">设置倒计时时间</div>
            <div className="flex justify-center items-center gap-4">
              <TimeInput
                label="时"
                value={hours}
                onAdjust={(d) => adjustTime('h', d)}
                max={23}
              />
              <span className="text-4xl text-slate-500 font-mono">:</span>
              <TimeInput
                label="分"
                value={minutes}
                onAdjust={(d) => adjustTime('m', d)}
                max={59}
              />
              <span className="text-4xl text-slate-500 font-mono">:</span>
              <TimeInput
                label="秒"
                value={seconds}
                onAdjust={(d) => adjustTime('s', d)}
                max={59}
              />
            </div>
          </div>
        )}

        {/* 倒计时显示 */}
        {(isRunning || isFinished) && (
          <div className="text-center py-4">
            <div className={`text-7xl font-mono font-bold tabular-nums mb-2 ${
              isFinished ? 'text-green-400' : isUrgent ? 'text-red-400' : 'text-purple-300'
            }`}>
              {formatTime(displayTime)}
            </div>
            <div className="text-lg">
              {isFinished ? '🎉 时间到！' : isPaused ? '⏸ 已暂停' : isUrgent ? '🔴 即将结束！' : '⏳ 倒计时中...'}
            </div>
          </div>
        )}

        {/* 进度条 */}
        {isRunning && (
          <div className="mt-4">
            <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-100 ${
                  isUrgent
                    ? 'bg-gradient-to-r from-red-500 to-orange-500'
                    : 'bg-gradient-to-r from-purple-500 to-pink-500'
                }`}
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        )}

        {/* 控制按钮 */}
        <div className="flex justify-center gap-4 mt-6">
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
      </div>

      {/* 快速预设 */}
      {!isRunning && !isFinished && (
        <div className="bg-slate-800/50 rounded-2xl p-5 border border-slate-700">
          <h3 className="text-white font-semibold mb-3">⚡ 快速设置</h3>
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: '1分钟', h: 0, m: 1, s: 0 },
              { label: '3分钟', h: 0, m: 3, s: 0 },
              { label: '5分钟', h: 0, m: 5, s: 0 },
              { label: '10分钟', h: 0, m: 10, s: 0 },
              { label: '15分钟', h: 0, m: 15, s: 0 },
              { label: '25分钟', h: 0, m: 25, s: 0 },
              { label: '30分钟', h: 0, m: 30, s: 0 },
              { label: '60分钟', h: 1, m: 0, s: 0 },
            ].map((preset) => (
              <button
                key={preset.label}
                onClick={() => {
                  setHours(preset.h);
                  setMinutes(preset.m);
                  setSeconds(preset.s);
                }}
                className="px-3 py-2 bg-slate-700/50 hover:bg-slate-700 rounded-lg text-sm text-slate-300 transition"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// 时间输入组件
function TimeInput({ label, value, onAdjust, max }) {
  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center gap-1">
        <button
          onClick={() => onAdjust(-1)}
          className="w-10 h-10 bg-slate-700 hover:bg-slate-600 rounded-lg text-white transition"
        >
          −
        </button>
        <div className="w-20 text-center">
          <input
            type="number"
            value={value}
            onChange={(e) => {
              const v = parseInt(e.target.value) || 0;
              if (v >= 0 && v <= max) {
                // Direct input not supported for simplicity
              }
            }}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg py-3 text-4xl font-mono text-center text-purple-300 focus:border-purple-500 outline-none"
            readOnly
          />
        </div>
        <button
          onClick={() => onAdjust(1)}
          className="w-10 h-10 bg-slate-700 hover:bg-slate-600 rounded-lg text-white transition"
        >
          +
        </button>
      </div>
      <span className="text-xs text-slate-400 mt-1">{label}</span>
    </div>
  );
}
