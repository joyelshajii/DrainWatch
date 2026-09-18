import React, { useState, useEffect } from 'react';
import { fetchLeaderboard, fetchStats } from '../api';
import type { UserLeaderboardItem, Stats } from '../types';
import { Award, Trophy, FileText, CheckCircle2, Users } from 'lucide-react';
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
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-500">
              CIVIC ACTION &bull; KOCHI WATER WARDENS
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
            Citizen Action Leaderboard &amp; Desilting Champions
          </h1>
          <p className="text-sm text-slate-600 mt-0.5">
            Recognizing Kochi residents and associations proactively reporting canal micro-chokes to prevent urban monsoon flooding.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-800">
            <Award className="w-4 h-4 text-amber-600" />
            <span>+10 Pts per Verified Report</span>
          </span>
        </div>
      </div>

      {/* Overview Stat Cards using KpiTile */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
    </div>
  );
};
