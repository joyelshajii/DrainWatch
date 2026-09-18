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
} from 'lucide-react';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { Card } from './ui/Card';

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

  // Whenever viewMode changes, invalidate map size to prevent gray boxes or frozen maps!
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
        let color = '#2563eb';
        let fillColor = '#3b82f6';
        let fillOpacity = 0.08;

        if (activeReports > 1) {
          color = '#e11d48';
          fillColor = '#f43f5e';
          fillOpacity = 0.18;
        } else if (activeReports === 1) {
          color = '#d97706';
          fillColor = '#f59e0b';
          fillOpacity = 0.14;
        }

        return {
          color,
          weight: 2,
          opacity: 0.9,
          fillColor,
          fillOpacity,
          dashArray: '4, 4',
        };
      },
      onEachFeature: (feature: any, layer: any) => {
        const p = feature.properties;
        const tooltipContent = `
          <div style="font-family: inherit; font-size: 12px; padding: 2px 4px;">
            <div style="font-weight: 700; color: #0f172a;">${p.name} (${p.id})</div>
            <div style="color: #64748b; font-size: 11px;">${p.canal_basin}</div>
            <div style="margin-top: 4px; font-weight: 600; color: ${
              p.active_reports > 0 ? '#e11d48' : '#059669'
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
      let pinColor = '#f59e0b';
      let pinPulse = false;

      if (report.status.startsWith('ESCALATED') || report.severity === 'CRITICAL') {
        pinColor = '#e11d48';
        pinPulse = true;
      } else if (report.status === 'RESOLVED') {
        pinColor = '#10b981';
      } else if (report.status === 'IN_PROGRESS') {
        pinColor = '#3b82f6';
      }

      const customIcon = L.divIcon({
        className: 'custom-drain-marker',
        html: `
          <div style="position: relative; width: 26px; height: 26px; cursor: pointer;">
            <div class="${pinPulse ? 'marker-pulse-critical' : ''}" style="
              width: 24px;
              height: 24px;
              background-color: ${pinColor};
              border: 2px solid #ffffff;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.25);
              color: white;
              font-weight: bold;
              font-size: 10px;
            ">
              ${report.severity === 'CRITICAL' ? '!' : report.status === 'RESOLVED' ? '✓' : '•'}
            </div>
          </div>
        `,
        iconSize: [26, 26],
        iconAnchor: [13, 13],
        popupAnchor: [0, -14],
      });

      const marker = L.marker([report.latitude, report.longitude], { icon: customIcon });

      const popupContent = `
        <div style="font-family: inherit; padding: 12px; width: 250px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <span style="font-size: 10px; font-weight: 700; color: #0284c7; background: #f0f9ff; border: 1px solid #bae6fd; padding: 1px 6px; border-radius: 4px;">
              ${report.id}
            </span>
            <span style="font-size: 10px; font-weight: 600; color: #475569;">
              ${report.ward_id}
            </span>
          </div>
          ${
            report.photo_url
              ? `<div style="margin-bottom: 8px; border-radius: 6px; overflow: hidden; border: 1px solid #e2e8f0; height: 100px;">
                  <img src="${report.photo_url}" alt="Site Evidence" style="width: 100%; height: 100%; object-fit: cover; display: block;"/>
                 </div>`
              : ''
          }
          <div style="font-size: 12px; font-weight: 600; color: #0f172a; margin-bottom: 3px;">
            ${report.blockage_type.replace(/_/g, ' ')}
          </div>
          <div style="font-size: 11px; color: #64748b; margin-bottom: 10px; line-height: 1.3;">
            ${report.landmark || report.address}
          </div>
          <button id="view-ticket-${report.id}" style="
            width: 100%;
            background-color: #0f172a;
            color: #ffffff;
            border: none;
            padding: 7px 10px;
            font-size: 11px;
            font-weight: 600;
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
    <div className="space-y-5">
      {/* High-Impact Telemetry Overview */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          <Card className="p-4 bg-white border-slate-200">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
              <span>Total Grievances</span>
              <FileText className="w-4 h-4 text-slate-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-slate-900">
                {stats.total_reports}
              </span>
              <span className="text-xs text-slate-500">tickets filed</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Kochi Municipal Jurisdiction</div>
          </Card>

          <Card className="p-4 bg-amber-50/40 border-amber-200/80">
            <div className="flex items-center justify-between text-amber-900 text-xs font-semibold uppercase tracking-wider">
              <span>Active Choke Points</span>
              <span className="w-2 h-2 rounded-full bg-amber-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-amber-800">
                {stats.active_blockages}
              </span>
              <span className="text-xs text-amber-700 font-medium">requiring clearance</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              {stats.in_progress} crew(s) actively deployed
            </div>
          </Card>

          <Card className="p-4 bg-rose-50/40 border-rose-200/80">
            <div className="flex items-center justify-between text-rose-900 text-xs font-semibold uppercase tracking-wider">
              <span>SLA Escalated (AE/DDMA)</span>
              <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-rose-800">
                {stats.escalated_count}
              </span>
              <span className="text-xs text-rose-700 font-medium">breached SLA</span>
            </div>
            <div className="text-[11px] text-rose-700 font-medium mt-1">
              {stats.critical_flood_risk} high flood risk zone(s)
            </div>
          </Card>

          <Card className="p-4 bg-emerald-50/40 border-emerald-200/80">
            <div className="flex items-center justify-between text-emerald-900 text-xs font-semibold uppercase tracking-wider">
              <span>De-silted &amp; Cleared</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-emerald-800">
                {stats.resolved}
              </span>
              <span className="text-xs text-emerald-700 font-medium">flow restored</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Avg resolution: <strong className="text-slate-800 font-mono">{stats.avg_resolution_hours.toFixed(1)}h</strong>
            </div>
          </Card>
        </div>
      )}

      {/* Filter & Command Strip */}
      <Card className="p-3.5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5 flex-1">
            {/* Search */}
            <div className="relative min-w-[220px] flex-1 sm:flex-none">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search ticket, canal, road..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full min-h-[38px] pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-600"
              />
            </div>

            {/* Ward filter */}
            <select
              value={selectedWard}
              onChange={(e) => setSelectedWard(e.target.value)}
              className="min-h-[38px] px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-none focus:border-sky-600 cursor-pointer"
            >
              <option value="">All Municipal Wards</option>
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
              className="min-h-[38px] px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-none focus:border-sky-600 cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">All Active Grievances</option>
              <option value="REPORTED">Reported / Pending</option>
              <option value="INSPECTED">Inspected by Overseer</option>
              <option value="IN_PROGRESS">In Progress (Crew Deployed)</option>
              <option value="ESCALATED">SLA Escalated (AE/DDMA)</option>
              <option value="RESOLVED">Resolved &amp; Cleared</option>
            </select>

            {/* Severity filter */}
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="min-h-[38px] px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-none focus:border-sky-600 cursor-pointer"
            >
              <option value="">All Severities</option>
              <option value="CRITICAL">Critical (24h SLA - Flood Hazard)</option>
              <option value="HIGH">High (48h SLA - Waterlogging)</option>
              <option value="MODERATE">Moderate (72h SLA)</option>
              <option value="MINOR">Minor (96h SLA)</option>
            </select>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-xs text-slate-500 hover:text-slate-900"
              >
                Reset Filters
              </Button>
            )}

            <Button
              variant="secondary"
              size="sm"
              onClick={loadData}
              title="Refresh Data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>

          {/* View Mode Switcher + CTA */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
              <button
                onClick={() => setViewMode('split')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
                  viewMode === 'split' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Split View
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
                  viewMode === 'map' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Map Only
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
                  viewMode === 'table' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Table Only
              </button>
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={onNavigateToReport}
              icon={<PlusCircle className="w-4 h-4" />}
            >
              Report Choke
            </Button>
          </div>
        </div>
      </Card>

      {/* GIS Map Canvas */}
      {(viewMode === 'split' || viewMode === 'map') && (
        <Card className="p-0 overflow-hidden relative shadow-sm">
          <div
            ref={mapContainerRef}
            className={`w-full transition-all duration-300 ${
              viewMode === 'map' ? 'h-[620px]' : 'h-[460px]'
            }`}
          />

          {/* Floating Map Legend */}
          <div className="absolute bottom-4 left-4 z-[400] bg-white/95 backdrop-blur-md border border-slate-200/90 p-3 rounded-xl shadow-lg text-xs max-w-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 mb-2">
              <span className="font-semibold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-sky-600" />
                <span>Spatial Legend</span>
              </span>
              <button
                onClick={() => setLegendOpen(!legendOpen)}
                className="text-[11px] text-slate-500 hover:text-slate-900 cursor-pointer font-medium"
              >
                {legendOpen ? 'Hide' : 'Show'}
              </button>
            </div>

            {legendOpen && (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[11px]">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-600 inline-block" />
                    <span className="text-slate-700">SLA Escalated</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                    <span className="text-slate-700">Reported</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" />
                    <span className="text-slate-700">Crew on Site</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" />
                    <span className="text-slate-700">Flow Restored</span>
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 border-t border-slate-100 pt-1.5 leading-relaxed">
                  Dashed polygons indicate Kochi Municipal wards. Clicking any ward filters active reports.
                </p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Reports Registry Data Grid */}
      {(viewMode === 'split' || viewMode === 'table') && (
        <Card className="overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-xs text-slate-900 tracking-wide uppercase">
                Active Grievance Registry
              </h3>
              <Badge variant="outline" className="font-mono text-[11px]">
                {reports.length} matching
              </Badge>
            </div>
            <span className="text-xs text-slate-500 font-mono">
              Live updates linked to LSGD engineering dispatch
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-100/50 text-slate-600 font-semibold text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-4">Ticket</th>
                  <th className="py-3 px-4">Ward &amp; Canal Corridor</th>
                  <th className="py-3 px-4">Obstruction Nature</th>
                  <th className="py-3 px-4">Current Status</th>
                  <th className="py-3 px-4">SLA Target</th>
                  <th className="py-3 px-4">Responsible Unit</th>
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
                          Try adjusting your search criteria or resetting applied filters.
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
                        className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                        onClick={() => onSelectTicket(r.id)}
                      >
                        {/* Ticket ID */}
                        <td className="py-3 px-4 font-mono font-medium text-slate-900 whitespace-nowrap">
                          {r.id}
                        </td>

                        {/* Ward & Canal */}
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-900">
                            Ward {r.ward_number} - {r.ward_name}
                          </div>
                          <div className="text-[11px] text-slate-500 truncate max-w-xs">
                            {r.canal_basin}
                          </div>
                        </td>

                        {/* Obstruction Nature */}
                        <td className="py-3 px-4">
                          <div className="font-medium text-slate-800">
                            {r.blockage_type.replace(/_/g, ' ')}
                          </div>
                          <div className="mt-0.5">
                            <span
                              className={`text-[10px] font-bold ${
                                r.severity === 'CRITICAL'
                                  ? 'text-rose-600'
                                  : r.severity === 'HIGH'
                                  ? 'text-amber-600'
                                  : 'text-slate-500'
                              }`}
                            >
                              {r.severity} HAZARD
                            </span>
                          </div>
                        </td>

                        {/* Status badge */}
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

                        {/* SLA */}
                        <td className="py-3 px-4 whitespace-nowrap font-mono text-xs">
                          {r.status === 'RESOLVED' ? (
                            <span className="text-emerald-700 font-semibold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>De-silted</span>
                            </span>
                          ) : (
                            <span
                              className={`inline-flex items-center gap-1 ${
                                isOverdue ? 'text-rose-600 font-bold' : 'text-slate-600'
                              }`}
                            >
                              <Clock className="w-3.5 h-3.5" />
                              <span>{isOverdue ? 'OVERDUE' : `${r.sla_duration_hours}h SLA`}</span>
                            </span>
                          )}
                        </td>

                        {/* Authority */}
                        <td className="py-3 px-4 text-slate-600 truncate max-w-xs">
                          {r.assigned_crew || r.authority_name}
                        </td>

                        {/* Action button */}
                        <td className="py-3 px-4 text-right whitespace-nowrap">
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
