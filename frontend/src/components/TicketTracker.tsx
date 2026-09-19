import React, { useState, useEffect } from 'react';
import { fetchReportById, escalateReport } from '../api';
import type { Report } from '../types';
import {
  Search,
  Clock,
  CheckCircle2,
  ShieldAlert,
  Building2,
  MapPin,
  Printer,
  Layers,
  Sparkles,
  AlertCircle,
  Copy,
  Check,
} from 'lucide-react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { Modal } from './ui/Modal';

interface TicketTrackerProps {
  initialTicketId?: string;
  onSelectTicket?: (id: string) => void;
}

const SAMPLE_TICKETS = [
  { id: 'KL-KCH-W48-2026-0101', label: 'W48 Kadavanthra', status: 'IN_PROGRESS' },
  { id: 'KL-KCH-W66-2026-0102', label: 'W66 Ernakulam South', status: 'ESCALATED' },
  { id: 'KL-KCH-W33-2026-0103', label: 'W33 Palarivattom', status: 'RESOLVED' },
  { id: 'KL-KCH-W60-2026-0104', label: 'W60 Fort Kochi', status: 'REPORTED' },
];

export const TicketTracker: React.FC<TicketTrackerProps> = ({ initialTicketId }) => {
  const [ticketIdInput, setTicketIdInput] = useState(initialTicketId || 'KL-KCH-W66-2026-0102');
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [copied, setCopied] = useState(false);

  // Escalation Modal
  const [showEscalateModal, setShowEscalateModal] = useState(false);
  const [escalateReason, setEscalateReason] = useState('');
  const [escalating, setEscalating] = useState(false);
  const [escalationSuccess, setEscalationSuccess] = useState('');

  const loadTicket = async (id: string) => {
    if (!id.trim()) return;
    setLoading(true);
    setErrorMsg('');
    setEscalationSuccess('');
    try {
      const data = await fetchReportById(id.trim());
      setReport(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Grievance ticket not found');
      setReport(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialTicketId) {
      setTicketIdInput(initialTicketId);
      loadTicket(initialTicketId);
    } else {
      loadTicket('KL-KCH-W66-2026-0102');
    }
  }, [initialTicketId]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadTicket(ticketIdInput);
  };

  const handleEscalateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!report) return;

    setEscalating(true);
    try {
      const updated = await escalateReport(report.id, {
        reason:
          escalateReason ||
          'Citizen statutory appeal: Canal stagnation continues to threaten adjacent dwellings without on-site resolution.',
        actor: 'Citizen Grievance Appeal',
        actor_role: 'Public Appellant',
      });
      setReport(updated);
      setEscalationSuccess(`Ticket escalated to Administrative Level ${updated.escalation_level}!`);
      setShowEscalateModal(false);
      setEscalateReason('');
    } catch (err: any) {
      setErrorMsg('Failed to escalate ticket: ' + err.message);
    } finally {
      setEscalating(false);
    }
  };

  const copyId = () => {
    if (!report) return;
    navigator.clipboard.writeText(report.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getSLAProgress = (r: Report) => {
    const created = new Date(r.created_at).getTime();
    const deadline = new Date(r.sla_deadline).getTime();
    const now = new Date().getTime();
    const totalDuration = deadline - created;

    if (r.status === 'RESOLVED') {
      return { percent: 100, isOverdue: false, text: 'Resolved within statutory SLA' };
    }

    const elapsed = now - created;
    const percent = Math.min(100, Math.max(0, Math.round((elapsed / totalDuration) * 100)));
    const isOverdue = now > deadline;
    const hoursRemaining = Math.max(0, Math.round((deadline - now) / (1000 * 60 * 60)));
    const hoursOverdue = Math.max(0, Math.round((now - deadline) / (1000 * 60 * 60)));

    return {
      percent,
      isOverdue,
      hoursRemaining,
      hoursOverdue,
      text: isOverdue ? `Breached by ${hoursOverdue} hour(s)` : `${hoursRemaining} hour(s) remaining`,
    };
  };

  const isOverdue =
    report && report.status !== 'RESOLVED' && new Date() > new Date(report.sla_deadline);

  const slaProgress = report ? getSLAProgress(report) : null;

  return (
    <div className="w-full space-y-6">
      {/* Header: Page scale */}
      <div className="border-b border-slate-200/80 pb-4">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 font-sans">
          Track Grievance Ticket &amp; SLA Status
        </h1>
        <p className="text-sm sm:text-base text-slate-600 mt-1 max-w-3xl font-normal">
          Inspect field verification findings, assigned squads, photographic proof, and statutory escalation tiers.
        </p>
      </div>

      {/* Search Toolbar: Standard white card container */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-4">
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={ticketIdInput}
              onChange={(e) => setTicketIdInput(e.target.value)}
              placeholder="Enter ticket number (e.g. KL-KCH-W66-2026-0102)..."
              className="w-full min-h-[44px] pl-10 pr-4 py-2 text-xs sm:text-sm font-mono uppercase text-slate-900 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-600 placeholder:text-slate-400 shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
            />
          </div>
          <Button
            type="submit"
            variant="primary"
            loading={loading}
            size="md"
            icon={<Search className="w-4 h-4" />}
          >
            Track
          </Button>
        </form>

        {/* Quick Reviewer Samples */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs sm:text-sm">
          <span className="font-semibold text-slate-600">
            Sample Tickets:
          </span>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_TICKETS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  setTicketIdInput(t.id);
                  loadTicket(t.id);
                }}
                className={`text-xs sm:text-sm px-3 py-1 rounded-lg border transition-all cursor-pointer font-mono font-medium ${
                  ticketIdInput === t.id
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs p-3.5 rounded-xl flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {escalationSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-3.5 rounded-xl flex items-center gap-2.5 font-medium animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{escalationSuccess}</span>
        </div>
      )}

      {/* Ticket Details Screen */}
      {report && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <Card className="p-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="text-xs text-slate-400 font-mono">TICKET:</span>
                  <h2 className="text-xl font-bold font-mono text-slate-950 tracking-tight">
                    {report.id}
                  </h2>
                  <button
                    type="button"
                    onClick={copyId}
                    className="text-slate-400 hover:text-slate-700 p-1 rounded transition-colors cursor-pointer"
                    title="Copy Ticket ID"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>

                  <Badge
                    variant={
                      report.status.startsWith('ESCALATED')
                        ? 'escalated'
                        : report.status === 'IN_PROGRESS'
                        ? 'in_progress'
                        : report.status === 'RESOLVED'
                        ? 'resolved'
                        : 'reported'
                    }
                    dot
                  >
                    {report.status.replace(/_/g, ' ')}
                  </Badge>
                </div>

                <div className="text-xs text-slate-500 font-normal">
                  Lodged on {new Date(report.created_at).toLocaleString()} by {report.reporter_name}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => window.print()}
                  icon={<Printer className="w-3.5 h-3.5 text-slate-500" />}
                >
                  Print Receipt
                </Button>

                {report.status !== 'RESOLVED' && (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => setShowEscalateModal(true)}
                    icon={<ShieldAlert className="w-3.5 h-3.5" />}
                  >
                    Escalate Grievance
                  </Button>
                )}
              </div>
            </div>

            {/* SLA PROGRESS BAR: Clean neutral container with color only on status text/progress */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 text-xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 font-medium">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-500" />
                  <span className="text-slate-800">
                    Statutory SLA ({report.sla_duration_hours}h Target Window):{' '}
                    <strong className={isOverdue ? 'text-rose-700 font-bold' : 'text-slate-950 font-semibold'}>
                      {slaProgress?.text}
                    </strong>
                  </span>
                </div>
                <div className="font-mono text-xs text-slate-500">
                  Target Deadline: {new Date(report.sla_deadline).toLocaleString()}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      report.status === 'RESOLVED'
                        ? 'bg-emerald-600'
                        : isOverdue
                        ? 'bg-rose-600'
                        : slaProgress && slaProgress.percent > 75
                        ? 'bg-amber-500'
                        : 'bg-slate-800'
                    }`}
                    style={{ width: `${slaProgress?.percent || 0}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                  <span>Report Lodged</span>
                  <span>{slaProgress?.percent}% SLA Elapsed</span>
                  <span>{report.sla_duration_hours}h Expiry</span>
                </div>
              </div>

              {/* Current Escalation Level Banner */}
              {report.escalation_level > 0 && (
                <div className="pt-2.5 border-t border-slate-200 text-xs flex items-start gap-2 text-rose-900">
                  <ShieldAlert className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">Active Escalation Tier: </span>
                    <span className="font-semibold underline">
                      {report.escalation_level === 1 &&
                        'Tier 1: Ward Sanitation Supervisor & Junior Health Inspector'}
                      {report.escalation_level === 2 &&
                        'Tier 2: Municipal Assistant Engineer (AE) - LSGD Engineering Wing'}
                      {report.escalation_level === 3 &&
                        'Tier 3: Municipal Corporation Secretary & Executive Engineer'}
                      {report.escalation_level === 4 &&
                        'Tier 4: District Disaster Management Authority (DDMA) Monsoon Operations'}
                    </span>
                    {report.escalation_reason && (
                      <div className="text-[11px] mt-0.5 text-slate-600 font-normal">
                        Reason: {report.escalation_reason}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Jurisdictional Authority & Ward Mapping */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="border border-slate-200/80 p-4 rounded-xl bg-slate-50/50 space-y-2">
                <div className="font-semibold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-slate-500" />
                  <span>Municipal Jurisdiction</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Local Body:</span>
                    <strong className="text-slate-900 font-medium">{report.local_body}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Ward:</span>
                    <strong className="text-slate-900 font-medium">
                      Ward {report.ward_number} - {report.ward_name}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Canal Basin:</span>
                    <span className="text-slate-800">{report.canal_basin}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Zone:</span>
                    <span className="text-slate-800">{report.zone}</span>
                  </div>
                </div>
              </div>

              <div className="border border-slate-200/80 p-4 rounded-xl bg-slate-50/50 space-y-2">
                <div className="font-semibold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  <span>Responsible Field Officers</span>
                </div>
                <div className="space-y-1 text-xs">
                  <div>
                    <span className="text-slate-400 text-[11px]">Assistant Engineer:</span>
                    <div className="font-medium text-slate-900">{report.authority_name}</div>
                  </div>
                  <div className="text-slate-600 text-[11px]">
                    Overseer: {report.overseer} &bull; {report.health_inspector}
                  </div>
                  {report.assigned_crew ? (
                    <div className="text-slate-800 font-medium pt-1 border-t border-slate-200 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                      <span>Dispatched Squad: {report.assigned_crew}</span>
                    </div>
                  ) : (
                    <div className="text-slate-500 text-[11px] pt-1 border-t border-slate-200 font-normal">
                      Awaiting squad dispatch by Assistant Engineer
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Blockage Details & Photo Verification */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-3">
                <div className="border border-slate-200/80 p-4 rounded-xl bg-white space-y-2">
                  <div className="font-semibold text-slate-900 text-xs tracking-wide uppercase">
                    Obstruction Findings &amp; Location
                  </div>
                  <p className="text-slate-700 text-xs leading-relaxed">{report.description}</p>
                  <div className="text-xs text-slate-500 font-mono pt-1 border-t border-slate-100">
                    Location: {report.landmark || report.address}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    Coordinates: {report.latitude.toFixed(5)}°N, {report.longitude.toFixed(5)}°E
                  </div>
                </div>

                {report.official_remarks && (
                  <div className="border border-slate-200 p-4 rounded-xl text-xs space-y-1 bg-slate-50/50">
                    <strong className="text-slate-900 font-semibold text-xs tracking-wide flex items-center gap-1.5 uppercase">
                      <Sparkles className="w-3.5 h-3.5 text-slate-600" />
                      <span>Official Action Remarks:</span>
                    </strong>
                    <p className="text-slate-700 leading-relaxed font-normal">{report.official_remarks}</p>
                  </div>
                )}
              </div>

              {/* BEFORE & AFTER PHOTO COMPARISON */}
              <div className="border border-slate-200/80 p-4 rounded-xl bg-slate-50/50 space-y-3">
                <div className="font-semibold text-slate-900 text-xs tracking-wide flex items-center justify-between uppercase">
                  <span>Photo Evidence Verification</span>
                  <span className="text-[11px] text-slate-400 font-mono">Before / After</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <span className="text-[11px] font-medium text-slate-500 block">
                      Before (Citizen Report):
                    </span>
                    <div className="relative rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
                      <img
                        src={report.photo_url}
                        alt="Citizen blockage evidence"
                        className="w-full h-36 object-cover"
                      />
                      <div className="absolute bottom-1.5 left-1.5 bg-slate-950/80 text-white text-[9px] font-mono px-1.5 py-0.5 rounded">
                        Incident Evidence
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] font-medium text-emerald-800 block">
                      After (De-silting Proof):
                    </span>
                    {report.resolution_photo_url ? (
                      <div className="relative rounded-lg overflow-hidden border border-emerald-300 bg-emerald-50">
                        <img
                          src={report.resolution_photo_url}
                          alt="Resolution proof"
                          className="w-full h-36 object-cover"
                        />
                        <div className="absolute bottom-1.5 left-1.5 bg-emerald-950/80 text-emerald-200 text-[9px] font-mono px-1.5 py-0.5 rounded">
                          Flow Restored
                        </div>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-slate-200 rounded-lg h-36 flex flex-col items-center justify-center p-3 text-center bg-white">
                        <Clock className="w-4 h-4 text-slate-400 mb-1" />
                        <span className="text-xs text-slate-600 font-medium">Clearance Proof Pending</span>
                        <span className="text-[11px] text-slate-400 leading-tight mt-0.5">
                          Photo uploaded upon verification.
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* AUDIT LOG TIMELINE */}
          <Card className="p-6 space-y-4">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-slate-500" />
                <h3 className="font-semibold text-xs uppercase tracking-wider text-slate-900">
                  Statutory Redressal Audit Timeline
                </h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                {report.timeline.length} event(s) logged
              </span>
            </div>

            <div className="space-y-3 relative before:absolute before:inset-0 before:left-3.5 before:w-px before:bg-slate-200 pt-2">
              {report.timeline.map((event, idx) => (
                <div key={idx} className="relative flex items-start gap-4 pl-9">
                  <div
                    className={`absolute left-2 top-1.5 w-3 h-3 rounded-full border-2 bg-white ${
                      event.status.startsWith('ESCALATED')
                        ? 'border-rose-600 bg-rose-600'
                        : event.status === 'RESOLVED'
                        ? 'border-emerald-600 bg-emerald-600'
                        : 'border-slate-800 bg-slate-800'
                    }`}
                  />
                  <div className="border border-slate-200/80 rounded-xl p-3.5 w-full space-y-1 bg-white">
                    <div className="flex flex-wrap items-center justify-between gap-1 text-xs">
                      <div className="flex items-center gap-2">
                        <strong className="text-slate-950 font-medium">{event.actor}</strong>
                        <span className="text-[10px] bg-slate-100 text-slate-600 border border-slate-200 px-1.5 py-0.5 rounded font-mono">
                          {event.actor_role}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {new Date(event.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed font-normal">{event.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Manual Escalation Appeal Modal */}
      {showEscalateModal && report && (
        <Modal
          isOpen={showEscalateModal}
          onClose={() => setShowEscalateModal(false)}
          title={`Statutory Escalation Appeal (Ticket ${report.id})`}
          description="Legally escalate this grievance to higher municipal and disaster management tiers."
        >
          <form onSubmit={handleEscalateSubmit} className="space-y-4">
            <p className="text-xs text-slate-600 leading-relaxed">
              If an obstruction remains unaddressed or water backflow threatens surrounding homes, you can
              escalate this ticket to administrative{' '}
              <strong className="text-rose-700 font-semibold">
                Level {report.escalation_level + 1} (
                {report.escalation_level === 0 && 'Ward Supervisor & Health Inspector'}
                {report.escalation_level === 1 && 'Assistant Engineer - LSGD Wing'}
                {report.escalation_level === 2 && 'Municipal Corporation Secretary'}
                {report.escalation_level >= 3 && 'District Disaster Management Authority - DDMA'}
                )
              </strong>
              .
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Reason for Statutory Escalation:
              </label>
              <textarea
                rows={3}
                value={escalateReason}
                onChange={(e) => setEscalateReason(e.target.value)}
                placeholder="e.g. 36 hours elapsed without crew visit; stagnant water entering residential courtyard..."
                className="w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-800 resize-none"
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setShowEscalateModal(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="danger"
                size="sm"
                loading={escalating}
              >
                Confirm Escalation Appeal
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
