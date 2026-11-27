// DB 타입 — supabase/migrations/20261117000000_init.sql 과 맞춘다 (docs/FEATURES.md §5).
// 스키마를 바꾸면 이 파일도 함께 고친다. (Supabase CLI 가 생기면 `supabase gen types` 로 대체)
// Insert/Update 는 컬럼 권한(migration 의 grant)과 같게 둔다: 사용자가 쓸 수 있는 컬럼만.

import type { Category, Emotion } from "@/content/taxonomy";

export type Database = {
  public: {
    Tables: {
      profiles: {
        // phone 은 API 로 읽을 수 없다 (컬럼 권한). select("*") 대신 컬럼을 지정할 것.
        Row: {
          id: string;
          display_name: string;
          prior_job: string | null;
          reasons: string[];
          message: string | null;
          member_no: number;
          pledged_at: string | null;
          is_seed: boolean;
          created_at: string;
        };
        Insert: never;
        Update: {
          display_name?: string;
          prior_job?: string | null;
          reasons?: string[];
          message?: string | null;
        };
        Relationships: [];
      };
      feelings: {
        Row: {
          id: string;
          user_id: string;
          emotion: Emotion;
          /** 사용자가 고른 색상 0~359 (migrations/20261127000000_feeling_hue.sql) */
          hue: number;
          body: string;
          is_seed: boolean;
          created_at: string;
        };
        Insert: { emotion: Emotion; hue: number; body: string };
        Update: never;
        Relationships: [
          { foreignKeyName: "feelings_user_id_fkey"; columns: ["user_id"]; referencedRelation: "profiles"; referencedColumns: ["id"] },
        ];
      };
      posts: {
        Row: {
          id: string;
          user_id: string;
          category: Category;
          title: string;
          body: string;
          is_pinned: boolean;
          is_seed: boolean;
          created_at: string;
        };
        Insert: { category: Category; title: string; body: string };
        Update: { category?: Category; title?: string; body?: string };
        Relationships: [
          { foreignKeyName: "posts_user_id_fkey"; columns: ["user_id"]; referencedRelation: "profiles"; referencedColumns: ["id"] },
        ];
      };
      comments: {
        Row: {
          id: string;
          post_id: string;
          user_id: string;
          body: string;
          is_seed: boolean;
          created_at: string;
        };
        Insert: { post_id: string; body: string };
        Update: { body?: string };
        Relationships: [
          { foreignKeyName: "comments_post_id_fkey"; columns: ["post_id"]; referencedRelation: "posts"; referencedColumns: ["id"] },
          { foreignKeyName: "comments_user_id_fkey"; columns: ["user_id"]; referencedRelation: "profiles"; referencedColumns: ["id"] },
        ];
      };
      reactions: {
        Row: { post_id: string; user_id: string; created_at: string };
        Insert: { post_id: string };
        Update: never;
        Relationships: [
          { foreignKeyName: "reactions_post_id_fkey"; columns: ["post_id"]; referencedRelation: "posts"; referencedColumns: ["id"] },
          { foreignKeyName: "reactions_user_id_fkey"; columns: ["user_id"]; referencedRelation: "profiles"; referencedColumns: ["id"] },
        ];
      };
    };
    Views: Record<never, never>;
    Functions: Record<never, never>;
    Enums: { emotion: Emotion; post_category: Category };
    CompositeTypes: Record<never, never>;
  };
};
