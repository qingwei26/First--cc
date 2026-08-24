// 专注力控制软件主入口
import { useState, useEffect } from 'react';
import DailyPlan from './components/DailyPlan';
import CalendarView from './components/CalendarView';
import ShortTermPlan from './components/ShortTermPlan';
import SettingsPage from './components/SettingsPage';
import DevTestPanel from './components/DevTestPanel';
import StatsPage from './components/StatsPage';
import { useActiveSession, useCalendar, useDailyPlans, useShortTermPlans, useSettings, getTodayStr } from './focusStore';

const NAV_ITEMS = [
  { key: 'daily', label: '每日计划', emoji: '📋', color: 'from-indigo-500 to-blue-500' },
  { key: 'calendar', label: '日历打卡', emoji: '📅', color: 'from-yellow-500 to-orange-500' },
  { key: 'short', label: '短期挑战', emoji: '🏅', color: 'from-purple-500 to-pink-500' },
  { key: 'stats', label: '数据统计', emoji: '📊', color: 'from-emerald-500 to-teal-500' },
  { key: 'settings', label: '软件设置', emoji: '⚙️', color: 'from-slate-500 to-slate-600' },
  { key: 'dev', label: '测试面板', emoji: '🧪', color: 'from-amber-500 to-red-500' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('daily');
  const { session } = useActiveSession();
  const { getDayStatus } = useCalendar();
  const { getDayProgress } = useDailyPlans();
  const { shortPlans, getPlanProgress } = useShortTermPlans();
  const { settings } = useSettings();

  // 应用主题
  useEffect(() => {
    if (settings.theme === 'night') {
      document.documentElement.setAttribute('data-theme', 'night');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, [settings.theme]);

  const todayStr = getTodayStr();
  const todayRecord = getDayStatus(todayStr);
  const todayProgress = getDayProgress(todayStr);

  // 正在专注时，强制显示专注界面
  const isInSession = session && session.status === 'running';

  const renderContent = () => {
    // 如果正在进行短期计划专注，显示短期计划的专注界面
    if (isInSession && session.planType === 'shortTerm') {
      return <ShortTermPlan />;
    }
    switch (activeTab) {
      case 'calendar':
        return <CalendarView />;
      case 'short':
        return <ShortTermPlan />;
      case 'stats':
        return <StatsPage />;
      case 'settings':
        return <SettingsPage />;
      case 'dev':
        return <DevTestPanel />;
      case 'daily':
      default:
        return <DailyPlan />;
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0a0a1a 0%, #0f172a 50%, #111827 100%)', color: '#e5e7eb' }}>
      {/* 顶部栏 */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-slate-950/60 border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-xl shadow-lg">
              🧠
            </div>
            <div>
              <h1 className="text-lg font-bold text-white leading-tight">
                FocusSelf · 专注力自控
              </h1>
              <div className="text-xs text-slate-400">
                克制即自由 · {todayStr}
              </div>
            </div>
          </div>

          {/* 今日概览 */}
          <div className="flex items-center gap-3 flex-wrap">
            {!isInSession && (
              <>
                {/* 今日完成状态 */}
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-800/60 rounded-full border border-slate-700">
                  <span className="text-xs text-slate-400">今日</span>
                  {todayRecord ? (
                    <span className={`text-sm font-medium ${
                      todayRecord.status === 'sunny' ? 'text-yellow-300'
                        : todayRecord.status === 'rainy' ? 'text-blue-400'
                          : 'text-slate-300'
                    }`}>
                      {todayRecord.status === 'sunny' ? '☀️ 晴天'
                        : todayRecord.status === 'rainy' ? (
                          <span>🌧️<span className="text-red-500 font-bold">!!</span> 雨天</span>
                        )
                          : '⛅ 阴天'}
                    </span>
                  ) : (
                    <span className="text-xs text-slate-500">未打卡</span>
                  )}
                  <span className="text-xs text-slate-500 font-mono">
                    {todayProgress.done}/{todayProgress.total}
                  </span>
                </div>

                {/* 进行中的挑战数 */}
                {shortPlans.length > 0 && (
                  <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-purple-500/10 rounded-full border border-purple-500/30">
                    <span className="text-purple-300 text-sm">🏅 {shortPlans.length}</span>
                    <span className="text-xs text-slate-400">挑战</span>
                  </div>
                )}
              </>
            )}

            {isInSession && (
              <div className="flex items-center gap-2 px-4 py-1.5 bg-red-500/20 rounded-full border border-red-500/40 animate-pulse">
                <span className="w-2 h-2 bg-red-500 rounded-full" />
                <span className="text-sm font-medium text-red-300">专注中</span>
                <span className="text-xs text-slate-400">· {session.planType === 'shortTerm' ? '短期挑战' : '每日计划'}</span>
              </div>
            )}
          </div>
        </div>

        {/* 导航 */}
        {!isInSession && (
          <nav className="max-w-6xl mx-auto px-4 pb-3">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {NAV_ITEMS.map(item => {
                const active = activeTab === item.key;
                // 在短期挑战 tab 上附加徽章
                const badge = item.key === 'short' && shortPlans.length > 0 ? (
                  <span className="ml-1.5 text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full">
                    {shortPlans.length}
                  </span>
                ) : null;
                return (
                  <button
                    key={item.key}
                    onClick={() => setActiveTab(item.key)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all flex items-center ${
                      active
                        ? `bg-gradient-to-r ${item.color} text-white shadow-lg scale-105`
                        : 'bg-slate-800/50 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/50'
                    }`}
                  >
                    <span className="mr-1.5">{item.emoji}</span>
                    {item.label}
                    {badge}
                  </button>
                );
              })}
            </div>
          </nav>
        )}
      </header>

      <main className="max-w-6xl mx-auto pb-20">
        {renderContent()}
      </main>

      <footer className="text-center py-6 text-xs text-slate-500 border-t border-slate-800/50">
        FocusSelf · 专注力自控软件 · 把每一天活成自己想要的样子
      </footer>
    </div>
  );
}
