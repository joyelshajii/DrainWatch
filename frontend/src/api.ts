import type { GeoJSONFeatureCollection, Report, Stats, Ward, UserLeaderboardItem, AIAnalysisResult } from './types';

const API_BASE = '/api';

export async function fetchWards(): Promise<GeoJSONFeatureCollection> {
  const res = await fetch(`${API_BASE}/wards`);
  if (!res.ok) throw new Error('Failed to load wards data');
  return res.json();
}

export async function lookupWard(lat: number, lng: number): Promise<{ found: boolean; ward: Ward }> {
  const res = await fetch(`${API_BASE}/lookup?lat=${lat}&lng=${lng}`);
  if (!res.ok) throw new Error('Failed to lookup ward');
  return res.json();
}

export async function fetchReports(filters?: {
  ward_id?: string;
  status?: string;
  severity?: string;
  search?: string;
}): Promise<Report[]> {
  const params = new URLSearchParams();
  if (filters?.ward_id) params.set('ward_id', filters.ward_id);
  if (filters?.status) params.set('status', filters.status);
  if (filters?.severity) params.set('severity', filters.severity);
  if (filters?.search) params.set('search', filters.search);

  const res = await fetch(`${API_BASE}/reports?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to load reports');
  return res.json();
}

export async function fetchReportById(id: string): Promise<Report> {
  const res = await fetch(`${API_BASE}/reports/${encodeURIComponent(id)}`);
  if (!res.ok) throw new Error('Ticket not found');
  return res.json();
}

export async function createReport(data: {
  latitude: number;
  longitude: number;
  address?: string;
  landmark?: string;
  blockage_type: string;
  severity: string;
  description: string;
  photo_base64?: string;
  photo_url?: string;
  reporter_name?: string;
  reporter_phone?: string;
}): Promise<Report> {
  const res = await fetch(`${API_BASE}/reports`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to submit report');
  }
  return res.json();
}

export async function updateReportStatus(
  id: string,
  data: {
    status: string;
    actor?: string;
    actor_role?: string;
    remarks?: string;
    assigned_crew?: string;
    resolution_photo_url?: string;
  }
): Promise<Report> {
  const res = await fetch(`${API_BASE}/reports/${encodeURIComponent(id)}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to update ticket status');
  }
  return res.json();
}

export async function escalateReport(
  id: string,
  data: {
    reason?: string;
    actor?: string;
    actor_role?: string;
  }
): Promise<Report> {
  const res = await fetch(`${API_BASE}/reports/${encodeURIComponent(id)}/escalate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to escalate ticket');
  }
  return res.json();
}

export async function fetchStats(): Promise<Stats> {
  const res = await fetch(`${API_BASE}/stats`);
  if (!res.ok) throw new Error('Failed to load statistics');
  return res.json();
}

export async function fetchLeaderboard(): Promise<UserLeaderboardItem[]> {
  const res = await fetch(`${API_BASE}/leaderboard`);
  if (!res.ok) throw new Error('Failed to load civic leaderboard');
  return res.json();
}

export async function analyzePhotoAI(file: File): Promise<AIAnalysisResult> {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${API_BASE}/ai/analyze`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'AI image analysis failed');
  }
  return res.json();
}

export async function uploadFile(file: File): Promise<{ url: string; filename: string }> {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error('Failed to upload photo');
  return res.json();
}
