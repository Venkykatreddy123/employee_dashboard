import React, { useState } from 'react';
import { User, Bell, Shield, Smile, Trophy, Star, Zap, Target, Award } from 'lucide-react';
import { cn } from '../lib/utils';
import useAuthStore from '../store/authStore';

const moods = [
  { emoji: '😄', label: 'Great', value: 5 },
  { emoji: '🙂', label: 'Good', value: 4 },
  { emoji: '😐', label: 'Neutral', value: 3 },
  { emoji: '😔', label: 'Low', value: 2 },
  { emoji: '😩', label: 'Tough', value: 1 },
];

const badges = [
  { icon: Trophy, label: 'Top Performer', desc: 'Ranked #1 this quarter', color: 'text-amber-400', earned: true },
  { icon: Zap, label: 'Sprint Champion', desc: 'Closed 10 tasks in a sprint', color: 'text-blue-400', earned: true },
  { icon: Target, label: 'Deadline Master', desc: '100% on-time delivery', color: 'text-green-400', earned: true },
  { icon: Star, label: 'Rising Star', desc: 'Highest growth in Q1', color: 'text-purple-400', earned: false },
  { icon: Award, label: 'Team Player', desc: 'Collaborate on 5+ projects', color: 'text-pink-400', earned: false },
];

const leaderboard = [
  { rank: 1, name: 'Sarah Miller', dept: 'Design', pts: 2840, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah' },
  { rank: 2, name: 'Michael Chen', dept: 'Engineering', pts: 2705, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael' },
  { rank: 3, name: 'John Doe', dept: 'Engineering', pts: 2640, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John' },
  { rank: 4, name: 'Emily Ross', dept: 'Marketing', pts: 2300, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily' },
];

const rankColors = { 1: 'text-amber-400', 2: 'text-slate-400', 3: 'text-amber-700' };

const SettingsPage = () => {
  const { user } = useAuthStore();
  const [selectedMood, setSelectedMood] = useState(null);
  const [moodSubmitted, setMoodSubmitted] = useState(false);
  const [tab, setTab] = useState('profile');

  const handleMoodSubmit = () => {
    if (selectedMood) setMoodSubmitted(true);
  };

  return (
    <div className="space-y-8 pb-10">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Settings & Profile</h1>
        <p className="text-gray-400 mt-1">Manage preferences, badges, and workplace wellbeing.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[#0f0f0f] border border-[#222] p-1 rounded-xl w-fit">
        {[
          { id: 'profile', label: 'Profile', icon: User },
          { id: 'mood', label: 'Mood Tracker', icon: Smile },
          { id: 'badges', label: 'Badges & Ranks', icon: Trophy },
          { id: 'notifications', label: 'Notifications', icon: Bell },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all",
              tab === id ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-gray-400 hover:text-white'
            )}
          >
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {tab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 bg-[#0f0f0f] border border-[#222] rounded-3xl p-6 flex flex-col items-center text-center gap-4">
            <div className="relative">
              <img src={user?.avatar} className="w-24 h-24 rounded-3xl ring-4 ring-blue-600/30" alt="Avatar" />
              <button className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-lg text-xs font-bold border-2 border-[#0f0f0f]">✎</button>
            </div>
            <div>
              <h3 className="text-xl font-bold">{user?.name}</h3>
              <p className="text-sm text-gray-500 mt-1 capitalize">{user?.role} · {user?.department}</p>
              <p className="text-xs text-gray-600 mt-1">{user?.email}</p>
            </div>
            <div className="w-full pt-4 border-t border-[#222] space-y-2 text-left text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Employee ID</span><span className="font-mono font-bold">{user?.id}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Status</span><span className="text-green-500 font-semibold">Active</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Joined</span><span className="text-gray-300">Jan 10, 2024</span></div>
            </div>
          </div>

          <div className="lg:col-span-2 bg-[#0f0f0f] border border-[#222] rounded-3xl p-6 space-y-5">
            <h3 className="text-lg font-bold">Edit Information</h3>
            {[
              { label: 'Full Name', val: user?.name, type: 'text' },
              { label: 'Email Address', val: user?.email, type: 'email' },
              { label: 'Department', val: user?.department, type: 'text' },
              { label: 'Position', val: 'Senior Developer', type: 'text' },
              { label: 'Phone Number', val: '+1 (555) 678-9012', type: 'tel' },
            ].map(f => (
              <div key={f.label}>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">{f.label}</label>
                <input
                  type={f.type}
                  defaultValue={f.val}
                  className="w-full px-4 py-2.5 bg-[#161616] border border-[#222] rounded-xl text-sm text-white outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                />
              </div>
            ))}
            <button className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-500/20 active:scale-[0.98]">
              Save Changes
            </button>
          </div>
        </div>
      )}

      {/* Mood Tracker */}
      {tab === 'mood' && (
        <div className="max-w-2xl space-y-6">
          <div className="bg-[#0f0f0f] border border-[#222] rounded-3xl p-8">
            <h3 className="text-xl font-bold mb-2">How are you feeling today?</h3>
            <p className="text-sm text-gray-500 mb-8">Your response is anonymous and helps us improve workplace wellbeing.</p>

            {!moodSubmitted ? (
              <>
                <div className="flex gap-4 justify-center mb-8 flex-wrap">
                  {moods.map(mood => (
                    <button
                      key={mood.value}
                      onClick={() => setSelectedMood(mood.value)}
                      className={cn(
                        "flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all hover:scale-105",
                        selectedMood === mood.value
                          ? 'border-blue-500 bg-blue-500/10 scale-110 shadow-lg shadow-blue-500/20'
                          : 'border-[#222] bg-[#161616] hover:border-[#333]'
                      )}
                    >
                      <span className="text-4xl">{mood.emoji}</span>
                      <span className="text-xs font-semibold text-gray-400">{mood.label}</span>
                    </button>
                  ))}
                </div>
                <button
                  onClick={handleMoodSubmit}
                  disabled={!selectedMood}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-500/20"
                >
                  Submit Check-in
                </button>
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-5xl mb-4">{moods.find(m => m.value === selectedMood)?.emoji}</p>
                <h4 className="text-xl font-bold text-green-400 mb-2">Thanks for checking in! ✓</h4>
                <p className="text-sm text-gray-500">Your mood has been recorded anonymously.</p>
                <button onClick={() => { setMoodSubmitted(false); setSelectedMood(null); }} className="mt-6 text-blue-500 text-sm hover:underline">Check in again</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Badges & Leaderboard */}
      {tab === 'badges' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-[#0f0f0f] border border-[#222] rounded-3xl p-6">
            <h3 className="text-lg font-bold mb-6">Your Badges</h3>
            <div className="space-y-4">
              {badges.map((b, i) => (
                <div key={i} className={cn("flex items-center gap-4 p-4 rounded-2xl border transition-all", b.earned ? 'border-[#333] bg-[#161616]' : 'border-[#1a1a1a] opacity-40')}>
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center bg-[#0f0f0f] flex-shrink-0", b.earned ? '' : 'grayscale')}>
                    <b.icon className={cn("w-5 h-5", b.color)} />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{b.label}</p>
                    <p className="text-xs text-gray-500">{b.desc}</p>
                  </div>
                  {b.earned ? (
                    <span className="text-[10px] font-bold text-green-500 bg-green-500/10 px-2 py-1 rounded-full">Earned</span>
                  ) : (
                    <span className="text-[10px] font-bold text-gray-600 bg-[#1a1a1a] px-2 py-1 rounded-full">Locked</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#0f0f0f] border border-[#222] rounded-3xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold">Leaderboard</h3>
              <span className="text-xs text-gray-500">This Quarter</span>
            </div>
            <div className="space-y-3">
              {leaderboard.map(emp => (
                <div key={emp.rank} className={cn(
                  "flex items-center gap-4 p-4 rounded-2xl border transition-all",
                  emp.name === 'John Doe' ? 'border-blue-500/30 bg-blue-500/5' : 'border-[#222] bg-[#161616]'
                )}>
                  <span className={cn("text-lg font-black w-6 text-center", rankColors[emp.rank] || 'text-gray-500')}>
                    {emp.rank <= 3 ? ['🥇','🥈','🥉'][emp.rank - 1] : emp.rank}
                  </span>
                  <img src={emp.avatar} className="w-9 h-9 rounded-xl" alt="" />
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{emp.name}</p>
                    <p className="text-xs text-gray-500">{emp.dept}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm text-white">{emp.pts.toLocaleString()}</p>
                    <p className="text-[10px] text-gray-500">pts</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Notifications */}
      {tab === 'notifications' && (
        <div className="max-w-2xl bg-[#0f0f0f] border border-[#222] rounded-3xl p-6 space-y-6">
          <h3 className="text-lg font-bold">Notification Preferences</h3>
          {[
            { label: 'Task Assignments', desc: 'When a new task is assigned to you', defaultChecked: true },
            { label: 'Project Updates', desc: 'Status changes on your active projects', defaultChecked: true },
            { label: 'Meeting Reminders', desc: '15 minutes before a scheduled meeting', defaultChecked: true },
            { label: 'Company Announcements', desc: 'Broadcasts from HR and leadership', defaultChecked: false },
            { label: 'Overtime Alerts', desc: 'When you exceed standard working hours', defaultChecked: false },
            { label: 'Deadline Warnings', desc: '24 hours before task/project is due', defaultChecked: true },
          ].map((n, i) => (
            <div key={i} className="flex items-start justify-between gap-4 py-4 border-b border-[#222] last:border-0">
              <div>
                <p className="text-sm font-semibold">{n.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{n.desc}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer flex-shrink-0 mt-0.5">
                <input type="checkbox" defaultChecked={n.defaultChecked} className="sr-only peer" />
                <div className="w-10 h-5 bg-[#222] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-5 peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
              </label>
            </div>
          ))}
          <button className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-500/20">
            Save Preferences
          </button>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
