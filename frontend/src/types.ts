export type BlockageType =
  | 'SILT_ACCUMULATION'
  | 'PLASTIC_SOLID_WASTE'
  | 'CULVERT_CHOKE'
  | 'WEED_HYACINTH'
  | 'CONSTRUCTION_DEBRIS';

export type SeverityLevel = 'CRITICAL' | 'HIGH' | 'MODERATE' | 'MINOR';

export type ReportStatus =
  | 'REPORTED'
  | 'INSPECTED'
  | 'IN_PROGRESS'
  | 'RESOLVED'
  | 'ESCALATED_L1'
  | 'ESCALATED_L2'
  | 'ESCALATED_L3'
  | 'ESCALATED_L4';

export interface Point {
  lat: number;
  lng: number;
}

export interface Ward {
  id: string;
  number: number;
  name: string;
  zone: string;
  local_body: string;
  canal_basin: string;
  councillor: string;
  assistant_engineer: string;
  overseer: string;
  health_inspector: string;
  office_address: string;
  helpline_phone: string;
  control_room_phone: string;
  polygon: Point[];
}

export interface TimelineEvent {
  timestamp: string;
  status: ReportStatus;
  actor: string;
  actor_role: string;
  description: string;
}

export interface Report {
  id: string;
  created_at: string;
  updated_at: string;
  latitude: number;
  longitude: number;
  address: string;
  landmark: string;
  ward_id: string;
  ward_number: number;
  ward_name: string;
  zone: string;
  local_body: string;
  canal_basin: string;
  authority_name: string;
  overseer: string;
  health_inspector: string;
  blockage_type: BlockageType;
  severity: SeverityLevel;
  description: string;
  photo_url: string;
  resolution_photo_url?: string;
  reporter_name: string;
  reporter_phone: string;
  status: ReportStatus;
  sla_deadline: string;
  sla_duration_hours: number;
  escalation_level: number;
  escalated_at?: string;
  escalation_reason?: string;
  assigned_crew?: string;
  official_remarks?: string;
  timeline: TimelineEvent[];
}

export interface Stats {
  total_reports: number;
  active_blockages: number;
  in_progress: number;
  resolved: number;
  escalated_count: number;
  critical_flood_risk: number;
  avg_resolution_hours: number;
  ward_breakdown: Record<string, number>;
  blockage_type_counts: Record<string, number>;
}

export interface UserLeaderboardItem {
  name: string;
  phone?: string;
  points: number;
  reports_count: number;
  badge: string;
}

export interface AIAnalysisResult {
  status: string;
  category: string;
  is_choked_or_polluted: boolean;
  confidence_percentage: number;
  suggested_severity: SeverityLevel;
  suggested_blockage_type: BlockageType;
  civic_points_awarded: number;
  ai_remarks: string;
}

export interface GeoJSONFeature {
  type: 'Feature';
  properties: {
    id: string;
    number: number;
    name: string;
    zone: string;
    local_body: string;
    canal_basin: string;
    councillor: string;
    assistant_engineer: string;
    helpline_phone: string;
    active_reports?: number;
  };
  geometry: {
    type: 'Polygon';
    coordinates: number[][][];
  };
}

export interface GeoJSONFeatureCollection {
  type: 'FeatureCollection';
  features: GeoJSONFeature[];
}
