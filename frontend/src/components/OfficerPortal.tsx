import React, { useState, useEffect } from 'react';
import { fetchReports, updateReportStatus, uploadFile } from '../api';
import type { Report } from '../types';
import {
  ShieldCheck,
  CheckCircle,
  Camera,
  RefreshCw,
  Eye,
  Edit,
  Search,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { Modal } from './ui/Modal';
import { Input } from './ui/Input';
import { Select } from './ui/Select';

interface OfficerPortalProps {
  onSelectTicket: (id: string) => void;
}

const OFFICER_NAME = 'Er. Rajesh K. Nair';
const OFFICER_ROLE = 'Assistant Engineer, LSGD Division IV (Kochi Central)';

export const OfficerPortal: React.FC<OfficerPortalProps> = ({ onSelectTicket }) => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedWard, setSelectedWard] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Active editing ticket
  const [activeReport, setActiveReport] = useState<Report | null>(null);
  const [newStatus, setNewStatus] = useState('IN_PROGRESS');
  const [assignedCrew, setAssignedCrew] = useState('');
  const [remarks, setRemarks] = useState('');
  const [resolutionPhotoUrl, setResolutionPhotoUrl] = useState('');
  const [updating, setUpdating] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  const loadReports = async () => {
    setLoading(true);
    try {
      const data = await fetchReports({
        ward_id: selectedWard || undefined,
        status: selectedStatus || undefined,
      });
      setReports(data);
    } catch (err) {
      console.error('Failed to load officer reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, [selectedWard, selectedStatus]);

  const handleOpenActionModal = (r: Report) => {
    setActiveReport(r);
    setNewStatus(r.status === 'REPORTED' ? 'INSPECTED' : r.status === 'INSPECTED' ? 'IN_PROGRESS' : 'RESOLVED');
    setAssignedCrew(r.assigned_crew || 'LSGD Quick Response Gang 3');
    setRemarks(r.official_remarks || '');
    setResolutionPhotoUrl(r.resolution_photo_url || '');
    setStatusMsg('');
  };

  const handleResolutionPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const res = await uploadFile(file);
      setResolutionPhotoUrl(res.url);
    } catch (err: any) {
      alert('Photo upload failed: ' + err.message);
    }
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeReport) return;

    setUpdating(true);
    setStatusMsg('');
    try {
      const updated = await updateReportStatus(activeReport.id, {
        status: newStatus,
        actor: OFFICER_NAME,
        actor_role: OFFICER_ROLE,
        remarks: remarks || `Action update logged by ${OFFICER_ROLE}.`,
        assigned_crew: assignedCrew,
        resolution_photo_url: resolutionPhotoUrl,
      });

      setStatusMsg(`Ticket ${updated.id} successfully updated to ${updated.status}.`);
      setActiveReport(null);
      loadReports();
    } catch (err: any) {
      setStatusMsg('Update error: ' + err.message);
    } finally {
      setUpdating(false);
    }
  };

  const filteredReports = reports.filter((r) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      r.id.toLowerCase().includes(term) ||
      r.ward_name.toLowerCase().includes(term) ||
      r.canal_basin.toLowerCase().includes(term) ||
      r.description.toLowerCase().includes(term) ||
      (r.landmark && r.landmark.toLowerCase().includes(term))
    );
  });

  const overdueCount = reports.filter(
    (r) => r.status !== 'RESOLVED' && new Date() > new Date(r.sla_deadline)
  ).length;
  const resolvedCount = reports.filter((r) => r.status === 'RESOLVED').length;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Officer Credential Ribbon */}
      <div className="rounded-xl border border-slate-800 bg-slate-950 text-white p-6 space-y-3 relative overflow-hidden shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 bg-sky-900/60 border border-sky-600/40 rounded-xl flex items-center justify-center text-sky-300 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase bg-sky-950 text-sky-300 border border-sky-800 px-2 py-0.5 rounded font-semibold">
                  Field Triage Console
                </span>
                <span className="text-xs font-mono text-slate-400">Auth: Assistant Engineer</span>
              </div>
              <h1 className="text-base md:text-lg font-bold tracking-tight text-white mt-1">
                Ward Engineering &amp; Quick-Response Triage Workstation
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="bg-slate-900/90 border border-slate-800 px-4 py-2 rounded-xl text-right">
              <span className="text-[10px] text-slate-400 block font-mono">Designated Engineer:</span>
              <strong className="text-white font-semibold">{OFFICER_NAME}</strong>
              <div className="text-xs text-slate-400">{OFFICER_ROLE}</div>
            </div>
          </div>
        </div>
      </div>

      {statusMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-3.5 rounded-xl flex items-center gap-2 font-medium animate-in fade-in">
          <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* Triage Queue Controls & Search Toolbar */}
      <Card className="p-4 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Status Queue Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: '', label: 'All Incidents', count: reports.length },
              { id: 'REPORTED', label: 'New / Unverified', count: reports.filter((r) => r.status === 'REPORTED').length },
              { id: 'IN_PROGRESS', label: 'Crews Deployed', count: reports.filter((r) => r.status === 'IN_PROGRESS').length },
              { id: 'ESCALATED', label: 'SLA Overdue', count: overdueCount, alert: true },
              { id: 'RESOLVED', label: 'Resolved & Restored', count: resolvedCount },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedStatus(tab.id)}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                  selectedStatus === tab.id
                    ? 'bg-slate-900 text-white shadow-xs font-semibold'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold ${
                    tab.alert && tab.count > 0
                      ? 'bg-rose-600 text-white'
                      : selectedStatus === tab.id
                      ? 'bg-slate-800 text-slate-200'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="secondary"
              size="sm"
              onClick={loadReports}
              icon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
            >
              Refresh
            </Button>
          </div>
        </div>

        {/* Secondary Filter & Search Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-2 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedWard}
              onChange={(e) => setSelectedWard(e.target.value)}
              className="min-h-[38px] px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-none focus:border-sky-600 cursor-pointer"
            >
              <option value="">All Municipal Wards</option>
              <option value="W48">Ward 48 - Kadavanthra (T-P Canal)</option>
              <option value="W58">Ward 58 - Thevara (Thevara Canal)</option>
              <option value="W42">Ward 42 - Vyttila (Chilavannoor)</option>
              <option value="W44">Ward 44 - Elamakkulam (T-P Siphon)</option>
              <option value="W35">Ward 35 - Kaloor North (Perandoor)</option>
              <option value="W36">Ward 36 - Kaloor South (Perandoor)</option>
              <option value="W33">Ward 33 - Palarivattom (Changadampokku)</option>
              <option value="W28">Ward 28 - Edappally (Edappally Canal)</option>
              <option value="W66">Ward 66 - Ernakulam South (Mullassery)</option>
              <option value="W67">Ward 67 - Marine Drive (Market Canal)</option>
              <option value="W60">Ward 60 - Fort Kochi (Calvathy)</option>
              <option value="W62">Ward 62 - Mattancherry (Rameswaram)</option>
            </select>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search ID, basin, street..."
              className="w-full min-h-[38px] pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-600"
            />
          </div>
        </div>
      </Card>

      {/* Triage Queue Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4">Ticket</th>
                <th className="py-3 px-4">Ward &amp; Basin</th>
                <th className="py-3 px-4">Obstruction</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">SLA Countdown</th>
                <th className="py-3 px-4">Field Squad</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 px-4 text-center text-slate-500">
                    No grievance records match the current filter.
                  </td>
                </tr>
              ) : (
                filteredReports.map((r) => {
                  const isOverdue = new Date() > new Date(r.sla_deadline) && r.status !== 'RESOLVED';

                  return (
                    <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono font-semibold text-slate-900 whitespace-nowrap">
                        {r.id}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">Ward {r.ward_number}</div>
                        <div className="text-[11px] text-slate-500 truncate max-w-xs">{r.canal_basin}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-800">{r.blockage_type.replace(/_/g, ' ')}</div>
                        <span
                          className={`text-[10px] font-bold ${
                            r.severity === 'CRITICAL' ? 'text-rose-600' : 'text-slate-500'
                          }`}
                        >
                          {r.severity}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <Badge
                          variant={
                            r.status.startsWith('ESCALATED')
                              ? 'escalated'
                              : r.status === 'IN_PROGRESS'
                              ? 'in_progress'
                              : r.status === 'RESOLVED'
                              ? 'resolved'
                              : 'reported'
                          }
                          dot
                        >
                          {r.status.replace(/_/g, ' ')}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap font-mono text-xs">
                        {r.status === 'RESOLVED' ? (
                          <span className="text-emerald-700 font-medium">De-silted</span>
                        ) : (
                          <span className={isOverdue ? 'text-rose-600 font-bold' : 'text-slate-600'}>
                            <Clock className="w-3 h-3 inline mr-1" />
                            {isOverdue ? 'BREACHED' : `${r.sla_duration_hours}h`}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-600 truncate max-w-xs">
                        {r.assigned_crew || 'Unassigned'}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap space-x-1.5">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => onSelectTicket(r.id)}
                          className="py-1 px-2.5 text-xs"
                        >
                          <Eye className="w-3.5 h-3.5 mr-1" />
                          <span>View</span>
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleOpenActionModal(r)}
                          className="py-1 px-2.5 text-xs"
                        >
                          <Edit className="w-3.5 h-3.5 mr-1" />
                          <span>Dispatch</span>
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Action / Dispatch Modal */}
      {activeReport && (
        <Modal
          isOpen={Boolean(activeReport)}
          onClose={() => setActiveReport(null)}
          title={`Action Triage & Dispatch (Ticket ${activeReport.id})`}
          description="Update field progress, assign mechanical excavation crew, or verify flow restoration."
        >
          <div className="space-y-4">
            {/* Overview Box */}
            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-500 block text-[10px]">Location:</span>
                <span className="font-semibold text-slate-900">
                  Ward {activeReport.ward_number} ({activeReport.ward_name})
                </span>
                <div className="text-slate-600 text-[11px] truncate">{activeReport.landmark}</div>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Blockage Type:</span>
                <span className="font-semibold text-slate-900">
                  {activeReport.blockage_type.replace(/_/g, ' ')}
                </span>
                <div className="text-rose-700 font-bold text-[10px]">
                  Severity: {activeReport.severity} ({activeReport.sla_duration_hours}h SLA)
                </div>
              </div>
            </div>

            <form onSubmit={handleUpdateStatus} className="space-y-4 text-xs">
              <Select
                label="Update Redressal Status:"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
              >
                <option value="INSPECTED">INSPECTED - Site verification completed by Overseer</option>
                <option value="IN_PROGRESS">IN PROGRESS - Cleaning crew / earthmover deployed on site</option>
                <option value="RESOLVED">RESOLVED - Canal de-silted &amp; water velocity restored</option>
              </Select>

              <Input
                label="Assign Maintenance Squad / De-silting Gang:"
                value={assignedCrew}
                onChange={(e) => setAssignedCrew(e.target.value)}
                placeholder="e.g. LSGD Central Desilting Gang 4 (Supervisor: P. Sivan)"
              />

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Official Action Remarks:
                </label>
                <textarea
                  rows={3}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="e.g. Mechanical excavator dispatched. 150m culvert cleaned of plastic waste. Silt hauled to designated disposal yard."
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-600 resize-none"
                  required
                />
              </div>

              {/* Resolution Photo Upload */}
              <div className="border border-slate-200 p-3.5 rounded-xl bg-slate-50 space-y-2">
                <span className="font-semibold text-slate-800 block text-xs">
                  Upload Completion / De-silting Proof Photo:
                </span>
                <div className="flex items-center gap-3">
                  <label className="btn-secondary text-xs flex items-center gap-1.5 cursor-pointer">
                    <Camera className="w-3.5 h-3.5" />
                    <span>Attach Photo Proof</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleResolutionPhotoUpload}
                      className="hidden"
                    />
                  </label>
                  {resolutionPhotoUrl ? (
                    <span className="text-emerald-700 text-xs font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Resolution proof attached</span>
                    </span>
                  ) : (
                    <span className="text-slate-400 text-xs">Optional or attach upon resolution</span>
                  )}
                </div>
                {!resolutionPhotoUrl && (
                  <button
                    type="button"
                    onClick={() =>
                      setResolutionPhotoUrl(
                        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80'
                      )
                    }
                    className="text-xs text-sky-700 hover:underline cursor-pointer"
                  >
                    Load Sample Cleared Drain Photo (Reviewer demo)
                  </button>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setActiveReport(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  loading={updating}
                >
                  Save Official Action
                </Button>
              </div>
            </form>
          </div>
        </Modal>
      )}
    </div>
  );
};
