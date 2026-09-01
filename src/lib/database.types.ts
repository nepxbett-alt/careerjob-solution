/**
 * Supabase schema types for Career Job Solution.
 * Practical subset aligned with migrations — extend as needed.
 */
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

/** Loose row shape used where full generated types are not available */
export type DbRow = Record<string, unknown>;

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
          created_at?: string;
          updated_at?: string;
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
          is_featured: boolean | null;
          approved_by_agency: boolean;
          category_id: string | null;
          organization_id: string | null;
          created_at: string;
          published_at: string | null;
        };
        Insert: DbRow;
        Update: DbRow;
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
        Insert: DbRow;
        Update: DbRow;
        Relationships: [];
      };
      application_status_history: {
        Row: DbRow;
        Insert: DbRow;
        Update: DbRow;
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
          headline?: string | null;
          bio?: string | null;
          experience_years?: number | null;
          languages?: string[] | null;
          photo_url?: string | null;
        };
        Insert: DbRow;
        Update: DbRow;
        Relationships: [];
      };
      candidate_documents: {
        Row: DbRow;
        Insert: DbRow;
        Update: DbRow;
        Relationships: [];
      };
      organizations: {
        Row: DbRow;
        Insert: DbRow;
        Update: DbRow;
        Relationships: [];
      };
      organization_members: {
        Row: DbRow;
        Insert: DbRow;
        Update: DbRow;
        Relationships: [];
      };
      business_requests: {
        Row: DbRow;
        Insert: DbRow;
        Update: DbRow;
        Relationships: [];
      };
      saved_jobs: {
        Row: DbRow;
        Insert: DbRow;
        Update: DbRow;
        Relationships: [];
      };
      interviews: {
        Row: DbRow;
        Insert: DbRow;
        Update: DbRow;
        Relationships: [];
      };
      placements: {
        Row: DbRow;
        Insert: DbRow;
        Update: DbRow;
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
        Insert: DbRow;
        Update: DbRow;
        Relationships: [];
      };
      transactions: {
        Row: DbRow;
        Insert: DbRow;
        Update: DbRow;
        Relationships: [];
      };
      audit_logs: {
        Row: DbRow;
        Insert: DbRow;
        Update: DbRow;
        Relationships: [];
      };
      job_categories: {
        Row: { id: string; name: string; slug: string };
        Insert: DbRow;
        Update: DbRow;
        Relationships: [];
      };
      agency_settings: {
        Row: DbRow;
        Insert: DbRow;
        Update: DbRow;
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
    CompositeTypes: Record<string, never>;
  };
}
