import React, { useState, useEffect } from 'react';
import { fetchLeaderboard, fetchStats } from '../api';
import type { UserLeaderboardItem, Stats } from '../types';
import { Award, Trophy, Users, CheckCircle2, FileText } from 'lucide-react';
import { Card, CardHeader, CardBody } from './ui/Card';
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
            <span className="text-[10px] font-bold tracking-widest uppercase bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded font-mono">
              Civic Impact &bull; Water Warden Grid
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-950 tracking-tight mt-1">
            Citizen Action Leaderboard &amp; Desilting Champions
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Recognizing Kochi residents and associations proactively reporting canal micro-chokes to prevent urban monsoon flooding.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Badge variant="high" className="font-semibold text-xs py-1 px-3">
            <Award className="w-4 h-4 text-amber-600 mr-1" />
            <span>+10 Pts per Verified Report</span>
          </Badge>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <Card className="p-4 bg-white border-slate-200">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Total Civic Grievances</span>
            <FileText className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-950">{stats?.total_reports || 0}</div>
          <div className="text-[11px] text-slate-500 mt-1">Logged across 12 municipal wards</div>
        </Card>

        <Card className="p-4 bg-emerald-50/40 border-emerald-200/80">
          <div className="flex items-center justify-between text-emerald-900 text-xs font-semibold uppercase tracking-wider">
            <span>Canal Obstructions Cleared</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-800">{stats?.resolved || 0}</div>
          <div className="text-[11px] text-emerald-700 font-medium mt-1">Verified before-after proofs</div>
        </Card>

        <Card className="p-4 bg-sky-50/40 border-sky-200/80">
          <div className="flex items-center justify-between text-sky-900 text-xs font-semibold uppercase tracking-wider">
            <span>Active Ward Wardens</span>
            <Users className="w-4 h-4 text-sky-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-sky-800">{users.length}</div>
          <div className="text-[11px] text-slate-500 mt-1">Citizen contributors</div>
        </Card>
      </div>

      {/* Leaderboard Table */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-slate-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold tracking-tight">Kochi Water Warden Honor Roll</h3>
          </div>
          <span className="text-xs font-mono text-slate-400">Updated Real-Time</span>
        </CardHeader>

        <CardBody className="p-0 divide-y divide-slate-100">
          {users.map((user, idx) => (
            <div
              key={idx}
              className={`p-4 flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors ${
                idx === 0 ? 'bg-amber-50/30' : ''
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs font-mono shrink-0 ${
                    idx === 0
                      ? 'bg-amber-500 text-white shadow-xs'
                      : idx === 1
                      ? 'bg-slate-300 text-slate-800'
                      : idx === 2
                      ? 'bg-amber-700/70 text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {idx + 1}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <strong className="text-sm text-slate-900 font-semibold">{user.name}</strong>
                    <Badge variant="default" className="text-[10px]">
                      {user.badge}
                    </Badge>
                  </div>
                  <span className="text-xs text-slate-500 font-mono">
                    {user.reports_count} Choke Points Identified
                  </span>
                </div>
              </div>

              <div className="text-right">
                <div className="font-mono font-bold text-base text-slate-950">{user.points} Pts</div>
                <span className="text-[10px] text-emerald-600 font-semibold uppercase">Impact Verified</span>
              </div>
            </div>
          ))}
        </CardBody>
      </Card>
    </div>
  );
};
