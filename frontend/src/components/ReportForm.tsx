import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { createReport, lookupWard, uploadFile, analyzePhotoAI } from '../api';
import type { Ward, Report, AIAnalysisResult } from '../types';
import {
  Camera,
  Upload,
  AlertCircle,
  Navigation,
  FileCheck,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Award,
  ArrowRight,
} from 'lucide-react';
import { Button } from './ui/Button';
import { Card, CardHeader, CardBody, CardFooter } from './ui/Card';
import { Badge } from './ui/Badge';
import { Input } from './ui/Input';
import { Select } from './ui/Select';

interface ReportFormProps {
  onReportSubmitted: (report: Report) => void;
}

const KOCHI_PRESETS = [
  { name: 'Kadavanthra (Ward 48)', lat: 9.9674, lng: 76.2995, desc: 'Thevara-Perandoor Canal culvert at SCB Road', canal: 'Thevara-Perandoor' },
  { name: 'Ernakulam South (Ward 66)', lat: 9.9682, lng: 76.2874, desc: 'Mullassery Canal near South Railway Station', canal: 'Mullassery' },
  { name: 'Palarivattom (Ward 33)', lat: 9.9985, lng: 76.3112, desc: 'Changadampokku drain under Pipeline bridge', canal: 'Changadampokku' },
  { name: 'Fort Kochi (Ward 60)', lat: 9.9650, lng: 76.2420, desc: 'Calvathy canal near Old Harbour wharf', canal: 'Calvathy' },
  { name: 'Vyttila (Ward 42)', lat: 9.9660, lng: 76.3180, desc: 'Chilavannoor canal mouth near mobility hub', canal: 'Chilavannoor' },
];

const SEVERITY_LEVELS = [
  {
    id: 'CRITICAL',
    name: 'Critical Hazard',
    sla: 24,
    badge: 'border-rose-300 bg-rose-50 text-rose-800',
    desc: 'Immediate dwelling inundation or pre-monsoon culvert failure',
  },
  {
    id: 'HIGH',
    name: 'High Priority',
    sla: 48,
    badge: 'border-amber-300 bg-amber-50 text-amber-800',
    desc: 'Trunk road waterlogging or main canal backflow risk',
  },
  {
    id: 'MODERATE',
    name: 'Moderate Choke',
    sla: 72,
    badge: 'border-sky-300 bg-sky-50 text-sky-800',
    desc: 'Hydraulic flow throttled > 50% by silt or floating hyacinth',
  },
  {
    id: 'MINOR',
    name: 'Minor Sediment',
    sla: 96,
    badge: 'border-slate-300 bg-slate-50 text-slate-800',
    desc: 'Localized lateral-drain debris without immediate backflow',
  },
];

const BLOCKAGE_TYPES = [
  {
    id: 'PLASTIC_SOLID_WASTE',
    title: 'Plastic Waste & Municipal Solids',
    desc: 'Bags, bottles, and commercial dump accumulating at siphon or bridge grills.',
  },
  {
    id: 'SILT_ACCUMULATION',
    title: 'Heavy Silt & Mud Sedimentation',
    desc: 'Pre-monsoon soil accumulation throttling drain bed elevation.',
  },
  {
    id: 'CULVERT_CHOKE',
    title: 'Box Culvert & Siphon Grill Choke',
    desc: 'Under-road conduit completely blocked; storm water backing onto road.',
  },
  {
    id: 'WEED_HYACINTH',
    title: 'Water Hyacinth & Invasive Vegetation',
    desc: 'Dense vegetative carpet arresting water flow and breeding mosquitoes.',
  },
  {
    id: 'CONSTRUCTION_DEBRIS',
    title: 'Construction Debris & Broken Slabs',
    desc: 'Concrete slurry, rubble, or collapsed drainage covers blocking passage.',
  },
];

export const ReportForm: React.FC<ReportFormProps> = ({ onReportSubmitted }) => {
  // Form State
  const [lat, setLat] = useState(9.9674);
  const [lng, setLng] = useState(76.2995);
  const [address, setAddress] = useState('Subhash Chandra Bose Road, Kadavanthra, Kochi');
  const [landmark, setLandmark] = useState('Near Kadavanthra Culvert Bridge');
  const [blockageType, setBlockageType] = useState('PLASTIC_SOLID_WASTE');
  const [severity, setSeverity] = useState('HIGH');
  const [description, setDescription] = useState('Severe plastic accumulation choking culvert intake grid, causing 10cm stormwater backflow towards pedestrian walkway.');
  const [reporterName, setReporterName] = useState('');
  const [reporterPhone, setReporterPhone] = useState('');

  // Media & AI
  const [photoUrl, setPhotoUrl] = useState(
    'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&w=800&q=80'
  );
  const [photoBase64, setPhotoBase64] = useState('');
  const [uploading, setUploading] = useState(false);
  const [analyzingAI, setAnalyzingAI] = useState(false);
  const [aiResult, setAiResult] = useState<AIAnalysisResult | null>(null);

  // Ward Resolution State
  const [wardInfo, setWardInfo] = useState<Ward | null>(null);
  const [resolvingWard, setResolvingWard] = useState(false);

  // Submission State
  const [submitting, setSubmitting] = useState(false);
  const [submittedReport, setSubmittedReport] = useState<Report | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [copiedTicket, setCopiedTicket] = useState(false);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  // Resolve Ward dynamically via Ray-Casting API
  useEffect(() => {
    let active = true;
    const fetchWard = async () => {
      setResolvingWard(true);
      try {
        const data = await lookupWard(lat, lng);
        if (active && data.ward) {
          setWardInfo(data.ward);
        }
      } catch (err) {
        console.error('Ward lookup error:', err);
      } finally {
        if (active) setResolvingWard(false);
      }
    };

    fetchWard();
    return () => {
      active = false;
    };
  }, [lat, lng]);

  // Leaflet Map Picker Initialization
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [lat, lng],
      zoom: 14,
      zoomControl: false,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap',
      maxZoom: 19,
    }).addTo(map);

    const customPin = L.divIcon({
      className: 'custom-picker-pin',
      html: `
        <div style="position: relative; display: flex; align-items: center; justify-content: center;">
          <div style="width: 28px; height: 28px; background-color: #0369a1; border: 2px solid white; border-radius: 50%; box-shadow: 0 4px 10px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white;">
            <svg style="width: 14px; height: 14px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });

    const marker = L.marker([lat, lng], { draggable: true, icon: customPin }).addTo(map);

    marker.on('dragend', (e) => {
      const pos = e.target.getLatLng();
      setLat(Number(pos.lat.toFixed(6)));
      setLng(Number(pos.lng.toFixed(6)));
    });

    map.on('click', (e) => {
      marker.setLatLng(e.latlng);
      setLat(Number(e.latlng.lat.toFixed(6)));
      setLng(Number(e.latlng.lng.toFixed(6)));
    });

    mapInstanceRef.current = map;
    markerRef.current = marker;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update marker position when lat/lng changes
  useEffect(() => {
    if (markerRef.current && mapInstanceRef.current) {
      markerRef.current.setLatLng([lat, lng]);
      mapInstanceRef.current.panTo([lat, lng]);
    }
  }, [lat, lng]);

  // Handle Photo File Upload & AI Classification
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setAnalyzingAI(true);
    setErrorMsg('');
    try {
      const reader = new FileReader();
      reader.onload = () => {
        setPhotoBase64(reader.result as string);
      };
      reader.readAsDataURL(file);

      const res = await uploadFile(file);
      setPhotoUrl(res.url);

      const aiRes = await analyzePhotoAI(file);
      setAiResult(aiRes);

      if (aiRes.suggested_severity) {
        setSeverity(aiRes.suggested_severity);
      }
      if (aiRes.suggested_blockage_type) {
        setBlockageType(aiRes.suggested_blockage_type);
      }
    } catch (err: any) {
      setErrorMsg('Failed to process image file: ' + (err.message || 'Network error'));
    } finally {
      setUploading(false);
      setAnalyzingAI(false);
    }
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setErrorMsg('Geolocation is not supported by your browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLat(Number(position.coords.latitude.toFixed(6)));
        setLng(Number(position.coords.longitude.toFixed(6)));
      },
      (err) => {
        setErrorMsg('Could not fetch GPS coordinates: ' + err.message);
      }
    );
  };

  const handleSelectPreset = (p: (typeof KOCHI_PRESETS)[0]) => {
    setLat(p.lat);
    setLng(p.lng);
    setLandmark(p.desc);
    setAddress(`${p.name}, Kochi`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoUrl && !photoBase64) {
      setErrorMsg('Please provide photo evidence of the blocked canal or culvert.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');
    try {
      const newReport = await createReport({
        latitude: lat,
        longitude: lng,
        address,
        landmark,
        blockage_type: blockageType,
        severity,
        description,
        reporter_name: reporterName || 'Concerned Resident',
        reporter_phone: reporterPhone || '+91 94470 00000',
        photo_url: photoUrl || photoBase64,
      });

      setSubmittedReport(newReport);
      onReportSubmitted(newReport);
    } catch (err: any) {
      setErrorMsg('Failed to register blockage report: ' + (err.message || 'Server error'));
    } finally {
      setSubmitting(false);
    }
  };

  const copyTicketId = () => {
    if (!submittedReport) return;
    navigator.clipboard.writeText(submittedReport.id);
    setCopiedTicket(true);
    setTimeout(() => setCopiedTicket(false), 2000);
  };

  const currentSeverityObj = SEVERITY_LEVELS.find((s) => s.id === severity) || SEVERITY_LEVELS[1];

  // SUCCESS CONFIRMATION SCREEN
  if (submittedReport) {
    return (
      <div className="max-w-2xl mx-auto py-6 animate-in fade-in duration-300">
        <Card className="overflow-hidden border-emerald-200">
          <div className="bg-emerald-700 text-white p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-600/80 border border-emerald-400 flex items-center justify-center">
                <Check className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight">Grievance Ticket Registered</h2>
                <p className="text-emerald-100 text-xs mt-0.5">
                  Point-in-polygon routing has assigned this report to the designated municipal wing.
                </p>
              </div>
            </div>
          </div>

          <CardBody className="space-y-5">
            {/* Gamification Badge */}
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-slate-900 text-xs block">+10 Water Warden Points Awarded!</span>
                  <span className="text-xs text-slate-600">Credited to civic impact leaderboard.</span>
                </div>
              </div>
              <Badge variant="high" className="font-mono text-xs">
                +10 Points
              </Badge>
            </div>

            {/* Ticket ID Box */}
            <div className="bg-slate-950 text-white p-4 rounded-xl flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-[10px] text-slate-400 block font-mono uppercase tracking-wider">
                  Official Grievance ID:
                </span>
                <span className="text-lg font-mono font-bold text-emerald-400">
                  {submittedReport.id}
                </span>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={copyTicketId}
                icon={copiedTicket ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                className="bg-slate-800 text-slate-100 border-slate-700 hover:bg-slate-700"
              >
                {copiedTicket ? 'Copied' : 'Copy ID'}
              </Button>
            </div>

            {/* Routing Details Table */}
            <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 text-xs">
              <div className="p-3.5 bg-slate-50/70 flex items-center justify-between">
                <span className="font-semibold text-slate-700">Assigned Municipal Ward:</span>
                <span className="font-bold text-slate-950 font-mono">
                  Ward {submittedReport.ward_number} - {submittedReport.ward_name} ({submittedReport.zone})
                </span>
              </div>
              <div className="p-3.5 flex items-center justify-between">
                <span className="text-slate-600">Canal Corridor / Basin:</span>
                <span className="font-medium text-slate-900">{submittedReport.canal_basin}</span>
              </div>
              <div className="p-3.5 flex items-center justify-between">
                <span className="text-slate-600">Designated Assistant Engineer:</span>
                <span className="font-medium text-slate-900">{submittedReport.authority_name}</span>
              </div>
              <div className="p-3.5 flex items-center justify-between">
                <span className="text-slate-600">Statutory SLA Window:</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-emerald-700">
                    {submittedReport.sla_duration_hours} Hours Max
                  </span>
                  <span className="text-[11px] font-mono text-slate-500">
                    (Expires {new Date(submittedReport.sla_deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button
                variant="primary"
                onClick={() => (window.location.href = `?ticket=${submittedReport.id}`)}
                icon={<ArrowRight className="w-4 h-4" />}
              >
                Track Live SLA Status
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setSubmittedReport(null);
                  setDescription('');
                  setAiResult(null);
                }}
                icon={<RotateCcw className="w-4 h-4" />}
              >
                File Another Report
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold tracking-widest uppercase bg-sky-100 text-sky-800 border border-sky-200 px-2 py-0.5 rounded font-mono">
              LSGD Kerala &bull; Challenge SC-08
            </span>
            <span className="text-xs font-mono text-slate-500">
              AI Vision &bull; Deterministic Point-in-Polygon Engine
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-950 tracking-tight">
            Report Canal or Storm-Drain Obstruction
          </h1>
          <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
            Upload photo proof and pinpoint coordinates. The system runs CNN computer vision verification,
            maps coordinates to the responsible Kochi Municipal Corporation Ward Engineering Wing, and issues an SLA-enforced grievance ticket.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Badge variant="inspected" dot className="font-mono text-xs">
            GIS PIP Engine Active
          </Badge>
        </div>
      </div>

      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs p-3.5 rounded-xl flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span className="leading-snug">{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT COLUMN: Spatial Telemetry & Ward Lock */}
          <div className="lg:col-span-6 space-y-5">
            <Card>
              <CardHeader className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-sky-50 text-sky-700 border border-sky-200 flex items-center justify-center font-mono font-bold text-xs">
                    1
                  </div>
                  <h3 className="font-semibold text-xs uppercase tracking-wider text-slate-900">
                    Geotag &amp; Coordinates Picker
                  </h3>
                </div>

                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleUseCurrentLocation}
                  icon={<Navigation className="w-3.5 h-3.5 text-sky-600" />}
                >
                  Use GPS
                </Button>
              </CardHeader>

              <CardBody className="space-y-4">
                {/* Presets */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span className="font-medium">Quick Presets:</span>
                    <span className="text-[11px] text-slate-400 font-mono">5 High-Risk Basins</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {KOCHI_PRESETS.map((p) => (
                      <button
                        key={p.name}
                        type="button"
                        onClick={() => handleSelectPreset(p)}
                        className={`text-xs px-2.5 py-1 rounded-lg border transition-all cursor-pointer font-medium ${
                          lat === p.lat && lng === p.lng
                            ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                        }`}
                      >
                        {p.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Map container */}
                <div className="space-y-1.5">
                  <div className="relative border border-slate-200 rounded-xl overflow-hidden">
                    <div ref={mapContainerRef} className="w-full h-52 z-0" />
                    <div className="absolute top-2 left-2 z-10 bg-slate-950/80 backdrop-blur-sm text-slate-200 px-2.5 py-1 rounded-md text-[11px] font-mono border border-slate-800">
                      Target: {lat.toFixed(5)}°N, {lng.toFixed(5)}°E
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 flex items-center justify-between">
                    <span>Click anywhere on the map or drag the pin to pinpoint obstruction.</span>
                    <span className="font-mono text-[10px] text-slate-400">EPSG:4326</span>
                  </p>
                </div>

                {/* Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label="Road / Canal Stretch:"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. Subhash Chandra Bose Road"
                    required
                  />
                  <Input
                    label="Prominent Landmark:"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    placeholder="e.g. Near Kadavanthra Culvert Bridge"
                  />
                </div>
              </CardBody>
            </Card>

            {/* WARD LOCK HUD */}
            <div className="rounded-xl border border-slate-800 bg-slate-950 text-slate-100 p-5 space-y-4 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  <div className="font-mono font-bold text-xs uppercase tracking-wider text-slate-200">
                    Spatial Ward Engine Lock
                  </div>
                </div>

                {resolvingWard ? (
                  <span className="text-xs font-mono text-sky-400 animate-pulse">
                    Computing Polygon...
                  </span>
                ) : (
                  <Badge variant="resolved" className="font-mono text-[10px]">
                    POLYGON VERIFIED
                  </Badge>
                )}
              </div>

              {wardInfo ? (
                <div className="space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-3 border-b border-slate-800/80 pb-3">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-mono">Jurisdictional Ward:</span>
                      <strong className="text-white text-sm font-semibold">
                        Ward {wardInfo.number} - {wardInfo.name}
                      </strong>
                      <div className="text-xs text-slate-400 mt-0.5">{wardInfo.local_body}</div>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-mono">Canal Basin &amp; Zone:</span>
                      <strong className="text-sky-300 text-xs font-medium block">
                        {wardInfo.canal_basin}
                      </strong>
                      <div className="text-xs text-slate-400 mt-0.5">{wardInfo.zone}</div>
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-0.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Designated AE (LSGD Wing):</span>
                      <span className="font-semibold text-slate-100">{wardInfo.assistant_engineer}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>Field Overseer:</span>
                      <span className="text-slate-300">{wardInfo.overseer}</span>
                    </div>
                  </div>

                  <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-2.5 flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400">Statutory SLA Window:</span>
                    <span className="text-emerald-400 font-bold">
                      {currentSeverityObj.sla}h Response Target
                    </span>
                  </div>
                </div>
              ) : (
                <div className="py-6 text-center text-xs text-slate-400 font-mono">
                  Calculating point-in-polygon coordinates against Kochi Corporation boundaries...
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Evidence & Incident Details */}
          <div className="lg:col-span-6 space-y-5">
            <Card>
              <CardHeader className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-sky-50 text-sky-700 border border-sky-200 flex items-center justify-center font-mono font-bold text-xs">
                    2
                  </div>
                  <h3 className="font-semibold text-xs uppercase tracking-wider text-slate-900">
                    Photographic Proof &amp; AI Analysis
                  </h3>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">Public Audit Evidence</span>
              </CardHeader>

              <CardBody className="space-y-4">
                {/* Photo Upload */}
                <div className="space-y-2">
                  <div className="relative border-2 border-dashed border-slate-200 rounded-xl p-3 text-center bg-slate-50/70 hover:bg-slate-50 transition-colors">
                    {photoBase64 || photoUrl ? (
                      <div className="space-y-3">
                        <div className="relative rounded-lg overflow-hidden border border-slate-200">
                          <img
                            src={photoBase64 || photoUrl}
                            alt="Obstruction preview"
                            className="w-full h-44 object-cover"
                          />
                          <div className="absolute bottom-2 left-2 bg-slate-950/70 text-white text-[10px] font-mono px-2 py-0.5 rounded">
                            Evidence Attached
                          </div>
                        </div>
                        <div className="flex items-center justify-center gap-2">
                          <label className="btn-secondary text-xs inline-flex items-center gap-1.5 cursor-pointer">
                            <Upload className="w-3.5 h-3.5 text-slate-600" />
                            <span>{uploading ? 'Processing File...' : 'Upload Different Photo'}</span>
                            <input
                              type="file"
                              accept="image/*"
                              capture="environment"
                              onChange={handlePhotoUpload}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>
                    ) : (
                      <label className="cursor-pointer block py-7">
                        <div className="w-10 h-10 bg-slate-100 border border-slate-200 rounded-lg flex items-center justify-center text-slate-500 mx-auto mb-2.5">
                          <Camera className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-semibold text-slate-800 block">
                          Take Photo or Select Evidence File
                        </span>
                        <span className="text-xs text-slate-500 block mt-0.5">
                          JPG, PNG up to 10MB (Geotag preserved)
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          capture="environment"
                          onChange={handlePhotoUpload}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>

                  {/* AI Detection Pill */}
                  {analyzingAI && (
                    <div className="bg-sky-50 border border-sky-200 p-3 rounded-lg flex items-center gap-2 text-xs text-sky-800 animate-pulse">
                      <Sparkles className="w-4 h-4 text-sky-600 animate-spin" />
                      <span>CNN analyzing water condition and cross-sectional blockage...</span>
                    </div>
                  )}

                  {aiResult && !analyzingAI && (
                    <div className="bg-emerald-50 border border-emerald-300 p-3.5 rounded-xl space-y-1.5 text-xs">
                      <div className="flex items-center justify-between font-bold text-emerald-900">
                        <span className="flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4 text-emerald-600" />
                          <span>AI Vision Verified: {aiResult.category}</span>
                        </span>
                        <span className="bg-emerald-100 px-2 py-0.5 rounded text-[11px] font-mono border border-emerald-300">
                          {aiResult.confidence_percentage}% Confidence
                        </span>
                      </div>
                      <p className="text-xs text-emerald-800 leading-snug">
                        {aiResult.ai_remarks} Suggested Priority: <strong>{aiResult.suggested_severity}</strong>.
                      </p>
                    </div>
                  )}
                </div>

                {/* Blockage Nature */}
                <Select
                  label="Blockage Nature & Debris Type:"
                  value={blockageType}
                  onChange={(e) => setBlockageType(e.target.value)}
                  helperText={BLOCKAGE_TYPES.find((b) => b.id === blockageType)?.desc}
                >
                  {BLOCKAGE_TYPES.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.title}
                    </option>
                  ))}
                </Select>

                {/* Severity */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-700">
                    Severity &amp; Inundation Hazard:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {SEVERITY_LEVELS.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setSeverity(s.id)}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          severity === s.id
                            ? `${s.badge} border-2 font-bold shadow-xs`
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="text-xs font-bold">{s.name}</div>
                        <div className="text-[11px] font-mono mt-0.5 opacity-80">{s.sla}h SLA Limit</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700">
                    Observation &amp; Waterflow Impact:
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                    placeholder="Describe obstruction extent, water stagnation, or backflow into road..."
                    className="w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-600"
                    required
                  />
                </div>

                {/* Reporter Contact Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                  <Input
                    label="Your Name / Resident Title:"
                    value={reporterName}
                    onChange={(e) => setReporterName(e.target.value)}
                    placeholder="e.g. Abhiram Menon"
                  />
                  <Input
                    label="Phone (SMS Updates & Points):"
                    type="tel"
                    value={reporterPhone}
                    onChange={(e) => setReporterPhone(e.target.value)}
                    placeholder="+91 94470 12345"
                  />
                </div>
              </CardBody>

              <CardFooter>
                <Button
                  type="submit"
                  variant="primary"
                  loading={submitting || uploading}
                  icon={<FileCheck className="w-4 h-4" />}
                  className="w-full"
                >
                  Submit Blockage Report &amp; Issue Ticket (+10 Points)
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
};
