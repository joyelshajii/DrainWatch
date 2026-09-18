import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import type { GeoJSONFeatureCollection, Report, Stats } from '../types';
import { fetchReports, fetchStats, fetchWards } from '../api';
import {
  RefreshCw,
  Search,
  PlusCircle,
  Clock,
  CheckCircle2,
  ChevronRight,
  Info,
  AlertTriangle,
  FileText,
  AlertCircle,
  ShieldAlert,
} from 'lucide-react';
import { Button } from './ui/Button';
import { Badge, HazardTag } from './ui/Badge';
import { Card, KpiTile } from './ui/Card';

interface WardMapProps {
  onSelectTicket: (id: string) => void;
  onNavigateToReport: () => void;
}

export const WardMap: React.FC<WardMapProps> = ({ onSelectTicket, onNavigateToReport }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const geojsonLayerRef = useRef<L.GeoJSON | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  const [reports, setReports] = useState<Report[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [wardsData, setWardsData] = useState<GeoJSONFeatureCollection | null>(null);
  const [loading, setLoading] = useState(true);

  // View state: 'split' (map + table), 'map' (full map), 'table' (table only)
  const [viewMode, setViewMode] = useState<'split' | 'map' | 'table'>('split');

  // Filters
  const [selectedWard, setSelectedWard] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [legendOpen, setLegendOpen] = useState(true);

  // Load Data
  const loadData = async () => {
    try {
      setLoading(true);
      const [wardsRes, statsRes, reportsRes] = await Promise.all([
        fetchWards(),
        fetchStats(),
        fetchReports({
          ward_id: selectedWard || undefined,
          status: selectedStatus || undefined,
          severity: selectedSeverity || undefined,
          search: searchQuery || undefined,
        }),
      ]);
      setWardsData(wardsRes);
      setStats(statsRes);
      setReports(reportsRes);
    } catch (err) {
      console.error('Failed to load map data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedWard, selectedStatus, selectedSeverity, searchQuery]);

  // Leaflet Map Init
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [9.975, 76.295],
      zoom: 13,
      minZoom: 11,
      maxZoom: 18,
      zoomControl: false,
    });

    L.control.zoom({ position: 'topright' }).addTo(map);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    const markersGroup = L.layerGroup().addTo(map);
    markersLayerRef.current = markersGroup;
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Map resize handler
  useEffect(() => {
    const timer = setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [viewMode]);

  // Update Ward Polygons
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !wardsData) return;

    if (geojsonLayerRef.current) {
      geojsonLayerRef.current.remove();
    }

    const geoLayer = L.geoJSON(wardsData as any, {
      style: (feature: any) => {
        const activeReports = feature?.properties?.active_reports || 0;
        let color = '#475569';
        let fillColor = '#64748b';
        let fillOpacity = 0.05;

        if (activeReports > 1) {
          color = '#e11d48';
          fillColor = '#e11d48';
          fillOpacity = 0.14;
        } else if (activeReports === 1) {
          color = '#d97706';
          fillColor = '#d97706';
          fillOpacity = 0.1;
        }

        return {
          color,
          weight: 1.5,
          opacity: 0.8,
          fillColor,
          fillOpacity,
          dashArray: '3, 3',
        };
      },
      onEachFeature: (feature: any, layer: any) => {
        const p = feature.properties;
        const tooltipContent = `
          <div style="font-family: inherit; font-size: 12px; padding: 2px 4px;">
            <div style="font-weight: 600; color: #0f172a;">${p.name} (${p.id})</div>
            <div style="color: #64748b; font-size: 11px;">${p.canal_basin}</div>
            <div style="margin-top: 4px; font-weight: 600; color: ${
              p.active_reports > 0 ? '#be123c' : '#047857'
            }; font-size: 11px;">
              ${p.active_reports} Active Choke(s)
            </div>
          </div>
        `;
        layer.bindTooltip(tooltipContent, { sticky: true, className: 'ward-tooltip' });

        layer.on('click', () => {
          setSelectedWard(p.id);
        });
      },
    }).addTo(map);

    geojsonLayerRef.current = geoLayer;
  }, [wardsData]);

  // Update Report Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersLayerRef.current;
    if (!map || !markersGroup) return;

    markersGroup.clearLayers();

    reports.forEach((report) => {
      let pinColor = '#d97706';
      let pinPulse = false;

      if (report.status.startsWith('ESCALATED') || report.severity === 'CRITICAL') {
        pinColor = '#e11d48';
        pinPulse = true;
      } else if (report.status === 'RESOLVED') {
        pinColor = '#059669';
      } else if (report.status === 'IN_PROGRESS') {
        pinColor = '#475569';
      }

      const customIcon = L.divIcon({
        className: 'custom-drain-marker',
        html: `
          <div style="position: relative; width: 22px; height: 22px; cursor: pointer;">
            <div class="${pinPulse ? 'marker-pulse-critical' : ''}" style="
              width: 20px;
              height: 20px;
              background-color: ${pinColor};
              border: 2px solid #ffffff;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
              color: white;
              font-weight: 600;
              font-size: 9px;
            ">
              ${report.severity === 'CRITICAL' ? '!' : report.status === 'RESOLVED' ? '✓' : '•'}
            </div>
          </div>
        `,
        iconSize: [22, 22],
        iconAnchor: [11, 11],
        popupAnchor: [0, -11],
      });

      const marker = L.marker([report.latitude, report.longitude], { icon: customIcon });

      const popupContent = `
        <div style="font-family: inherit; padding: 12px; width: 240px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <span style="font-size: 11px; font-weight: 700; color: #0f172a; font-family: monospace;">
              ${report.id}
            </span>
            <span style="font-size: 11px; color: #64748b;">
              ${report.ward_id}
            </span>
          </div>
          ${
            report.photo_url
              ? `<div style="margin-bottom: 8px; border-radius: 6px; overflow: hidden; border: 1px solid #e2e8f0; height: 95px;">
                  <img src="${report.photo_url}" alt="Site Evidence" style="width: 100%; height: 100%; object-fit: cover; display: block;"/>
                 </div>`
              : ''
          }
          <div style="font-size: 12px; font-weight: 600; color: #0f172a; margin-bottom: 2px;">
            ${report.blockage_type.replace(/_/g, ' ')}
          </div>
          <div style="font-size: 11px; color: #64748b; margin-bottom: 8px; line-height: 1.3;">
            ${report.landmark || report.address}
          </div>
          <button id="view-ticket-${report.id}" style="
            width: 100%;
            background-color: #0f172a;
            color: #ffffff;
            border: none;
            padding: 6px 10px;
            font-size: 11px;
            font-weight: 500;
            border-radius: 6px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 4px;
          ">
            <span>Track Grievance</span> &rarr;
          </button>
        </div>
      `;

      marker.bindPopup(popupContent);
      marker.on('popupopen', () => {
        const btn = document.getElementById(`view-ticket-${report.id}`);
        if (btn) {
          btn.onclick = () => onSelectTicket(report.id);
        }
      });

      markersGroup.addLayer(marker);
    });
  }, [reports, onSelectTicket]);

  const hasActiveFilters = Boolean(selectedWard || selectedStatus || selectedSeverity || searchQuery);

  const clearFilters = () => {
    setSelectedWard('');
    setSelectedStatus('');
    setSelectedSeverity('');
    setSearchQuery('');
  };

  return (
    <div className="space-y-6">
      {/* 1. Page Header: Strong title scale, subtle subordinate copy */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-950">
            Canal &amp; Storm-Drain Redressal Grid
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl font-normal leading-relaxed">
            Public operational map and grievance tracking across 12 Kochi Municipal Corporation wards.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="primary"
            size="sm"
            onClick={onNavigateToReport}
            icon={<PlusCircle className="w-4 h-4" />}
          >
            Report Blockage
          </Button>
        </div>
      </div>

      {/* 2. Structured KPI Tiles: Dominant bold numbers, clean de-boxed appearance */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiTile
            label="Total Grievances"
            value={stats.total_reports}
            subtext="tickets filed"
            secondaryText="Kochi Municipal Jurisdiction"
            icon={<FileText className="w-4 h-4" />}
            accent="neutral"
          />

          <KpiTile
            label="Active Choke Points"
            value={stats.active_blockages}
            subtext="unresolved"
            secondaryText={`${stats.in_progress} squad(s) deployed`}
            icon={<AlertCircle className="w-4 h-4" />}
            accent="pending"
          />

          <KpiTile
            label="SLA Escalated (AE/DDMA)"
            value={stats.escalated_count}
            subtext="breached SLA"
            secondaryText={`${stats.critical_flood_risk} high flood risk zone(s)`}
            icon={<ShieldAlert className="w-4 h-4" />}
            accent="critical"
          />

          <KpiTile
            label="De-silted & Cleared"
            value={stats.resolved}
            subtext="flow restored"
            secondaryText={`Avg resolution: ${stats.avg_resolution_hours.toFixed(1)}h`}
            icon={<CheckCircle2 className="w-4 h-4" />}
            accent="resolved"
          />
        </div>
      )}

      {/* 3. Utility Filter Bar: Visually secondary, blends into background, thin border */}
      <div className="bg-slate-100/60 border border-slate-200/80 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          {/* Search */}
          <div className="relative min-w-[200px] flex-1 sm:flex-none">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search ticket, canal, road..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full min-h-[36px] pl-8 pr-3 py-1 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:border-slate-800"
            />
          </div>

          {/* Ward filter */}
          <select
            value={selectedWard}
            onChange={(e) => setSelectedWard(e.target.value)}
            className="min-h-[36px] px-2.5 py-1 text-xs rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-none focus:border-slate-800 cursor-pointer"
          >
            <option value="">All Wards</option>
            <option value="W48">Ward 48 - Kadavanthra</option>
            <option value="W58">Ward 58 - Thevara</option>
            <option value="W42">Ward 42 - Vyttila</option>
            <option value="W44">Ward 44 - Elamakkulam</option>
            <option value="W35">Ward 35 - Kaloor North</option>
            <option value="W36">Ward 36 - Kaloor South</option>
            <option value="W33">Ward 33 - Palarivattom</option>
            <option value="W28">Ward 28 - Edappally</option>
            <option value="W66">Ward 66 - Ernakulam South</option>
            <option value="W67">Ward 67 - Marine Drive</option>
            <option value="W60">Ward 60 - Fort Kochi</option>
            <option value="W62">Ward 62 - Mattancherry</option>
          </select>

          {/* Status filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="min-h-[36px] px-2.5 py-1 text-xs rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-none focus:border-slate-800 cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">All Active Grievances</option>
            <option value="REPORTED">Reported / Pending</option>
            <option value="INSPECTED">Inspected</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="ESCALATED">SLA Escalated</option>
            <option value="RESOLVED">Resolved</option>
          </select>

          {/* Severity filter */}
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="min-h-[36px] px-2.5 py-1 text-xs rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-none focus:border-slate-800 cursor-pointer"
          >
            <option value="">All Severities</option>
            <option value="CRITICAL">Critical (24h SLA)</option>
            <option value="HIGH">High (48h SLA)</option>
            <option value="MODERATE">Moderate (72h SLA)</option>
            <option value="MINOR">Minor (96h SLA)</option>
          </select>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-xs text-slate-500 hover:text-slate-900 px-2 py-1 cursor-pointer underline"
            >
              Reset
            </button>
          )}

          <Button
            variant="secondary"
            size="sm"
            onClick={loadData}
            title="Refresh Data"
            className="min-h-[36px] px-2.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-600 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center bg-white p-0.5 rounded-lg border border-slate-200 shrink-0">
          <button
            onClick={() => setViewMode('split')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
              viewMode === 'split' ? 'bg-slate-900 text-white font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Split View
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
              viewMode === 'map' ? 'bg-slate-900 text-white font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Map Only
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
              viewMode === 'table' ? 'bg-slate-900 text-white font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Table Only
          </button>
        </div>
      </div>

      {/* 4. GIS Map Canvas */}
      {(viewMode === 'split' || viewMode === 'map') && (
        <Card className="p-0 overflow-hidden relative shadow-2xs">
          <div
            ref={mapContainerRef}
            className={`w-full transition-all duration-300 ${
              viewMode === 'map' ? 'h-[600px]' : 'h-[440px]'
            }`}
          />

          {/* Floating Map Legend */}
          <div className="absolute bottom-4 left-4 z-[400] bg-white/95 backdrop-blur-md border border-slate-200 p-3 rounded-lg shadow-sm text-xs max-w-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-1 mb-2">
              <span className="font-semibold text-slate-900 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-slate-500" />
                <span>Spatial Legend</span>
              </span>
              <button
                onClick={() => setLegendOpen(!legendOpen)}
                className="text-[11px] text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                {legendOpen ? 'Hide' : 'Show'}
              </button>
            </div>

            {legendOpen && (
              <div className="space-y-1.5">
                <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px]">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-600 inline-block" />
                    <span className="text-slate-700">SLA Escalated</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                    <span className="text-slate-700">Reported</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-slate-600 inline-block" />
                    <span className="text-slate-700">Crew on Site</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block" />
                    <span className="text-slate-700">Flow Restored</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* 5. Grievance Registry Table: Restructured 2-line layout, generous whitespace */}
      {(viewMode === 'split' || viewMode === 'table') && (
        <Card className="overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-xs text-slate-900 tracking-wider uppercase">
                Grievance &amp; Redressal Registry
              </h3>
              <Badge variant="neutral" className="font-mono text-[11px]">
                {reports.length} matching
              </Badge>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              Live telemetry linked to LSGD Engineering Wing
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-100/50 text-slate-500 font-semibold text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-4">Ticket &amp; Ward</th>
                  <th className="py-3 px-4">Canal Corridor</th>
                  <th className="py-3 px-4">Obstruction Nature</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">SLA Deadline</th>
                  <th className="py-3 px-4">Assigned Authority</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reports.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 px-4 text-center">
                      <div className="max-w-sm mx-auto text-slate-500 space-y-2">
                        <AlertTriangle className="w-6 h-6 text-slate-400 mx-auto" />
                        <p className="font-semibold text-slate-800 text-sm">No grievances found</p>
                        <p className="text-xs text-slate-500">
                          Try adjusting your search criteria or resetting filters.
                        </p>
                        {hasActiveFilters && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={clearFilters}
                            className="mt-2"
                          >
                            Clear All Filters
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  reports.map((r) => {
                    const isOverdue = new Date() > new Date(r.sla_deadline) && r.status !== 'RESOLVED';

                    return (
                      <tr
                        key={r.id}
                        className="hover:bg-slate-50/70 transition-colors cursor-pointer group"
                        onClick={() => onSelectTicket(r.id)}
                      >
                        {/* 1. Ticket & Ward: Bold mono ticket + clear ward name */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="font-mono font-bold text-slate-950 text-xs tracking-tight">
                            {r.id}
                          </div>
                          <div className="text-[11px] font-medium text-slate-600 mt-0.5">
                            Ward {r.ward_number} &bull; {r.ward_name}
                          </div>
                        </td>

                        {/* 2. Canal Corridor: Basin + Landmark */}
                        <td className="py-3.5 px-4">
                          <div className="font-medium text-slate-900 text-xs">
                            {r.canal_basin}
                          </div>
                          <div className="text-[11px] text-slate-400 truncate max-w-xs mt-0.5">
                            {r.landmark || r.address}
                          </div>
                        </td>

                        {/* 3. Obstruction Nature & Subordinate Hazard Tag */}
                        <td className="py-3.5 px-4">
                          <div className="font-medium text-slate-900 text-xs">
                            {r.blockage_type.replace(/_/g, ' ')}
                          </div>
                          <div className="mt-1">
                            <HazardTag severity={r.severity} />
                          </div>
                        </td>

                        {/* 4. Primary Status Badge */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
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

                        {/* 5. SLA Deadline */}
                        <td className="py-3.5 px-4 whitespace-nowrap font-mono text-xs">
                          {r.status === 'RESOLVED' ? (
                            <span className="text-emerald-800 font-medium flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Restored</span>
                            </span>
                          ) : (
                            <span
                              className={`inline-flex items-center gap-1 ${
                                isOverdue ? 'text-rose-700 font-bold' : 'text-slate-600'
                              }`}
                            >
                              <Clock className="w-3.5 h-3.5" />
                              <span>{isOverdue ? 'BREACHED' : `${r.sla_duration_hours}h Target`}</span>
                            </span>
                          )}
                        </td>

                        {/* 6. Assigned Authority */}
                        <td className="py-3.5 px-4 text-slate-600 truncate max-w-xs text-xs">
                          {r.assigned_crew || r.authority_name}
                        </td>

                        {/* 7. Action button */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectTicket(r.id);
                            }}
                            className="py-1 px-2.5 text-xs group-hover:border-slate-400"
                          >
                            <span>Inspect</span>
                            <ChevronRight className="w-3 h-3 text-slate-400" />
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
      )}
    </div>
  );
};
