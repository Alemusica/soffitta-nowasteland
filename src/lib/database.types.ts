// ================================================
// SOFFITTA - NoWasteLand
// Database Types (generato da Supabase CLI)
// ================================================
// Esegui `npm run db:types` per rigenerare da schema reale

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type ItemCondition = 'nuovo' | 'ottimo' | 'buono' | 'usato' | 'da_riparare';
export type ItemVisibility = 'private' | 'public' | 'group';
export type SharingMode = 'prestito' | 'baratto' | 'offerta' | 'noleggio';
export type TransactionStatus = 'pending' | 'confirmed' | 'in_progress' | 'returned' | 'completed' | 'disputed' | 'cancelled';
export type ConversationStatus = 'active' | 'completed' | 'cancelled' | 'reported';
export type ReportStatus = 'pending' | 'reviewed' | 'actioned' | 'dismissed';
export type ReportReason = 'spam' | 'illegal' | 'harassment' | 'fake' | 'inappropriate' | 'other';
export type GroupRole = 'admin' | 'moderator' | 'member';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string;
          avatar_url: string | null;
          bio: string | null;
          phone: string | null;
          height_cm: number | null;
          approx_location: unknown | null; // PostGIS geography
          city: string | null;
          neighborhood: string | null;
          phone_verified: boolean;
          identity_verified: boolean;
          identity_verified_at: string | null;
          stripe_customer_id: string | null;
          stripe_connect_account_id: string | null;
          trust_score: number;
          badges: string[];
          total_transactions: number;
          successful_transactions: number;
          prefers_voice_input: boolean;
          neuron_nudge_enabled: boolean;
          neuron_nudge_frequency: number;
          locale: string;
          created_at: string;
          updated_at: string;
          last_active_at: string;
        };
        Insert: {
          id: string;
          display_name: string;
          avatar_url?: string | null;
          bio?: string | null;
          phone?: string | null;
          height_cm?: number | null;
          city?: string | null;
          neighborhood?: string | null;
          prefers_voice_input?: boolean;
          neuron_nudge_enabled?: boolean;
          neuron_nudge_frequency?: number;
          locale?: string;
        };
        Update: {
          display_name?: string;
          avatar_url?: string | null;
          bio?: string | null;
          phone?: string | null;
          height_cm?: number | null;
          city?: string | null;
          neighborhood?: string | null;
          phone_verified?: boolean;
          identity_verified?: boolean;
          identity_verified_at?: string | null;
          prefers_voice_input?: boolean;
          neuron_nudge_enabled?: boolean;
          neuron_nudge_frequency?: number;
          locale?: string;
          last_active_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          name_it: string;
          parent_id: string | null;
          icon: string | null;
          suggested_labels: string[] | null;
          sort_order: number;
          is_active: boolean;
        };
        Insert: {
          name: string;
          name_it: string;
          parent_id?: string | null;
          icon?: string | null;
          suggested_labels?: string[] | null;
          sort_order?: number;
        };
        Update: {
          name?: string;
          name_it?: string;
          parent_id?: string | null;
          icon?: string | null;
          suggested_labels?: string[] | null;
          sort_order?: number;
          is_active?: boolean;
        };
      };
      items: {
        Row: {
          id: string;
          owner_id: string;
          name: string;
          description: string | null;
          category_id: string | null;
          custom_tags: string[];
          estimated_length_cm: number | null;
          estimated_width_cm: number | null;
          estimated_height_cm: number | null;
          weight_grams: number | null;
          condition: ItemCondition;
          labels: string[];
          visibility: ItemVisibility;
          sharing_mode: SharingMode | null;
          price_cents: number | null;
          deposit_cents: number | null;
          location_room: string | null;
          location_furniture: string | null;
          location_detail: string | null;
          photos: string[];
          voice_note_url: string | null;
          is_currently_lent: boolean;
          lent_to_user_id: string | null;
          lent_at: string | null;
          expected_return_at: string | null;
          view_count: number;
          request_count: number;
          created_at: string;
          updated_at: string;
          last_used_at: string | null;
        };
        Insert: {
          owner_id: string;
          name: string;
          description?: string | null;
          category_id?: string | null;
          custom_tags?: string[];
          estimated_length_cm?: number | null;
          estimated_width_cm?: number | null;
          estimated_height_cm?: number | null;
          weight_grams?: number | null;
          condition?: ItemCondition;
          labels?: string[];
          visibility?: ItemVisibility;
          sharing_mode?: SharingMode | null;
          price_cents?: number | null;
          deposit_cents?: number | null;
          location_room?: string | null;
          location_furniture?: string | null;
          location_detail?: string | null;
          photos?: string[];
          voice_note_url?: string | null;
        };
        Update: {
          name?: string;
          description?: string | null;
          category_id?: string | null;
          custom_tags?: string[];
          estimated_length_cm?: number | null;
          estimated_width_cm?: number | null;
          estimated_height_cm?: number | null;
          weight_grams?: number | null;
          condition?: ItemCondition;
          labels?: string[];
          visibility?: ItemVisibility;
          sharing_mode?: SharingMode | null;
          price_cents?: number | null;
          deposit_cents?: number | null;
          location_room?: string | null;
          location_furniture?: string | null;
          location_detail?: string | null;
          photos?: string[];
          voice_note_url?: string | null;
          is_currently_lent?: boolean;
          lent_to_user_id?: string | null;
          lent_at?: string | null;
          expected_return_at?: string | null;
          last_used_at?: string | null;
        };
      };
      conversations: {
        Row: {
          id: string;
          item_id: string | null;
          requester_id: string;
          owner_id: string;
          status: ConversationStatus;
          transaction_type: SharingMode | null;
          agreed_price_cents: number | null;
          deposit_held_cents: number | null;
          created_at: string;
          updated_at: string;
          last_message_at: string;
        };
        Insert: {
          item_id?: string | null;
          requester_id: string;
          owner_id: string;
          transaction_type?: SharingMode | null;
        };
        Update: {
          status?: ConversationStatus;
          transaction_type?: SharingMode | null;
          agreed_price_cents?: number | null;
          deposit_held_cents?: number | null;
          last_message_at?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          sender_id: string;
          content: string;
          is_system_message: boolean;
          created_at: string;
          read_at: string | null;
        };
        Insert: {
          conversation_id: string;
          sender_id: string;
          content: string;
          is_system_message?: boolean;
        };
        Update: {
          content?: string;
          read_at?: string | null;
        };
      };
      transactions: {
        Row: {
          id: string;
          conversation_id: string | null;
          item_id: string | null;
          lender_id: string;
          borrower_id: string;
          type: SharingMode;
          amount_cents: number | null;
          deposit_cents: number | null;
          platform_fee_cents: number | null;
          stripe_payment_intent_id: string | null;
          status: TransactionStatus;
          started_at: string | null;
          expected_return_at: string | null;
          returned_at: string | null;
          completed_at: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          conversation_id?: string | null;
          item_id?: string | null;
          lender_id: string;
          borrower_id: string;
          type: SharingMode;
          amount_cents?: number | null;
          deposit_cents?: number | null;
          expected_return_at?: string | null;
          notes?: string | null;
        };
        Update: {
          status?: TransactionStatus;
          started_at?: string | null;
          returned_at?: string | null;
          completed_at?: string | null;
          notes?: string | null;
        };
      };
      reviews: {
        Row: {
          id: string;
          transaction_id: string;
          reviewer_id: string;
          reviewed_user_id: string;
          rating: number;
          comment: string | null;
          punctuality_rating: number | null;
          condition_rating: number | null;
          communication_rating: number | null;
          created_at: string;
        };
        Insert: {
          transaction_id: string;
          reviewer_id: string;
          reviewed_user_id: string;
          rating: number;
          comment?: string | null;
          punctuality_rating?: number | null;
          condition_rating?: number | null;
          communication_rating?: number | null;
        };
        Update: never;
      };
      groups: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          code: string;
          approx_location: unknown | null;
          city: string | null;
          created_by: string;
          member_count: number;
          settings: Json;
          created_at: string;
        };
        Insert: {
          name: string;
          description?: string | null;
          code: string;
          city?: string | null;
          created_by: string;
          settings?: Json;
        };
        Update: {
          name?: string;
          description?: string | null;
          city?: string | null;
          member_count?: number;
          settings?: Json;
        };
      };
      group_members: {
        Row: {
          group_id: string;
          user_id: string;
          role: GroupRole;
          joined_at: string;
        };
        Insert: {
          group_id: string;
          user_id: string;
          role?: GroupRole;
        };
        Update: {
          role?: GroupRole;
        };
      };
      location_queries: {
        Row: {
          id: string;
          user_id: string;
          query_text: string | null;
          item_found_id: string | null;
          was_nudged: boolean;
          user_remembered_alone: boolean | null;
          created_at: string;
        };
        Insert: {
          user_id: string;
          query_text?: string | null;
          item_found_id?: string | null;
          was_nudged?: boolean;
          user_remembered_alone?: boolean | null;
        };
        Update: {
          item_found_id?: string | null;
          was_nudged?: boolean;
          user_remembered_alone?: boolean | null;
        };
      };
    };
    Functions: {
      search_nearby_items: {
        Args: {
          user_lat: number;
          user_lng: number;
          radius_km?: number;
          search_query?: string | null;
          category_filter?: string | null;
          limit_count?: number;
        };
        Returns: {
          id: string;
          name: string;
          description: string | null;
          category_id: string | null;
          photos: string[];
          labels: string[];
          sharing_mode: SharingMode | null;
          price_cents: number | null;
          owner_id: string;
          owner_display_name: string;
          owner_avatar_url: string | null;
          owner_trust_score: number;
          distance_meters: number;
        }[];
      };
    };
  };
}

// Alias per comodità
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

export type Item = Database['public']['Tables']['items']['Row'];
export type ItemInsert = Database['public']['Tables']['items']['Insert'];
export type ItemUpdate = Database['public']['Tables']['items']['Update'];

export type Category = Database['public']['Tables']['categories']['Row'];

export type Conversation = Database['public']['Tables']['conversations']['Row'];
export type Message = Database['public']['Tables']['messages']['Row'];
export type Transaction = Database['public']['Tables']['transactions']['Row'];
export type Review = Database['public']['Tables']['reviews']['Row'];
export type Group = Database['public']['Tables']['groups']['Row'];
export type GroupMember = Database['public']['Tables']['group_members']['Row'];
export type LocationQuery = Database['public']['Tables']['location_queries']['Row'];

// Type per risultati ricerca nearby
export type NearbyItem = Database['public']['Functions']['search_nearby_items']['Returns'][number];
