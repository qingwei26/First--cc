// 日历模块 - 自动记录完成情况，晴天/阴天/雨天符号
import { useState, useMemo } from 'react';
import { useCalendar, useDailyPlans, getTodayStr } from '../focusStore';

const WEEKDAY = ['日', '一', '二', '三', '四', '五', '六'];

const STATUS_META = {
  sunny: { emoji: '☀️', label: '晴天', color: 'text-yellow-400', bg: 'bg-yellow-500/20', border: 'border-yellow-500/40', suffix: '' },
  cloudy: { emoji: '⛅', label: '阴天', color: 'text-slate-300', bg: 'bg-slate-500/20', border: 'border-slate-500/40', suffix: '' },
  rainy: { emoji: '🌧️', label: '雨天', color: 'text-blue-400', bg: 'bg-blue-500/20', border: 'border-blue-500/40', suffix: '!!' },
};

export default function CalendarView() {
  const { records, setDayStatus } = useCalendar();
  const { getDailyPlan, getDayProgress } = useDailyPlans();

  const now = new Date();
  const [cursorYear, setCursorYear] = useState(now.getFullYear());
  const [cursorMonth, setCursorMonth] = useState(now.getMonth()); // 0-11
  const [selectedDate, setSelectedDate] = useState(getTodayStr());
  const [editNote, setEditNote] = useState('');
  const [showNoteEditor, setShowNoteEditor] = useState(false);

  const todayStr = getTodayStr();

  // 生成日历网格
  const gridCells = useMemo(() => {
    const firstDay = new Date(cursorYear, cursorMonth, 1);
    const firstWeekday = firstDay.getDay(); // 0-6
    const daysInMonth = new Date(cursorYear, cursorMonth + 1, 0).getDate();
    const cells = [];
    // 前面空的
    for (let i = 0; i < firstWeekday; i++) {
      cells.push({ empty: true, key: `empty-${i}` });
    }
    // 月内日期
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${cursorYear}-${String(cursorMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      cells.push({
        empty: false,
        day: d,
        dateStr,
        record: records[dateStr],
      });
    }
    return cells;
  }, [cursorYear, cursorMonth, records]);

  const goPrevMonth = () => {
    if (cursorMonth === 0) {
      setCursorYear(y => y - 1);
      setCursorMonth(11);
    } else {
      setCursorMonth(m => m - 1);
    }
  };
  const goNextMonth = () => {
    if (cursorMonth === 11) {
      setCursorYear(y => y + 1);
      setCursorMonth(0);
    } else {
      setCursorMonth(m => m + 1);
    }
  };
  const goToday = () => {
    const n = new Date();
    setCursorYear(n.getFullYear());
    setCursorMonth(n.getMonth());
    setSelectedDate(todayStr);
  };

  // 选中日详情
  const selRecord = records[selectedDate];
  const selPlan = getDailyPlan(selectedDate);
  const selProgress = getDayProgress(selectedDate);

  const handleOpenNoteEditor = () => {
    setEditNote(selRecord?.note || '');
    setShowNoteEditor(true);
  };

  const handleSaveStatus = (status) => {
    setDayStatus(selectedDate, status, editNote.trim());
    setShowNoteEditor(false);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧大日历 */}
        <div className="lg:col-span-2 bg-slate-800/50 rounded-3xl p-6 border border-slate-700">
          {/* 月控制条 */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={goPrevMonth}
              className="p-2 hover:bg-slate-700 rounded-lg text-slate-300 transition text-xl"
            >
              ‹
            </button>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">
                {cursorYear} 年 {cursorMonth + 1} 月
              </div>
              <button
                onClick={goToday}
                className="mt-1 text-xs text-indigo-400 hover:text-indigo-300 transition"
              >
                回到今天
              </button>
            </div>
            <button
              onClick={goNextMonth}
              className="p-2 hover:bg-slate-700 rounded-lg text-slate-300 transition text-xl"
            >
              ›
            </button>
          </div>

          {/* 星期表头 */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {WEEKDAY.map((w, i) => (
              <div
                key={i}
                className={`text-center text-sm font-medium py-2 ${
                  i === 0 || i === 6 ? 'text-red-400/70' : 'text-slate-400'
                }`}
              >
                {w}
              </div>
            ))}
          </div>

          {/* 日历格子 */}
          <div className="grid grid-cols-7 gap-2">
            {gridCells.map((cell, idx) => {
              if (cell.empty) {
                return <div key={cell.key} />;
              }
              const isToday = cell.dateStr === todayStr;
              const isSelected = cell.dateStr === selectedDate;
              const meta = cell.record ? STATUS_META[cell.record.status] : null;

              return (
                <button
                  key={idx}
                  onClick={() => setSelectedDate(cell.dateStr)}
                  className={`aspect-square rounded-xl p-1 flex flex-col items-center justify-start transition-all relative ${
                    isSelected
                      ? 'ring-2 ring-indigo-400 bg-slate-700/60 scale-105'
                      : 'bg-slate-900/40 hover:bg-slate-700/40'
                  } ${isToday ? 'border-2 border-indigo-500' : 'border border-transparent'}`}
                >
                  <div
                    className={`text-sm font-medium ${
                      isToday ? 'text-indigo-300' : 'text-slate-300'
                    }`}
                  >
                    {cell.day}
                  </div>
                  {meta ? (
                    <div className="text-xl leading-none mt-1">
                      <span>{meta.emoji}</span>
                      {meta.suffix && <span className="text-red-500 font-bold text-sm ml-0.5">{meta.suffix}</span>}
                    </div>
                  ) : (
                    <div className="text-xs text-slate-600 mt-1">—</div>
                  )}
                  {isToday && (
                    <span className="absolute bottom-1 text-[10px] text-indigo-400 font-bold">
                      今天
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 右侧详情面板 */}
        <div className="bg-slate-800/50 rounded-3xl p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-xl font-bold text-white">📅 {selectedDate}</h3>
            <button
              onClick={handleOpenNoteEditor}
              className="text-sm text-indigo-400 hover:text-indigo-300 transition"
            >
              编辑状态
            </button>
          </div>

          {/* 状态卡片 */}
          {selRecord ? (
            <div
              className={`rounded-2xl p-5 mb-5 border ${STATUS_META[selRecord.status].bg} ${STATUS_META[selRecord.status].border}`}
            >
              <div className="flex items-center gap-3">
                <div className="text-5xl">
                  {STATUS_META[selRecord.status].emoji}
                  {STATUS_META[selRecord.status].suffix && (
                    <span className="text-red-500 font-bold text-3xl ml-1">
                      {STATUS_META[selRecord.status].suffix}
                    </span>
                  )}
                </div>
                <div>
                  <div className={`text-xl font-bold ${STATUS_META[selRecord.status].color}`}>
                    {STATUS_META[selRecord.status].label}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    更新于 {new Date(selRecord.updatedAt).toLocaleString('zh-CN')}
                  </div>
                </div>
              </div>
              {selRecord.note && (
                <div className="mt-4 p-3 bg-black/30 rounded-xl text-sm text-slate-200">
                  📝 {selRecord.note}
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-2xl p-6 mb-5 border border-dashed border-slate-600 text-center">
              <div className="text-4xl mb-2">📭</div>
              <div className="text-slate-400 text-sm">暂无记录，完成每日计划后自动更新</div>
            </div>
          )}

          {/* 任务进度 */}
          {selPlan && selPlan.tasks.length > 0 && (
            <div className="mb-5">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-slate-300 font-medium">当日任务进度</div>
                <div className="text-sm font-mono text-slate-400">
                  {selProgress.done}/{selProgress.total}
                </div>
              </div>
              <div className="h-2.5 bg-slate-900 rounded-full overflow-hidden mb-4">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all"
                  style={{ width: `${selProgress.rate * 100}%` }}
                />
              </div>
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {selPlan.tasks.map((t, i) => (
                  <div
                    key={t.id}
                    className={`p-3 rounded-xl flex items-center gap-3 ${
                      t.completed
                        ? 'bg-green-500/10 border border-green-500/30'
                        : 'bg-slate-900/50 border border-slate-700/50'
                    }`}
                  >
                    <span
                      className={`text-lg ${
                        t.completed ? 'text-green-400' : 'text-slate-500'
                      }`}
                    >
                      {t.completed ? '✅' : '⬜'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div
                        className={`text-sm truncate ${
                          t.completed ? 'text-green-400 line-through' : 'text-white'
                        }`}
                      >
                        {i + 1}. {t.title}
                      </div>
                      <div className="text-xs text-slate-500">⏱️ {t.durationMin} 分</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(!selPlan || selPlan.tasks.length === 0) && (
            <div className="text-sm text-slate-500 text-center py-4">
              当日未设置任务计划
            </div>
          )}
        </div>
      </div>

      {/* 状态编辑器 */}
      {showNoteEditor && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-3xl p-6 max-w-lg w-full border border-indigo-500/30">
            <h3 className="text-xl font-bold text-white mb-4">✏️ 编辑 {selectedDate} 的状态</h3>
            <textarea
              value={editNote}
              onChange={(e) => setEditNote(e.target.value)}
              placeholder="备注信息（可选），如：今日任务完成情况说明..."
              rows={4}
              className="w-full bg-slate-800 border border-slate-700 rounded-2xl p-4 text-white placeholder-slate-500 focus:border-indigo-500 outline-none resize-none mb-4"
            />
            <div className="grid grid-cols-3 gap-2 mb-4">
              {Object.entries(STATUS_META).map(([k, meta]) => (
                <button
                  key={k}
                  onClick={() => handleSaveStatus(k)}
                  className={`p-4 rounded-2xl border transition ${meta.bg} ${meta.border} hover:brightness-125`}
                >
                  <div className="text-3xl mb-1">
                    {meta.emoji}
                    {meta.suffix && <span className="text-red-500 font-bold text-xl">{meta.suffix}</span>}
                  </div>
                  <div className={`text-sm font-medium ${meta.color}`}>{meta.label}</div>
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowNoteEditor(false)}
              className="w-full p-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 transition"
            >
              取消
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
