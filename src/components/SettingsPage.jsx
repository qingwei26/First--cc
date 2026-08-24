// 设置模块 - 应用白名单、通知过滤、退出规则等
import { useState, useRef } from 'react';
import { useSettings, testSound, testVibrate, downloadBackup, importAllData } from '../focusStore';

const FILTER_OPTIONS = [
  { value: 'whitelist', label: '仅白名单显示', desc: '只允许白名单内的应用/来源发送通知', emoji: '✅' },
  { value: 'all', label: '全部显示', desc: '不对通知做任何过滤', emoji: '📢' },
  { value: 'none', label: '全部不显示', desc: '进入专注模式时屏蔽所有通知（除系统告警）', emoji: '🔕' },
];

const APP_PRESETS = ['电话', '微信', '短信', 'QQ', '钉钉', '飞书', '邮件', '时钟/闹钟', '家人电话'];

export default function SettingsPage() {
  const { settings, updateSettings, addAllowedApp, removeAllowedApp } = useSettings();
  const [newAppName, setNewAppName] = useState('');
  const [importMsg, setImportMsg] = useState('');
  const fileInputRef = useRef(null);

  const handleAddApp = () => {
    if (!newAppName.trim()) return;
    addAllowedApp(newAppName.trim());
    setNewAppName('');
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = importAllData(ev.target.result);
      if (result.success) {
        setImportMsg(`✅ 导入成功，恢复了 ${result.importedCount} 类数据。页面即将刷新...`);
        setTimeout(() => window.location.reload(), 1500);
      } else {
        setImportMsg(`❌ ${result.error}`);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">⚙️ 软件设置</h2>
        <p className="text-slate-400 text-sm mt-1">
          调整通知过滤、应用白名单和专注规则，帮助你更好地进入专注状态
        </p>
      </div>

      {/* 通知过滤 */}
      <section className="bg-slate-800/50 rounded-3xl p-6 border border-slate-700 mb-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          📬 通知过滤策略
        </h3>
        <p className="text-xs text-slate-400 mb-5">
          当处于专注计划进行中时生效。如果是"仅白名单显示"模式，只有下面白名单中的应用能弹出通知。
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {FILTER_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => updateSettings({ notificationFilter: opt.value })}
              className={`p-5 rounded-2xl border-2 text-left transition ${
                settings.notificationFilter === opt.value
                  ? 'bg-indigo-500/15 border-indigo-500 ring-2 ring-indigo-500/40'
                  : 'bg-slate-900/40 border-slate-700 hover:border-slate-500'
              }`}
            >
              <div className="text-3xl mb-2">{opt.emoji}</div>
              <div className={`font-medium mb-1 ${
                settings.notificationFilter === opt.value ? 'text-indigo-300' : 'text-white'
              }`}>
                {opt.label}
              </div>
              <div className="text-xs text-slate-400">{opt.desc}</div>
            </button>
          ))}
        </div>

        {settings.notificationFilter === 'whitelist' && (
          <div className="mt-6 p-4 bg-indigo-500/10 rounded-2xl border border-indigo-500/30">
            <div className="text-sm text-indigo-200 mb-1">⚠️ 当前为白名单模式</div>
            <div className="text-xs text-slate-400">
              仅下方白名单内的应用（如电话、微信等）的通知会正常显示，其他软件通知将被静默隐藏。
            </div>
          </div>
        )}
      </section>

      {/* 应用白名单 */}
      <section className="bg-slate-800/50 rounded-3xl p-6 border border-slate-700 mb-6">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            📋 允许通知的应用白名单
          </h3>
          <div className="text-xs text-slate-400">
            当前 {settings.allowedApps.length} 个
          </div>
        </div>

        {/* 添加新应用 */}
        <div className="flex gap-2 mb-5 flex-wrap">
          <input
            value={newAppName}
            onChange={(e) => setNewAppName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddApp()}
            placeholder="输入应用/来源名称，如：支付宝、家人来电"
            className="flex-1 min-w-60 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:border-indigo-500 outline-none"
          />
          <button
            onClick={handleAddApp}
            className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white font-medium transition"
          >
            + 添加
          </button>
        </div>

        {/* 预设 */}
        <div className="mb-5">
          <div className="text-xs text-slate-500 mb-2">快速添加常用：</div>
          <div className="flex flex-wrap gap-2">
            {APP_PRESETS.map(app => {
              const already = settings.allowedApps.includes(app);
              return (
                <button
                  key={app}
                  onClick={() => already ? removeAllowedApp(app) : addAllowedApp(app)}
                  className={`px-3 py-1.5 rounded-lg text-sm transition ${
                    already
                      ? 'bg-green-500/20 text-green-300 border border-green-500/40'
                      : 'bg-slate-700/50 hover:bg-slate-700 text-slate-300'
                  }`}
                >
                  {already ? '✓ ' : '+ '}{app}
                </button>
              );
            })}
          </div>
        </div>

        {/* 白名单列表 */}
        <div className="space-y-2">
          {settings.allowedApps.length === 0 ? (
            <div className="p-8 text-center text-slate-500 border border-dashed border-slate-700 rounded-2xl">
              白名单为空，专注模式下将不会有任何应用通知弹出
            </div>
          ) : (
            settings.allowedApps.map(app => (
              <div
                key={app}
                className="flex items-center gap-3 p-4 bg-slate-900/50 rounded-2xl border border-slate-700 hover:border-slate-600 transition"
              >
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-xl shrink-0">
                  {['电话', '微信', '短信', 'QQ', '钉钉', '飞书'].includes(app)
                    ? app === '电话' ? '📞'
                    : app === '微信' ? '💬'
                    : app === '短信' ? '✉️'
                    : app === 'QQ' ? '🐧'
                    : app === '钉钉' ? '📎'
                    : '📧'
                    : '🔔'}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-white">{app}</div>
                  <div className="text-xs text-slate-500">专注中允许显示通知</div>
                </div>
                <label className="flex items-center gap-2 text-xs text-green-400 mr-3">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  已放行
                </label>
                <button
                  onClick={() => removeAllowedApp(app)}
                  className="p-2 text-slate-500 hover:text-red-400 transition"
                  title="从白名单移除"
                >
                  ✕
                </button>
              </div>
            ))
          )}
        </div>
      </section>

      {/* 专注规则 */}
      <section className="bg-slate-800/50 rounded-3xl p-6 border border-slate-700 mb-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          🚫 专注规则
        </h3>

        <div className="space-y-4">
          <div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-700">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <div className="font-medium text-white">紧急退出记为"雨天"</div>
                <div className="text-xs text-slate-400 mt-1">
                  开启后，如果使用"紧急退出"按钮放弃计划，当天日历会自动标记为"雨天"，影响月度评分
                </div>
              </div>
              <button
                onClick={() => updateSettings({ emergencyPenalty: !settings.emergencyPenalty })}
                className={`relative w-14 h-8 rounded-full transition shrink-0 ${
                  settings.emergencyPenalty ? 'bg-green-500' : 'bg-slate-600'
                }`}
              >
                <span
                  className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-all ${
                    settings.emergencyPenalty ? 'left-7' : 'left-1'
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-700">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <div className="font-medium text-white">"写理由退出"最少字数</div>
                <div className="text-xs text-slate-400 mt-1">
                  正常放弃计划时需要写满这么多字，用来让你认真思考是否真的要放弃。
                  （建议设为 50-200 字，越多越能防冲动退出）
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <input
                  type="number"
                  min={20}
                  max={1000}
                  value={settings.exitReasonMinLength}
                  onChange={(e) => {
                    const v = Math.max(20, Math.min(1000, Number(e.target.value) || 100));
                    updateSettings({ exitReasonMinLength: v });
                  }}
                  className="w-24 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-center focus:border-indigo-500 outline-none"
                />
                <span className="text-slate-400 text-sm">字</span>
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              {[50, 100, 150, 200, 300].map(n => (
                <button
                  key={n}
                  onClick={() => updateSettings({ exitReasonMinLength: n })}
                  className={`px-3 py-1 rounded-lg text-xs transition ${
                    settings.exitReasonMinLength === n
                      ? 'bg-indigo-500 text-white'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {n}字
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 声音与震动 */}
      <section className="bg-slate-800/50 rounded-3xl p-6 border border-slate-700 mb-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          🔔 声音与震动提示
        </h3>

        {/* 模式选择 */}
        <div className="mb-5">
          <div className="text-sm text-slate-400 mb-3">提示模式</div>
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => updateSettings({ soundMode: 'sound' })}
              className={`p-4 rounded-2xl border-2 text-center transition ${
                settings.soundMode === 'sound'
                  ? 'bg-purple-500/15 border-purple-500 ring-2 ring-purple-500/40'
                  : 'bg-slate-900/40 border-slate-700 hover:border-slate-500'
              }`}
            >
              <div className="text-2xl mb-1">🔊</div>
              <div className={`text-sm font-medium ${
                settings.soundMode === 'sound' ? 'text-purple-300' : 'text-white'
              }`}>声音</div>
            </button>
            <button
              onClick={() => updateSettings({ soundMode: 'vibrate' })}
              className={`p-4 rounded-2xl border-2 text-center transition ${
                settings.soundMode === 'vibrate'
                  ? 'bg-blue-500/15 border-blue-500 ring-2 ring-blue-500/40'
                  : 'bg-slate-900/40 border-slate-700 hover:border-slate-500'
              }`}
            >
              <div className="text-2xl mb-1">📳</div>
              <div className={`text-sm font-medium ${
                settings.soundMode === 'vibrate' ? 'text-blue-300' : 'text-white'
              }`}>震动</div>
            </button>
            <button
              onClick={() => updateSettings({ soundMode: 'mute' })}
              className={`p-4 rounded-2xl border-2 text-center transition ${
                settings.soundMode === 'mute'
                  ? 'bg-slate-500/20 border-slate-400 ring-2 ring-slate-400/40'
                  : 'bg-slate-900/40 border-slate-700 hover:border-slate-500'
              }`}
            >
              <div className="text-2xl mb-1">🔕</div>
              <div className={`text-sm font-medium ${
                settings.soundMode === 'mute' ? 'text-slate-300' : 'text-white'
              }`}>静音</div>
            </button>
          </div>
        </div>

        {/* 音量控制 */}
        {settings.soundMode === 'sound' && (
          <div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-700 mb-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-white">🎚️ 音量</span>
              <span className="text-sm text-purple-300 font-mono">{Math.round(settings.soundVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.1}
              value={settings.soundVolume}
              onChange={(e) => updateSettings({ soundVolume: Number(e.target.value) })}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
          </div>
        )}

        {/* 单个任务完成提示 */}
        <div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-700 mb-3">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex-1 min-w-0">
              <div className="font-medium text-white flex items-center gap-2">
                <span>单任务完成提示</span>
                {settings.soundMode !== 'mute' && settings.taskCompleteSound && (
                  <button
                    onClick={() => {
                      if (settings.soundMode === 'vibrate') {
                        testVibrate('task');
                      } else {
                        testSound('task', settings);
                      }
                    }}
                    className="text-xs px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-purple-300 transition"
                  >
                    🔊 试听
                  </button>
                )}
              </div>
              <div className="text-xs text-slate-400 mt-1">
                勾选完成单个任务时播放短促提示音
              </div>
            </div>
            <button
              onClick={() => updateSettings({ taskCompleteSound: !settings.taskCompleteSound })}
              className={`relative w-12 h-7 rounded-full transition shrink-0 ${
                settings.taskCompleteSound ? 'bg-purple-500' : 'bg-slate-600'
              }`}
            >
              <span
                className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-all ${
                  settings.taskCompleteSound ? 'left-5' : 'left-0.5'
                }`}
              />
            </button>
          </div>
        </div>

        {/* 全部完成提示 */}
        <div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-700">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex-1 min-w-0">
              <div className="font-medium text-white flex items-center gap-2">
                <span>全部完成庆祝音</span>
                {settings.soundMode !== 'mute' && settings.allCompleteSound && (
                  <button
                    onClick={() => {
                      if (settings.soundMode === 'vibrate') {
                        testVibrate('all');
                      } else {
                        testSound('all', settings);
                      }
                    }}
                    className="text-xs px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-purple-300 transition"
                  >
                    🔊 试听
                  </button>
                )}
              </div>
              <div className="text-xs text-slate-400 mt-1">
                完成当天所有任务时播放三音阶上升庆祝音
              </div>
            </div>
            <button
              onClick={() => updateSettings({ allCompleteSound: !settings.allCompleteSound })}
              className={`relative w-12 h-7 rounded-full transition shrink-0 ${
                settings.allCompleteSound ? 'bg-purple-500' : 'bg-slate-600'
              }`}
            >
              <span
                className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-all ${
                  settings.allCompleteSound ? 'left-5' : 'left-0.5'
                }`}
              />
            </button>
          </div>
        </div>

        {settings.soundMode === 'mute' && (
          <div className="mt-4 p-3 bg-slate-700/30 rounded-xl text-xs text-slate-400 text-center">
            🔕 当前为静音模式，完成任务时不会有任何提示
          </div>
        )}
      </section>

      {/* 关于 */}
      <section className="bg-gradient-to-br from-indigo-900/30 to-purple-900/20 rounded-3xl p-6 border border-indigo-500/20 mb-6">
        <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          💡 专注力软件说明
        </h3>
        <ul className="text-sm text-slate-300 space-y-2 leading-relaxed">
          <li>• <strong>每日计划</strong>：安排好一天的任务，点击"开始专注"后不可随意离开，<br />
          &nbsp;&nbsp;完成全部任务后即可结束当天挑战。</li>
          <li>• <strong>退出机制</strong>：想中途放弃有两条路——
          <br />&nbsp;&nbsp;① 写满 {settings.exitReasonMinLength} 字理由的正常退出；
          <br />&nbsp;&nbsp;② 一键紧急退出（当天会自动记为"雨天"）。</li>
          <li>• <strong>日历打卡</strong>：☀️ 晴天 = 全部完成，⛅ 阴天 = 部分完成，🌧️ 雨天 = 未完成。</li>
          <li>• <strong>短期挑战</strong>：7/14/30 天模式，坚持每天打卡就能点亮彩色拼图，<br />
          &nbsp;&nbsp;集齐完整拼图即是一次自律的胜利。</li>
          <li>• <strong>应用白名单</strong>：专注期间只有白名单里的应用（如电话、微信）能弹出通知，<br />
          &nbsp;&nbsp;其他软件全部静默，告别注意力被偷走。</li>
        </ul>
      </section>

      {/* 外观主题 */}
      <section className="bg-slate-800/50 rounded-3xl p-6 border border-slate-700 mb-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          🎨 外观主题
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => updateSettings({ theme: 'dark' })}
            className={`p-4 rounded-2xl border-2 text-center transition ${
              settings.theme === 'dark'
                ? 'bg-slate-700/50 border-slate-400 ring-2 ring-slate-400/40'
                : 'bg-slate-900/40 border-slate-700 hover:border-slate-500'
            }`}
          >
            <div className="text-2xl mb-1">☀️</div>
            <div className={`text-sm font-medium ${settings.theme === 'dark' ? 'text-slate-200' : 'text-white'}`}>
              明亮深色
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">默认主题</div>
          </button>
          <button
            onClick={() => updateSettings({ theme: 'night' })}
            className={`p-4 rounded-2xl border-2 text-center transition ${
              settings.theme === 'night'
                ? 'bg-blue-900/30 border-blue-500 ring-2 ring-blue-500/40'
                : 'bg-slate-900/40 border-slate-700 hover:border-slate-500'
            }`}
          >
            <div className="text-2xl mb-1">🌙</div>
            <div className={`text-sm font-medium ${settings.theme === 'night' ? 'text-blue-300' : 'text-white'}`}>
              夜间模式
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">更护眼的深色</div>
          </button>
        </div>
      </section>

      {/* 数据备份 */}
      <section className="bg-slate-800/50 rounded-3xl p-6 border border-slate-700 mb-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          ☁️ 数据备份
        </h3>
        <p className="text-xs text-slate-400 mb-5">
          所有数据存储在浏览器本地。建议定期导出备份，防止清除浏览器数据或更换设备时丢失。
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <button
            onClick={() => {
              downloadBackup();
            }}
            className="p-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 rounded-2xl text-white font-medium transition flex items-center justify-center gap-2"
          >
            📤 导出数据备份
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-4 bg-slate-700 hover:bg-slate-600 rounded-2xl text-white font-medium transition flex items-center justify-center gap-2"
          >
            📥 导入备份文件
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImport}
          className="hidden"
        />
        {importMsg && (
          <div className={`mt-3 p-3 rounded-xl text-sm text-center ${
            importMsg.startsWith('✅') ? 'bg-green-500/10 text-green-300' : 'bg-red-500/10 text-red-300'
          }`}>
            {importMsg}
          </div>
        )}
        <div className="mt-4 p-3 bg-slate-900/50 rounded-xl text-[10px] text-slate-500">
          💡 备份文件格式为 JSON，包含所有计划、日历记录、挑战进度和设置。导入会覆盖当前数据，请谨慎操作。
        </div>
      </section>
    </div>
  );
}
