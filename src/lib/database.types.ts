export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type UserRole =
  | 'candidate'
  | 'business'
  | 'owner'
  | 'admin'
  | 'recruiter'
  | 'staff'
  | 'accountant'
  | 'viewer';

export type ApplicationStatus =
  | 'applied'
  | 'under_review'
  | 'shortlisted'
  | 'interview'
  | 'selected'
  | 'placed'
  | 'rejected'
  | 'withdrawn'
  | 'closed';

export type JobStatus = 'draft' | 'pending_review' | 'published' | 'paused' | 'closed' | 'filled';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: UserRole;
          full_name: string | null;
          phone: string | null;
          email: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          role?: UserRole;
          full_name?: string | null;
          phone?: string | null;
          email?: string | null;
          avatar_url?: string | null;
        };
        Update: {
          role?: UserRole;
          full_name?: string | null;
          phone?: string | null;
          email?: string | null;
          avatar_url?: string | null;
        };
        Relationships: [];
      };
      jobs: {
        Row: {
          id: string;
          title: string;
          location: string;
          location_detail: string | null;
          salary_display: string | null;
          salary_min: number | null;
          salary_max: number | null;
          job_type: string;
          experience_required: string | null;
          education_required: string | null;
          description: string | null;
          responsibilities: string | null;
          requirements: string | null;
          skills: string[] | null;
          benefits: string | null;
          application_deadline: string | null;
          status: string;
          public_employer_label: string | null;
          approved_by_agency: boolean;
          category_id: string | null;
          organization_id: string | null;
          created_at: string;
          published_at: string | null;
        };
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
        Relationships: [];
      };
      applications: {
        Row: {
          id: string;
          job_id: string;
          candidate_id: string;
          status: ApplicationStatus;
          cover_message: string | null;
          applied_at: string;
          updated_at: string;
        };
        Insert: {
          job_id: string;
          candidate_id: string;
          status?: ApplicationStatus;
          cover_message?: string | null;
        };
        Update: {
          status?: ApplicationStatus;
          cover_message?: string | null;
        };
        Relationships: [];
      };
      candidate_profiles: {
        Row: {
          id: string;
          user_id: string;
          full_name: string;
          phone: string;
          location: string | null;
          profile_completion: number;
          cv_url: string | null;
          email: string | null;
          skills: string[] | null;
          education: string | null;
          is_verified: boolean;
          created_at: string;
        };
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
        Relationships: [];
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          body: string | null;
          type: string;
          is_read: boolean;
          entity_type: string | null;
          entity_id: string | null;
          created_at: string;
        };
        Insert: {
          user_id: string;
          title: string;
          body?: string | null;
          type?: string;
          entity_type?: string | null;
          entity_id?: string | null;
        };
        Update: { is_read?: boolean };
        Relationships: [];
      };
      application_status_history: {
        Row: {
          id: string;
          application_id: string;
          from_status: string | null;
          to_status: string;
          changed_by: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          application_id: string;
          from_status?: string | null;
          to_status: string;
          changed_by?: string | null;
          notes?: string | null;
        };
        Update: Record<string, never>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_staff: { Args: Record<string, never>; Returns: boolean };
      create_notification_safe: {
        Args: {
          p_user_id: string;
          p_title: string;
          p_body?: string;
          p_type?: string;
          p_entity_type?: string;
          p_entity_id?: string;
        };
        Returns: string;
      };
    };
    Enums: Record<string, never>;
  };
}
