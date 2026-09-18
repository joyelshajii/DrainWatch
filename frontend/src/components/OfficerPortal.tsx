import React, { useState, useEffect } from 'react';
import { fetchReports, updateReportStatus, uploadFile } from '../api';
import type { Report } from '../types';
import {
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
import { Badge, HazardTag } from './ui/Badge';
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
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Institutional Officer Header */}
      <div className="border-b border-slate-200 pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-500">
              LSGD KERALA &bull; DIVISION IV (KOCHI CENTRAL)
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-slate-100 text-slate-700 border border-slate-200">
              RESTRICTED ACCESS
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
            Ward Engineering &amp; Quick-Response Triage Workstation
          </h1>
          <p className="text-sm text-slate-600 mt-0.5">
            Review unverified citizen drain blockages, dispatch de-silting maintenance crews, and verify flow restoration proofs.
          </p>
        </div>

        {/* Designated Officer Badge */}
        <div className="bg-slate-50 border border-slate-200/80 px-3.5 py-2.5 rounded-lg text-left md:text-right shrink-0">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Designated Field Engineer</span>
          <div className="text-xs font-semibold text-slate-900">{OFFICER_NAME}</div>
          <div className="text-[11px] text-slate-500">{OFFICER_ROLE}</div>
        </div>
      </div>

      {statusMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs p-3.5 rounded-lg flex items-center gap-2 font-medium">
          <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* Triage Queue Controls & Search Toolbar */}
      <Card className="p-3.5 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Status Queue Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: '', label: 'All Incidents', count: reports.length },
              { id: 'REPORTED', label: 'New / Unverified', count: reports.filter((r) => r.status === 'REPORTED').length },
              { id: 'IN_PROGRESS', label: 'Crews Deployed', count: reports.filter((r) => r.status === 'IN_PROGRESS').length },
              { id: 'ESCALATED', label: 'SLA Overdue', count: overdueCount, alert: true },
              { id: 'RESOLVED', label: 'Resolved & Restored', count: resolvedCount },
            ].map((tab) => {
              const isActive = selectedStatus === tab.id;
              const hasAlert = tab.alert && tab.count > 0;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectedStatus(tab.id)}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-slate-900 text-white font-medium shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-semibold ${
                      hasAlert
                        ? 'bg-rose-600 text-white'
                        : isActive
                        ? 'bg-slate-800 text-slate-200'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-2.5 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedWard}
              onChange={(e) => setSelectedWard(e.target.value)}
              className="h-9 px-3 py-1 text-xs rounded-lg border border-slate-200 bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 cursor-pointer"
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
              className="w-full h-9 pl-8 pr-3 py-1 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 placeholder:text-slate-400"
            />
          </div>
        </div>
      </Card>

      {/* Triage Queue Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 font-semibold text-[11px] uppercase tracking-wider font-mono">
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
                    <tr key={r.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-mono font-semibold text-slate-900">{r.id}</div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {new Date(r.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">Ward {r.ward_number} - {r.ward_name}</div>
                        <div className="text-[11px] text-slate-500 truncate max-w-xs">{r.canal_basin}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-800">{r.blockage_type.replace(/_/g, ' ')}</div>
                        <div className="mt-0.5">
                          <HazardTag severity={r.severity} />
                        </div>
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
                              : r.status === 'INSPECTED'
                              ? 'inspected'
                              : 'reported'
                          }
                          dot
                        >
                          {r.status.replace(/_/g, ' ')}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap font-mono text-xs">
                        {r.status === 'RESOLVED' ? (
                          <span className="text-emerald-700 font-medium flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> De-silted
                          </span>
                        ) : (
                          <span className={`flex items-center gap-1 font-medium ${isOverdue ? 'text-rose-700 font-semibold' : 'text-slate-600'}`}>
                            <Clock className="w-3.5 h-3.5" />
                            {isOverdue ? 'BREACHED' : `${r.sla_duration_hours}h remaining`}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-600 truncate max-w-xs">
                        {r.assigned_crew ? (
                          <span className="font-medium text-slate-800">{r.assigned_crew}</span>
                        ) : (
                          <span className="text-slate-400 italic">Unassigned</span>
                        )}
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
            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-lg border border-slate-200">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-mono tracking-wider">Location</span>
                <span className="font-semibold text-slate-900">
                  Ward {activeReport.ward_number} ({activeReport.ward_name})
                </span>
                <div className="text-slate-600 text-[11px] truncate mt-0.5">{activeReport.landmark}</div>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-mono tracking-wider">Blockage Type</span>
                <span className="font-semibold text-slate-900">
                  {activeReport.blockage_type.replace(/_/g, ' ')}
                </span>
                <div className="mt-1">
                  <HazardTag severity={activeReport.severity} />
                  <span className="text-slate-500 font-mono text-[11px] ml-2">({activeReport.sla_duration_hours}h SLA)</span>
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
                  className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 resize-none"
                  required
                />
              </div>

              {/* Resolution Photo Upload */}
              <div className="border border-slate-200 p-3.5 rounded-lg bg-slate-50 space-y-2">
                <span className="font-semibold text-slate-800 block text-xs">
                  Upload Completion / De-silting Proof Photo:
                </span>
                <div className="flex items-center gap-3">
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 bg-white text-slate-800 hover:bg-slate-50 transition-colors cursor-pointer">
                    <Camera className="w-3.5 h-3.5 text-slate-500" />
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
                    className="text-xs text-slate-600 hover:text-slate-900 underline cursor-pointer"
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
