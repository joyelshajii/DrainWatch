import React, { useState, useEffect } from 'react';
import { fetchLeaderboard, fetchStats } from '../api';
import type { UserLeaderboardItem, Stats } from '../types';
import { Award, Trophy, FileText, CheckCircle2, Users, Sparkles, ShieldCheck } from 'lucide-react';
import { Card, KpiTile } from './ui/Card';
import { Badge } from './ui/Badge';

export const Leaderboard: React.FC = () => {
  const [users, setUsers] = useState<UserLeaderboardItem[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    Promise.all([fetchLeaderboard(), fetchStats()])
      .then(([userData, statsData]) => {
        setUsers(userData);
        setStats(statsData);
      })
      .catch((err) => console.error('Error loading leaderboard:', err));
  }, []);

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200/80 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-500">
              Civic Action &bull; Kochi Water Wardens
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 font-sans">
            Citizen Action Leaderboard
          </h1>
          <p className="text-sm sm:text-base text-slate-600 mt-1">
            Recognizing residents proactively reporting choke points to prevent urban flooding.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-semibold text-slate-800 shadow-xs">
            <Award className="w-4 h-4 text-amber-500" />
            <span>+10 Pts per Verified Report</span>
          </span>
        </div>
      </div>

      {/* Overview Stat Cards using KpiTile */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <KpiTile
          label="Total Civic Grievances"
          value={stats?.total_reports || 0}
          subtext="reports"
          secondaryText="Logged across 12 municipal wards"
          icon={<FileText className="w-4 h-4" />}
          accent="neutral"
        />
        <KpiTile
          label="Canal Obstructions Cleared"
          value={stats?.resolved || 0}
          subtext="cleared"
          secondaryText="Verified before-after proofs"
          icon={<CheckCircle2 className="w-4 h-4" />}
          accent="resolved"
        />
        <KpiTile
          label="Active Ward Wardens"
          value={users.length}
          subtext="citizens"
          secondaryText="Active contributors"
          icon={<Users className="w-4 h-4" />}
          accent="neutral"
        />
      </div>

      {/* Top 3 Champions Podium Cards */}
      {users.length >= 3 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          {/* Rank 2 (Silver) */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs text-center order-2 md:order-1 relative overflow-hidden">
            <div className="w-12 h-12 rounded-full bg-slate-100 border-2 border-slate-300 text-slate-700 flex items-center justify-center font-bold text-base mx-auto mb-2 font-mono">
              🥈 2
            </div>
            <div className="font-bold text-slate-900 text-base">{users[1].name}</div>
            <div className="text-xs text-slate-500 font-mono mt-0.5">{users[1].reports_count} Choke Points Identified</div>
            <div className="mt-3 flex items-center justify-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 border border-slate-200">
                {users[1].badge}
              </span>
              <span className="font-mono font-bold text-sm text-slate-900">
                {users[1].points} Pts
              </span>
            </div>
          </div>

          {/* Rank 1 (Gold - Champion) */}
          <div className="bg-gradient-to-b from-amber-50/50 to-white border-2 border-amber-300 rounded-2xl p-6 shadow-sm text-center order-1 md:order-2 relative overflow-hidden">
            <div className="absolute top-2 right-2">
              <span className="bg-amber-100 text-amber-900 text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border border-amber-300">
                Champion
              </span>
            </div>
            <div className="w-16 h-16 rounded-full bg-amber-100 border-2 border-amber-400 text-amber-900 flex items-center justify-center font-bold text-2xl mx-auto mb-3 shadow-xs">
              👑
            </div>
            <div className="font-bold text-slate-950 text-lg">{users[0].name}</div>
            <div className="text-xs text-amber-900 font-mono mt-0.5">{users[0].reports_count} Choke Points Identified</div>
            <div className="mt-3 flex items-center justify-center gap-2">
              <span className="text-xs font-semibold px-3 py-1 rounded-lg bg-amber-100 text-amber-900 border border-amber-300">
                {users[0].badge}
              </span>
              <span className="font-mono font-bold text-base text-amber-950">
                {users[0].points} Pts
              </span>
            </div>
          </div>

          {/* Rank 3 (Bronze) */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs text-center order-3 md:order-3 relative overflow-hidden">
            <div className="w-12 h-12 rounded-full bg-amber-50 border-2 border-amber-200 text-amber-800 flex items-center justify-center font-bold text-base mx-auto mb-2 font-mono">
              🥉 3
            </div>
            <div className="font-bold text-slate-900 text-base">{users[2].name}</div>
            <div className="text-xs text-slate-500 font-mono mt-0.5">{users[2].reports_count} Choke Points Identified</div>
            <div className="mt-3 flex items-center justify-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 border border-slate-200">
                {users[2].badge}
              </span>
              <span className="font-mono font-bold text-sm text-slate-900">
                {users[2].points} Pts
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard Table */}
      <Card className="overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-600" />
            <h2 className="text-xs font-bold uppercase tracking-wider font-mono text-slate-700">
              Kochi Water Warden Honor Roll
            </h2>
          </div>
          <span className="text-[11px] font-mono text-slate-400">Updated Real-Time</span>
        </div>

        <div className="divide-y divide-slate-100">
          {users.map((user, idx) => (
            <div
              key={idx}
              className="px-5 py-3.5 flex items-center justify-between gap-3 hover:bg-slate-50/60 transition-colors"
            >
              <div className="flex items-center gap-3.5">
                <div
                  className={`w-7 h-7 rounded-md flex items-center justify-center font-bold text-xs font-mono shrink-0 ${
                    idx === 0
                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                      : idx === 1
                      ? 'bg-slate-200 text-slate-800'
                      : idx === 2
                      ? 'bg-amber-50 text-amber-800 border border-amber-200'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  #{idx + 1}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-900 font-semibold">{user.name}</span>
                    <Badge variant="neutral" className="text-[10px]">
                      {user.badge}
                    </Badge>
                  </div>
                  <span className="text-xs text-slate-500 font-mono">
                    {user.reports_count} Choke Points Identified
                  </span>
                </div>
              </div>

              <div className="text-right">
                <div className="font-mono font-bold text-sm text-slate-900">{user.points} Pts</div>
                <span className="text-[10px] text-emerald-700 font-medium font-mono uppercase tracking-wider">
                  Impact Verified
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Recognition & Points Guide */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 space-y-3">
        <div className="flex items-center gap-2 text-slate-900 font-semibold text-xs uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-amber-600" />
          <span>How Citizens Earn Recognition &amp; Municipal Honors</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="bg-white border border-slate-200 p-3.5 rounded-xl space-y-1">
            <span className="font-semibold text-slate-900 block flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>+10 Pts: Verified Report</span>
            </span>
            <p className="text-slate-600 text-[11px] leading-snug">
              Pinpoint an active canal or culvert obstruction with photographic proof verified by AI.
            </p>
          </div>
          <div className="bg-white border border-slate-200 p-3.5 rounded-xl space-y-1">
            <span className="font-semibold text-slate-900 block flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>+10 Pts: Resolution Audit</span>
            </span>
            <p className="text-slate-600 text-[11px] leading-snug">
              Confirm de-silting completion on site after municipal squads clear blocked culverts.
            </p>
          </div>
          <div className="bg-white border border-slate-200 p-3.5 rounded-xl space-y-1">
            <span className="font-semibold text-slate-900 block flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-amber-600" />
              <span>Annual Corporation Medal</span>
            </span>
            <p className="text-slate-600 text-[11px] leading-snug">
              Top 10 seasonal wardens receive official commendation from the Mayor of Kochi Municipal Corporation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
