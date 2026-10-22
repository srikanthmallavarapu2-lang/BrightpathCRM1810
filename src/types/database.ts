export type UserRole = 'admin' | 'manager' | 'counsellor';

export type LeadStatus = 'New' | 'Contacted' | 'Qualified' | 'Converted' | 'Lost';

export type FollowUpStatus = 'pending' | 'completed' | 'cancelled';

export type ActivityType = 
  | 'lead_created'
  | 'status_changed'
  | 'follow_up_scheduled'
  | 'follow_up_completed'
  | 'note_added';

export interface Profile {
  id: string;
  full_name: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Lead {
  id: string;
  full_name: string;
  email: string | null;
  phone: string;
  course_interest: string;
  source: string;
  status: LeadStatus;
  lost_reason: string | null;
  assigned_to: string | null;
  created_by: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // Joined relationship fields
  assigned_profile?: Profile | null;
  creator_profile?: Profile | null;
}

export interface FollowUp {
  id: string;
  lead_id: string;
  assigned_to: string | null;
  due_at: string;
  note: string;
  status: FollowUpStatus;
  completed_at: string | null;
  created_by: string | null;
  created_at: string;
  // Joined relationship fields
  lead?: Lead | null;
  assigned_profile?: Profile | null;
}

export interface Activity {
  id: string;
  lead_id: string;
  actor_id: string | null;
  activity_type: ActivityType | string;
  description: string;
  metadata: Record<string, unknown>;
  created_at: string;
  // Joined relationship fields
  actor_profile?: Profile | null;
}

export interface DatabaseHealthStatus {
  isConfigured: boolean;
  isConnected: boolean;
  latencyMs: number | null;
  errorMessage: string | null;
  url: string | null;
  checkedAt: string;
}
