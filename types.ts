
import React from 'react';

// FIX: Added WebCallResponse interface for web call session data.
export interface WebCallResponse {
  call_id: string;
  access_token: string;
}

// FIX: Added TranscriptEntry interface for live call transcriptions.
export interface TranscriptEntry {
  role: 'agent' | 'user';
  content: string;
}

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export enum CallStatus {
  Completed = 'completed',
  Active = 'active',
  Missed = 'missed',
}

export interface RecentCall {
  id: number;
  name: string;
  recipient_number: string;
  duration: string;
  status: CallStatus;
  timeAgo: string;
  sentiment: string | null;
}

export interface StatCardData {
  id: string;
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  icon: React.ReactElement;
}

export type Database = {
  public: {
    Tables: {
      call_history: {
        Row: {
          id: number;
          created_at: string;
          caller_number: string | null;
          recipient_number: string | null;
          call_duration: number | null;
          recording_url: string | null;
          transcript: string | null;
          tour_date: string | null;
          name: string | null;
          disconnection_reason: string | null;
        };
        Insert: {
          id?: number;
          created_at?: string;
          caller_number?: string | null;
          recipient_number?: string | null;
          call_duration?: number | null;
          recording_url?: string | null;
          transcript?: string | null;
          tour_date?: string | null;
          name?: string | null;
          disconnection_reason?: string | null;
        };
        Update: {
          id?: number;
          created_at?: string;
          caller_number?: string | null;
          recipient_number?: string | null;
          call_duration?: number | null;
          recording_url?: string | null;
          transcript?: string | null;
          tour_date?: string | null;
          name?: string | null;
          disconnection_reason?: string | null;
        };
        // FIX: Added missing Relationships array for Supabase type inference.
        Relationships: [];
      };
      semantic_analysis: {
        Row: {
          id: number;
          created_at: string;
          call_id: number | null;
          sentiment: string | null;
          sentiment_score: number | null;
          agent_confidence: number | null;
          positive_indicators: Json | null;
          negative_indicators: Json | null;
          predicted_outcome: string | null;
          alert_status: string | null;
          finish_reason: string | null;
          stop: string | null;
          conversation_duration_seconds: number | null;
          total_customer_words: number | null;
          agent_talk_time_percentage: number | null;
          buying_signals: Json | null;
          summary: string | null;
        };
        Insert: {
          id?: number;
          created_at?: string;
          call_id?: number | null;
          sentiment?: string | null;
          sentiment_score?: number | null;
          agent_confidence?: number | null;
          positive_indicators?: Json | null;
          negative_indicators?: Json | null;
          predicted_outcome?: string | null;
          alert_status?: string | null;
          finish_reason?: string | null;
          stop?: string | null;
          conversation_duration_seconds?: number | null;
          total_customer_words?: number | null;
          agent_talk_time_percentage?: number | null;
          buying_signals?: Json | null;
          summary?: string | null;
        };
        Update: {
          id?: number;
          created_at?: string;
          call_id?: number | null;
          sentiment?: string | null;
          sentiment_score?: number | null;
          agent_confidence?: number | null;
          positive_indicators?: Json | null;
          negative_indicators?: Json | null;
          predicted_outcome?: string | null;
          alert_status?: string | null;
          finish_reason?: string | null;
          stop?: string | null;
          conversation_duration_seconds?: number | null;
          total_customer_words?: number | null;
          agent_talk_time_percentage?: number | null;
          buying_signals?: Json | null;
          summary?: string | null;
        };
        // FIX: Added missing Relationships definition for Supabase type inference.
        Relationships: [
          {
            foreignKeyName: 'semantic_analysis_call_id_fkey';
            columns: ['call_id'];
            referencedRelation: 'call_history';
            referencedColumns: ['id'];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
  };
}

export type Conversation = Database['public']['Tables']['call_history']['Row'];