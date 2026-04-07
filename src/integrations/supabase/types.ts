export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      credit_transactions: {
        Row: {
          amount_paid: number
          created_at: string
          hours: number
          id: string
          instructor_id: string
          instructor_notes: string | null
          payment_method: string
          platform_fee: number | null
          status: string
          stripe_payment_intent_id: string | null
          student_id: string
          student_notes: string | null
          transaction_type: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          amount_paid: number
          created_at?: string
          hours: number
          id?: string
          instructor_id: string
          instructor_notes?: string | null
          payment_method?: string
          platform_fee?: number | null
          status?: string
          stripe_payment_intent_id?: string | null
          student_id: string
          student_notes?: string | null
          transaction_type?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          amount_paid?: number
          created_at?: string
          hours?: number
          id?: string
          instructor_id?: string
          instructor_notes?: string | null
          payment_method?: string
          platform_fee?: number | null
          status?: string
          stripe_payment_intent_id?: string | null
          student_id?: string
          student_notes?: string | null
          transaction_type?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: []
      }
      driving_schools: {
        Row: {
          contact_email: string | null
          contact_phone: string | null
          coverage_area: string | null
          created_at: string | null
          id: string
          invite_code: string
          is_active: boolean | null
          logo_url: string | null
          max_instructors: number | null
          name: string
          owner_id: string
        }
        Insert: {
          contact_email?: string | null
          contact_phone?: string | null
          coverage_area?: string | null
          created_at?: string | null
          id?: string
          invite_code: string
          is_active?: boolean | null
          logo_url?: string | null
          max_instructors?: number | null
          name: string
          owner_id: string
        }
        Update: {
          contact_email?: string | null
          contact_phone?: string | null
          coverage_area?: string | null
          created_at?: string | null
          id?: string
          invite_code?: string
          is_active?: boolean | null
          logo_url?: string | null
          max_instructors?: number | null
          name?: string
          owner_id?: string
        }
        Relationships: []
      }
      invite_links: {
        Row: {
          click_count: number
          conversion_count: number
          created_at: string
          expires_at: string
          id: string
          instructor_id: string
          pin_version: number
          token: string
        }
        Insert: {
          click_count?: number
          conversion_count?: number
          created_at?: string
          expires_at: string
          id?: string
          instructor_id: string
          pin_version?: number
          token: string
        }
        Update: {
          click_count?: number
          conversion_count?: number
          created_at?: string
          expires_at?: string
          id?: string
          instructor_id?: string
          pin_version?: number
          token?: string
        }
        Relationships: []
      }
      lesson_plans: {
        Row: {
          common_faults: Json | null
          created_at: string
          id: string
          instructor_id: string
          instructor_tips: string | null
          main_activities: Json | null
          objective: string
          source_session_id: string | null
          source_templates: Json | null
          status: string
          student_id: string
          student_summary: string | null
          title: string
          updated_at: string
          warm_up: string | null
        }
        Insert: {
          common_faults?: Json | null
          created_at?: string
          id?: string
          instructor_id: string
          instructor_tips?: string | null
          main_activities?: Json | null
          objective: string
          source_session_id?: string | null
          source_templates?: Json | null
          status?: string
          student_id: string
          student_summary?: string | null
          title: string
          updated_at?: string
          warm_up?: string | null
        }
        Update: {
          common_faults?: Json | null
          created_at?: string
          id?: string
          instructor_id?: string
          instructor_tips?: string | null
          main_activities?: Json | null
          objective?: string
          source_session_id?: string | null
          source_templates?: Json | null
          status?: string
          student_id?: string
          student_summary?: string | null
          title?: string
          updated_at?: string
          warm_up?: string | null
        }
        Relationships: []
      }
      lesson_types: {
        Row: {
          created_at: string
          description: string | null
          duration_minutes: number
          id: string
          instructor_id: string
          is_active: boolean
          name: string
          price: number
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration_minutes?: number
          id?: string
          instructor_id: string
          is_active?: boolean
          name: string
          price: number
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          duration_minutes?: number
          id?: string
          instructor_id?: string
          is_active?: boolean
          name?: string
          price?: number
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      lessons: {
        Row: {
          color: string | null
          created_at: string
          duration_minutes: number
          id: string
          instructor_id: string
          lesson_type: string
          notes: string | null
          payment_method: string | null
          scheduled_at: string
          status: string
          student_id: string | null
          topic: string | null
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          duration_minutes?: number
          id?: string
          instructor_id: string
          lesson_type?: string
          notes?: string | null
          payment_method?: string | null
          scheduled_at: string
          status?: string
          student_id?: string | null
          topic?: string | null
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          duration_minutes?: number
          id?: string
          instructor_id?: string
          lesson_type?: string
          notes?: string | null
          payment_method?: string | null
          scheduled_at?: string
          status?: string
          student_id?: string | null
          topic?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          is_read: boolean
          receiver_id: string
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_read?: boolean
          receiver_id: string
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_read?: boolean
          receiver_id?: string
          sender_id?: string
        }
        Relationships: []
      }
      mock_test_results: {
        Row: {
          created_at: string
          date: string
          has_dangerous: boolean
          has_serious: boolean
          id: string
          instructor_id: string
          markers: Json
          notes: string | null
          passed: boolean
          student_id: string
          total_minors: number
        }
        Insert: {
          created_at?: string
          date?: string
          has_dangerous?: boolean
          has_serious?: boolean
          id?: string
          instructor_id: string
          markers?: Json
          notes?: string | null
          passed?: boolean
          student_id: string
          total_minors?: number
        }
        Update: {
          created_at?: string
          date?: string
          has_dangerous?: boolean
          has_serious?: boolean
          id?: string
          instructor_id?: string
          markers?: Json
          notes?: string | null
          passed?: boolean
          student_id?: string
          total_minors?: number
        }
        Relationships: []
      }
      notifications: {
        Row: {
          action_label: string | null
          created_at: string
          id: string
          is_read: boolean
          message: string
          metadata: Json | null
          target_tab: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          action_label?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          metadata?: Json | null
          target_tab?: string | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          action_label?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          metadata?: Json | null
          target_tab?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      onboarding_pins: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          instructor_id: string
          is_used: boolean
          pin_code: string
          used_by: string | null
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          instructor_id: string
          is_used?: boolean
          pin_code: string
          used_by?: string | null
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          instructor_id?: string
          is_used?: boolean
          pin_code?: string
          used_by?: string | null
        }
        Relationships: []
      }
      page_views: {
        Row: {
          created_at: string
          device_type: string | null
          id: string
          page: string
          referrer: string | null
          screen_width: number | null
          user_agent: string | null
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          created_at?: string
          device_type?: string | null
          id?: string
          page: string
          referrer?: string | null
          screen_width?: number | null
          user_agent?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          created_at?: string
          device_type?: string | null
          id?: string
          page?: string
          referrer?: string | null
          screen_width?: number | null
          user_agent?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          adi_number: string | null
          avatar_url: string | null
          bio: string | null
          block_10_price: number | null
          block_20_price: number | null
          block_30_price: number | null
          block_booking_enabled: boolean | null
          booking_allowed: boolean | null
          booking_requests_enabled: boolean | null
          car_make: string | null
          car_model: string | null
          car_registration: string | null
          coverage_area: string | null
          created_at: string
          credit_balance: number | null
          email: string
          full_name: string | null
          grade: string | null
          hourly_rate: number | null
          id: string
          instructor_id: string | null
          instructor_onboarded_at: string | null
          instructor_pin: string | null
          level: string | null
          next_lesson: string | null
          notes: string | null
          onboarded_at: string | null
          parent_email: string | null
          phone: string | null
          pin_version: number | null
          prn_encrypted: string | null
          progress: number | null
          school_id: string | null
          school_role: string | null
          secure_pin: string | null
          smart_gaps_ai_mode: boolean
          smart_gaps_enabled: boolean
          status: string | null
          stripe_account_id: string | null
          stripe_account_status: string | null
          stripe_onboarding_complete: boolean | null
          stripe_payouts_enabled: boolean | null
          terms_of_business: string | null
          test_manager: Json | null
          total_hours: number | null
          transmission: string | null
          updated_at: string
          user_id: string
          working_hours: Json | null
          years_experience: string | null
        }
        Insert: {
          address?: string | null
          adi_number?: string | null
          avatar_url?: string | null
          bio?: string | null
          block_10_price?: number | null
          block_20_price?: number | null
          block_30_price?: number | null
          block_booking_enabled?: boolean | null
          booking_allowed?: boolean | null
          booking_requests_enabled?: boolean | null
          car_make?: string | null
          car_model?: string | null
          car_registration?: string | null
          coverage_area?: string | null
          created_at?: string
          credit_balance?: number | null
          email: string
          full_name?: string | null
          grade?: string | null
          hourly_rate?: number | null
          id?: string
          instructor_id?: string | null
          instructor_onboarded_at?: string | null
          instructor_pin?: string | null
          level?: string | null
          next_lesson?: string | null
          notes?: string | null
          onboarded_at?: string | null
          parent_email?: string | null
          phone?: string | null
          pin_version?: number | null
          prn_encrypted?: string | null
          progress?: number | null
          school_id?: string | null
          school_role?: string | null
          secure_pin?: string | null
          smart_gaps_ai_mode?: boolean
          smart_gaps_enabled?: boolean
          status?: string | null
          stripe_account_id?: string | null
          stripe_account_status?: string | null
          stripe_onboarding_complete?: boolean | null
          stripe_payouts_enabled?: boolean | null
          terms_of_business?: string | null
          test_manager?: Json | null
          total_hours?: number | null
          transmission?: string | null
          updated_at?: string
          user_id: string
          working_hours?: Json | null
          years_experience?: string | null
        }
        Update: {
          address?: string | null
          adi_number?: string | null
          avatar_url?: string | null
          bio?: string | null
          block_10_price?: number | null
          block_20_price?: number | null
          block_30_price?: number | null
          block_booking_enabled?: boolean | null
          booking_allowed?: boolean | null
          booking_requests_enabled?: boolean | null
          car_make?: string | null
          car_model?: string | null
          car_registration?: string | null
          coverage_area?: string | null
          created_at?: string
          credit_balance?: number | null
          email?: string
          full_name?: string | null
          grade?: string | null
          hourly_rate?: number | null
          id?: string
          instructor_id?: string | null
          instructor_onboarded_at?: string | null
          instructor_pin?: string | null
          level?: string | null
          next_lesson?: string | null
          notes?: string | null
          onboarded_at?: string | null
          parent_email?: string | null
          phone?: string | null
          pin_version?: number | null
          prn_encrypted?: string | null
          progress?: number | null
          school_id?: string | null
          school_role?: string | null
          secure_pin?: string | null
          smart_gaps_ai_mode?: boolean
          smart_gaps_enabled?: boolean
          status?: string | null
          stripe_account_id?: string | null
          stripe_account_status?: string | null
          stripe_onboarding_complete?: boolean | null
          stripe_payouts_enabled?: boolean | null
          terms_of_business?: string | null
          test_manager?: Json | null
          total_hours?: number | null
          transmission?: string | null
          updated_at?: string
          user_id?: string
          working_hours?: Json | null
          years_experience?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "driving_schools"
            referencedColumns: ["id"]
          },
        ]
      }
      school_enquiries: {
        Row: {
          allocated_at: string | null
          allocated_to: string | null
          created_at: string | null
          id: string
          notes: string | null
          postcode: string | null
          school_id: string
          status: string
          student_email: string | null
          student_name: string
          student_phone: string | null
        }
        Insert: {
          allocated_at?: string | null
          allocated_to?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          postcode?: string | null
          school_id: string
          status?: string
          student_email?: string | null
          student_name: string
          student_phone?: string | null
        }
        Update: {
          allocated_at?: string | null
          allocated_to?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          postcode?: string | null
          school_id?: string
          status?: string
          student_email?: string | null
          student_name?: string
          student_phone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "school_enquiries_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "driving_schools"
            referencedColumns: ["id"]
          },
        ]
      }
      school_instructors: {
        Row: {
          can_receive_allocations: boolean | null
          id: string
          instructor_id: string
          joined_at: string | null
          school_id: string
          status: string
        }
        Insert: {
          can_receive_allocations?: boolean | null
          id?: string
          instructor_id: string
          joined_at?: string | null
          school_id: string
          status?: string
        }
        Update: {
          can_receive_allocations?: boolean | null
          id?: string
          instructor_id?: string
          joined_at?: string | null
          school_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "school_instructors_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "driving_schools"
            referencedColumns: ["id"]
          },
        ]
      }
      session_logs: {
        Row: {
          created_at: string
          id: string
          instructor_id: string
          lesson_id: string | null
          next_focus: string | null
          reflective_log: string
          skill_updates: Json | null
          student_id: string
          summary: string
        }
        Insert: {
          created_at?: string
          id?: string
          instructor_id: string
          lesson_id?: string | null
          next_focus?: string | null
          reflective_log: string
          skill_updates?: Json | null
          student_id: string
          summary: string
        }
        Update: {
          created_at?: string
          id?: string
          instructor_id?: string
          lesson_id?: string | null
          next_focus?: string | null
          reflective_log?: string
          skill_updates?: Json | null
          student_id?: string
          summary?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_logs_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      shared_plans: {
        Row: {
          bundled_skills: string[] | null
          created_at: string
          date_shared: string
          id: string
          instructor_id: string
          objective: string
          student_activities: Json | null
          student_id: string
          student_summary: string | null
          title: string
        }
        Insert: {
          bundled_skills?: string[] | null
          created_at?: string
          date_shared?: string
          id?: string
          instructor_id: string
          objective: string
          student_activities?: Json | null
          student_id: string
          student_summary?: string | null
          title: string
        }
        Update: {
          bundled_skills?: string[] | null
          created_at?: string
          date_shared?: string
          id?: string
          instructor_id?: string
          objective?: string
          student_activities?: Json | null
          student_id?: string
          student_summary?: string | null
          title?: string
        }
        Relationships: []
      }
      skill_progress: {
        Row: {
          created_at: string
          id: string
          instructor_id: string
          level: number
          notes: string | null
          student_id: string
          topic: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          instructor_id: string
          level?: number
          notes?: string | null
          student_id: string
          topic: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          instructor_id?: string
          level?: number
          notes?: string | null
          student_id?: string
          topic?: string
          updated_at?: string
        }
        Relationships: []
      }
      sms_credits: {
        Row: {
          balance: number
          created_at: string
          id: string
          instructor_id: string
          last_topped_up: string | null
          lifetime_purchased: number
          lifetime_used: number
          updated_at: string
        }
        Insert: {
          balance?: number
          created_at?: string
          id?: string
          instructor_id: string
          last_topped_up?: string | null
          lifetime_purchased?: number
          lifetime_used?: number
          updated_at?: string
        }
        Update: {
          balance?: number
          created_at?: string
          id?: string
          instructor_id?: string
          last_topped_up?: string | null
          lifetime_purchased?: number
          lifetime_used?: number
          updated_at?: string
        }
        Relationships: []
      }
      sms_transactions: {
        Row: {
          balance_after: number
          created_at: string
          credits_change: number
          error_message: string | null
          id: string
          instructor_id: string
          message_preview: string | null
          recipient_phone: string | null
          recipient_user_id: string | null
          status: string
          stripe_payment_intent_id: string | null
          transaction_type: string
          twilio_message_sid: string | null
        }
        Insert: {
          balance_after: number
          created_at?: string
          credits_change: number
          error_message?: string | null
          id?: string
          instructor_id: string
          message_preview?: string | null
          recipient_phone?: string | null
          recipient_user_id?: string | null
          status?: string
          stripe_payment_intent_id?: string | null
          transaction_type: string
          twilio_message_sid?: string | null
        }
        Update: {
          balance_after?: number
          created_at?: string
          credits_change?: number
          error_message?: string | null
          id?: string
          instructor_id?: string
          message_preview?: string | null
          recipient_phone?: string | null
          recipient_user_id?: string | null
          status?: string
          stripe_payment_intent_id?: string | null
          transaction_type?: string
          twilio_message_sid?: string | null
        }
        Relationships: []
      }
      student_pricing: {
        Row: {
          applies_to: string
          created_at: string
          custom_hourly_rate: number | null
          discount_percent: number | null
          gifted_hours: number | null
          id: string
          instructor_id: string
          label: string | null
          pricing_type: string
          student_id: string
          updated_at: string
        }
        Insert: {
          applies_to?: string
          created_at?: string
          custom_hourly_rate?: number | null
          discount_percent?: number | null
          gifted_hours?: number | null
          id?: string
          instructor_id: string
          label?: string | null
          pricing_type?: string
          student_id: string
          updated_at?: string
        }
        Update: {
          applies_to?: string
          created_at?: string
          custom_hourly_rate?: number | null
          discount_percent?: number | null
          gifted_hours?: number | null
          id?: string
          instructor_id?: string
          label?: string | null
          pricing_type?: string
          student_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          ai_calls_reset_at: string | null
          ai_calls_today: number
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          tier: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_calls_reset_at?: string | null
          ai_calls_today?: number
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          tier?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_calls_reset_at?: string | null
          ai_calls_today?: number
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          tier?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      teaching_templates: {
        Row: {
          ai_summary: string | null
          base_content: string | null
          category: string | null
          content: string
          created_at: string
          id: string
          instructor_id: string
          instructor_notes: string | null
          last_used: string | null
          skill_topic: string | null
          template_type: string
          title: string
          updated_at: string
        }
        Insert: {
          ai_summary?: string | null
          base_content?: string | null
          category?: string | null
          content: string
          created_at?: string
          id?: string
          instructor_id: string
          instructor_notes?: string | null
          last_used?: string | null
          skill_topic?: string | null
          template_type?: string
          title: string
          updated_at?: string
        }
        Update: {
          ai_summary?: string | null
          base_content?: string | null
          category?: string | null
          content?: string
          created_at?: string
          id?: string
          instructor_id?: string
          instructor_notes?: string | null
          last_used?: string | null
          skill_topic?: string | null
          template_type?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      test_bookings: {
        Row: {
          booked_date: string | null
          created_at: string
          dvsa_ref: string | null
          id: string
          instructor_id: string
          notes: string | null
          pass_expires_at: string
          pass_issued_at: string
          preferred_windows: Json | null
          status: string
          student_id: string
          updated_at: string
        }
        Insert: {
          booked_date?: string | null
          created_at?: string
          dvsa_ref?: string | null
          id?: string
          instructor_id: string
          notes?: string | null
          pass_expires_at: string
          pass_issued_at?: string
          preferred_windows?: Json | null
          status?: string
          student_id: string
          updated_at?: string
        }
        Update: {
          booked_date?: string | null
          created_at?: string
          dvsa_ref?: string | null
          id?: string
          instructor_id?: string
          notes?: string | null
          pass_expires_at?: string
          pass_issued_at?: string
          preferred_windows?: Json | null
          status?: string
          student_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      test_route_steps: {
        Row: {
          id: string
          instruction: string
          route_id: string
          step_index: number
        }
        Insert: {
          id?: string
          instruction: string
          route_id: string
          step_index: number
        }
        Update: {
          id?: string
          instruction?: string
          route_id?: string
          step_index?: number
        }
        Relationships: [
          {
            foreignKeyName: "test_route_steps_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "test_routes"
            referencedColumns: ["id"]
          },
        ]
      }
      test_routes: {
        Row: {
          coordinates: Json | null
          created_at: string | null
          est_distance_miles: number | null
          est_duration_minutes: number | null
          focus_areas: string[] | null
          id: string
          instructor_id: string
          route_name: string
          test_centre: string
          tips: string[] | null
          updated_at: string | null
        }
        Insert: {
          coordinates?: Json | null
          created_at?: string | null
          est_distance_miles?: number | null
          est_duration_minutes?: number | null
          focus_areas?: string[] | null
          id?: string
          instructor_id: string
          route_name: string
          test_centre: string
          tips?: string[] | null
          updated_at?: string | null
        }
        Update: {
          coordinates?: Json | null
          created_at?: string | null
          est_distance_miles?: number | null
          est_duration_minutes?: number | null
          focus_areas?: string[] | null
          id?: string
          instructor_id?: string
          route_name?: string
          test_centre?: string
          tips?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_sms_credits: {
        Args: { _amount: number; _instructor_id: string }
        Returns: number
      }
      allocate_enquiry_to_instructor: {
        Args: { p_enquiry_id: string; p_instructor_id: string }
        Returns: undefined
      }
      approve_school_instructor: {
        Args: { p_instructor_id: string }
        Returns: undefined
      }
      check_and_increment_ai_usage: {
        Args: { _user_id: string }
        Returns: boolean
      }
      complete_student_onboarding: {
        Args: { _student_user_id: string }
        Returns: undefined
      }
      create_driving_school: {
        Args: {
          p_contact_email?: string
          p_contact_phone?: string
          p_coverage_area?: string
          p_name: string
        }
        Returns: {
          contact_email: string | null
          contact_phone: string | null
          coverage_area: string | null
          created_at: string | null
          id: string
          invite_code: string
          is_active: boolean | null
          logo_url: string | null
          max_instructors: number | null
          name: string
          owner_id: string
        }[]
        SetofOptions: {
          from: "*"
          to: "driving_schools"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      decline_school_instructor: {
        Args: { p_instructor_id: string }
        Returns: undefined
      }
      deduct_sms_credit: {
        Args: { _amount?: number; _instructor_id: string }
        Returns: boolean
      }
      generate_instructor_pin: { Args: { _user_id: string }; Returns: string }
      generate_invite_link: {
        Args: { _user_id: string }
        Returns: {
          expires_at: string
          token: string
        }[]
      }
      generate_school_invite_code: { Args: never; Returns: string }
      generate_student_secure_pin: {
        Args: { _student_user_id: string }
        Returns: string
      }
      get_active_student_count: {
        Args: { _instructor_id: string }
        Returns: number
      }
      get_instructor_id_for_student: {
        Args: { _student_user_id: string }
        Returns: string
      }
      get_or_create_sms_credits: {
        Args: { _instructor_id: string }
        Returns: {
          balance: number
          id: string
          instructor_id: string
          lifetime_purchased: number
          lifetime_used: number
        }[]
      }
      get_or_create_subscription: {
        Args: { _user_id: string }
        Returns: {
          ai_calls_reset_at: string
          ai_calls_today: number
          id: string
          status: string
          tier: string
          user_id: string
        }[]
      }
      get_school_stats: { Args: { p_school_id: string }; Returns: Json }
      get_student_effective_pricing: {
        Args: { _instructor_id: string; _student_id: string }
        Returns: {
          applies_to: string
          block_10_price: number
          block_20_price: number
          block_30_price: number
          block_booking_enabled: boolean
          custom_hourly_rate: number
          discount_percent: number
          gifted_hours: number
          has_custom_pricing: boolean
          instructor_hourly_rate: number
          label: string
          pricing_type: string
        }[]
      }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      join_school_by_code: { Args: { p_invite_code: string }; Returns: string }
      leave_school: { Args: never; Returns: undefined }
      link_student_to_instructor: {
        Args: { _pin_code: string; _student_id: string }
        Returns: string
      }
      remove_instructor_from_school: {
        Args: { p_instructor_id: string }
        Returns: undefined
      }
      track_invite_conversion: { Args: { _token: string }; Returns: undefined }
      use_onboarding_pin: {
        Args: { _pin_code: string; _student_id: string }
        Returns: string
      }
      validate_invite_link: {
        Args: { _token: string }
        Returns: {
          error_message: string
          instructor_id: string
          instructor_name: string
          instructor_pin: string
          is_valid: boolean
        }[]
      }
      validate_onboarding_pin: {
        Args: { _pin_code: string }
        Returns: {
          instructor_id: string
          is_valid: boolean
        }[]
      }
      validate_permanent_instructor_pin: {
        Args: { _pin_code: string }
        Returns: {
          instructor_id: string
          instructor_name: string
          is_valid: boolean
        }[]
      }
      validate_student_secure_pin: {
        Args: { _pin_code: string; _student_user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "instructor" | "student" | "admin" | "school_admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["instructor", "student", "admin", "school_admin"],
    },
  },
} as const
