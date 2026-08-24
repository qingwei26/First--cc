// 数据统计面板 - 成就系统 + 等级 + 数据统计
import { useState, useEffect } from 'react';
import { getStatistics, ACHIEVEMENTS } from '../focusStore';

export default function StatsPage() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const refresh = () => setStats(getStatistics());
    refresh();
    const interval = setInterval(refresh, 5000);
    return () => clearInterval(interval);
  }, []);

  if (!stats) {
    return (
      <div className="p-6 text-center text-slate-400">加载中...</div>
    );
  }

  const sunRate = stats.sunnyDays + stats.cloudyDays + stats.rainyDays > 0
    ? Math.round((stats.sunnyDays / (stats.sunnyDays + stats.cloudyDays + stats.rainyDays)) * 100)
    : 0;

  const formatMinutes = (min) => {
    if (min >= 60) return `${Math.floor(min / 60)}小时${min % 60}分`;
    return `${min}分钟`;
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-1">📊 数据统计</h2>
        <p className="text-slate-400 text-sm">
          回顾你的坚持之路，每一次完成都值得庆祝
        </p>
      </div>

      {/* 等级卡片 */}
      <section className="bg-gradient-to-br from-indigo-600/30 via-purple-600/20 to-pink-600/30 rounded-3xl p-6 border border-purple-500/30">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-5xl shadow-lg">
              {stats.currentLevel.emoji}
            </div>
            <div>
              <div className="text-xs text-purple-300 font-medium">
                Lv.{stats.currentLevel.level} · {stats.currentLevel.name}
              </div>
              <div className="text-2xl font-bold text-white mt-1">
                经验值 {stats.exp}
              </div>
              {stats.nextLevel && (
                <div className="text-xs text-slate-400 mt-1">
                  距离 Lv.{stats.nextLevel.level} {stats.nextLevel.name} 还需 {stats.nextLevel.minExp - stats.exp} 经验
                </div>
              )}
            </div>
          </div>
          {stats.nextLevel && (
            <div className="flex-1 min-w-[200px]">
              <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all"
                  style={{ width: `${stats.progressToNext}%` }}
                />
              </div>
              <div className="text-right text-xs text-slate-400 mt-1">
                {stats.progressToNext}%
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 核心数据卡片 */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon="☀️"
          label="晴天总数"
          value={stats.sunnyDays}
          unit="天"
          color="from-yellow-500 to-orange-500"
          desc="全部完成的日子"
        />
        <StatCard
          icon="🔥"
          label="最长连续"
          value={stats.maxStreak}
          unit="天"
          color="from-red-500 to-orange-500"
          desc="坚持的最好成绩"
        />
        <StatCard
          icon="✅"
          label="完成任务"
          value={stats.totalTasks}
          unit="项"
          color="from-green-500 to-emerald-500"
          desc="累计完成任务数"
        />
        <StatCard
          icon="⏱️"
          label="专注时长"
          value={formatMinutes(stats.totalMinutes)}
          unit=""
          color="from-blue-500 to-cyan-500"
          desc="累计专注时间"
        />
      </section>

      {/* 本月数据 + 天气分布 */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-800/50 rounded-3xl p-6 border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            📅 本月概览
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-400">本月完成率</span>
                <span className="text-white font-medium">{sunRate}%</span>
              </div>
              <div className="h-2 bg-slate-900 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                  style={{ width: `${sunRate}%` }}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 pt-2">
              <MiniStat icon="☀️" label="晴天" value={stats.monthSunny} color="text-yellow-400" />
              <MiniStat icon="⛅" label="阴天" value={stats.monthTotal - stats.monthSunny} color="text-slate-300" />
              <MiniStat icon="🌧️" label="雨天" value={stats.rainyDays} color="text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 rounded-3xl p-6 border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            🏅 挑战进度
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-xl">
              <span className="text-sm text-slate-300">已完成短期挑战</span>
              <span className="text-xl font-bold text-purple-400">{stats.completedShortPlans}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-xl">
              <span className="text-sm text-slate-300">晴天总占比</span>
              <span className="text-xl font-bold text-yellow-400">{sunRate}%</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-xl">
              <span className="text-sm text-slate-300">连续打卡纪录</span>
              <span className="text-xl font-bold text-red-400">{stats.maxStreak} 天</span>
            </div>
          </div>
        </div>
      </section>

      {/* 成就系统 */}
      <section className="bg-slate-800/50 rounded-3xl p-6 border border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            🏆 成就徽章
          </h3>
          <span className="text-sm text-slate-400">
            已解锁 {stats.unlockedAchievements.length} / {ACHIEVEMENTS.length}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {ACHIEVEMENTS.map(a => {
            const unlocked = stats.unlockedAchievements.includes(a.id);
            return (
              <div
                key={a.id}
                className={`p-3 rounded-2xl border text-center transition ${
                  unlocked
                    ? 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-500/50'
                    : 'bg-slate-900/30 border-slate-700 opacity-50'
                }`}
                title={a.desc}
              >
                <div className={`text-3xl mb-1 ${!unlocked && 'grayscale'}`}>
                  {unlocked ? a.emoji : '🔒'}
                </div>
                <div className={`text-xs font-medium ${
                  unlocked ? 'text-yellow-300' : 'text-slate-500'
                }`}>
                  {a.name}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  {a.desc}
                </div>
              </div>
            );
          })}
        </div>

        {stats.unlockedAchievements.length === ACHIEVEMENTS.length && (
          <div className="mt-4 p-4 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-2xl border border-yellow-500/50 text-center">
            <div className="text-2xl mb-1">🎉🏆🎉</div>
            <div className="text-yellow-300 font-bold">恭喜你解锁全部成就！</div>
            <div className="text-xs text-slate-400 mt-1">你已经是真正的自律大师</div>
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({ icon, label, value, unit, color, desc }) {
  return (
    <div className={`bg-gradient-to-br ${color} p-[1px] rounded-2xl`}>
      <div className="bg-slate-900 rounded-2xl p-4 h-full">
        <div className="text-2xl mb-1">{icon}</div>
        <div className="text-xs text-slate-400">{label}</div>
        <div className="text-2xl font-bold text-white mt-1">
          {value}
          {unit && <span className="text-sm text-slate-400 ml-0.5">{unit}</span>}
        </div>
        <div className="text-[10px] text-slate-500 mt-1">{desc}</div>
      </div>
    </div>
  );
}

function MiniStat({ icon, label, value, color }) {
  return (
    <div className="text-center p-2 bg-slate-900/50 rounded-lg">
      <div className="text-lg">{icon}</div>
      <div className={`text-sm font-bold ${color}`}>{value}</div>
      <div className="text-[10px] text-slate-500">{label}</div>
    </div>
  );
}