// Bilim платформасының Supabase дерекқор типтері

export type UserRole = 'student' | 'instructor' | 'admin'
export type LangCode = 'kk' | 'ru' | 'en'
export type CourseLevel = 'beginner' | 'intermediate' | 'advanced'
export type CourseStatus = 'draft' | 'pending' | 'published' | 'rejected'
export type EnrollmentStatus = 'active' | 'completed' | 'refunded'
export type PaymentMethod = 'kaspi' | 'forte' | 'stripe' | 'card'
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'
export type Currency = 'KZT' | 'USD'

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          avatar_url: string | null
          bio: string | null
          role: UserRole
          phone: string | null
          lang_pref: LangCode
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          role?: UserRole
          phone?: string | null
          lang_pref?: LangCode
        }
        Update: {
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          role?: UserRole
          phone?: string | null
          lang_pref?: LangCode
        }
        Relationships: []
      }
      categories: {
        Row: {
          id: string
          slug: string
          name_kk: string
          name_ru: string
          name_en: string
          icon: string | null
          parent_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          slug: string
          name_kk: string
          name_ru: string
          name_en: string
          icon?: string | null
          parent_id?: string | null
        }
        Update: {
          slug?: string
          name_kk?: string
          name_ru?: string
          name_en?: string
          icon?: string | null
          parent_id?: string | null
        }
        Relationships: []
      }
      courses: {
        Row: {
          id: string
          slug: string
          instructor_id: string
          category_id: string | null
          title_kk: string
          title_ru: string
          title_en: string
          description_kk: string | null
          description_ru: string | null
          description_en: string | null
          price: number
          discount_price: number | null
          language: LangCode
          level: CourseLevel
          status: CourseStatus
          thumbnail_url: string | null
          trailer_mux_id: string | null
          trailer_mux_playback_id: string | null
          rating: number
          students_count: number
          what_you_learn: string[] | null
          requirements: string[] | null
          created_at: string
          updated_at: string
          published_at: string | null
        }
        Insert: {
          id?: string
          slug: string
          instructor_id: string
          category_id?: string | null
          title_kk: string
          title_ru: string
          title_en?: string
          description_kk?: string | null
          description_ru?: string | null
          description_en?: string | null
          price?: number
          discount_price?: number | null
          language?: LangCode
          level?: CourseLevel
          status?: CourseStatus
          thumbnail_url?: string | null
          trailer_mux_id?: string | null
          trailer_mux_playback_id?: string | null
          what_you_learn?: string[] | null
          requirements?: string[] | null
          published_at?: string | null
        }
        Update: {
          slug?: string
          category_id?: string | null
          title_kk?: string
          title_ru?: string
          title_en?: string
          description_kk?: string | null
          description_ru?: string | null
          description_en?: string | null
          price?: number
          discount_price?: number | null
          language?: LangCode
          level?: CourseLevel
          status?: CourseStatus
          thumbnail_url?: string | null
          what_you_learn?: string[] | null
          requirements?: string[] | null
          published_at?: string | null
        }
        Relationships: []
      }
      sections: {
        Row: {
          id: string
          course_id: string
          title_kk: string
          title_ru: string
          title_en: string
          order_idx: number
          created_at: string
        }
        Insert: {
          id?: string
          course_id: string
          title_kk: string
          title_ru: string
          title_en?: string
          order_idx?: number
        }
        Update: {
          title_kk?: string
          title_ru?: string
          title_en?: string
          order_idx?: number
        }
        Relationships: []
      }
      lessons: {
        Row: {
          id: string
          section_id: string
          course_id: string
          title_kk: string
          title_ru: string
          title_en: string
          mux_asset_id: string | null
          mux_playback_id: string | null
          duration_sec: number
          order_idx: number
          is_preview: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          section_id: string
          course_id: string
          title_kk: string
          title_ru: string
          title_en?: string
          mux_asset_id?: string | null
          mux_playback_id?: string | null
          duration_sec?: number
          order_idx?: number
          is_preview?: boolean
        }
        Update: {
          title_kk?: string
          title_ru?: string
          title_en?: string
          mux_asset_id?: string | null
          mux_playback_id?: string | null
          duration_sec?: number
          order_idx?: number
          is_preview?: boolean
        }
        Relationships: []
      }
      enrollments: {
        Row: {
          id: string
          student_id: string
          course_id: string
          order_id: string | null
          status: EnrollmentStatus
          progress_pct: number
          enrolled_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          student_id: string
          course_id: string
          order_id?: string | null
          status?: EnrollmentStatus
        }
        Update: {
          status?: EnrollmentStatus
          progress_pct?: number
          completed_at?: string | null
        }
        Relationships: []
      }
      lesson_progress: {
        Row: {
          id: string
          student_id: string
          enrollment_id: string
          lesson_id: string
          completed: boolean
          last_position: number
          watch_time: number
          updated_at: string
        }
        Insert: {
          id?: string
          student_id: string
          enrollment_id: string
          lesson_id: string
          completed?: boolean
          last_position?: number
          watch_time?: number
        }
        Update: {
          completed?: boolean
          last_position?: number
          watch_time?: number
        }
        Relationships: []
      }
      orders: {
        Row: {
          id: string
          student_id: string
          total_amount: number
          net_amount: number
          payment_method: PaymentMethod | null
          payment_status: PaymentStatus
          payment_ref: string | null
          currency: Currency
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          student_id: string
          total_amount: number
          net_amount: number
          payment_method?: PaymentMethod | null
          payment_status?: PaymentStatus
          payment_ref?: string | null
          currency?: Currency
        }
        Update: {
          payment_method?: PaymentMethod | null
          payment_status?: PaymentStatus
          payment_ref?: string | null
        }
        Relationships: []
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          course_id: string
          instructor_id: string
          price: number
          platform_fee: number
          instructor_earn: number
        }
        Insert: {
          id?: string
          order_id: string
          course_id: string
          instructor_id: string
          price: number
          platform_fee: number
          instructor_earn: number
        }
        Update: never
        Relationships: []
      }
      reviews: {
        Row: {
          id: string
          course_id: string
          student_id: string
          rating: number
          comment: string | null
          is_verified: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          course_id: string
          student_id: string
          rating: number
          comment?: string | null
        }
        Update: {
          rating?: number
          comment?: string | null
        }
        Relationships: []
      }
      certificates: {
        Row: {
          id: string
          student_id: string
          course_id: string
          cert_number: string
          issued_at: string
        }
        Insert: {
          id?: string
          student_id: string
          course_id: string
          cert_number: string
        }
        Update: never
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: UserRole
      lang_code: LangCode
      course_level: CourseLevel
      course_status: CourseStatus
      enrollment_status: EnrollmentStatus
      payment_method: PaymentMethod
      payment_status: PaymentStatus
      currency_code: Currency
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Course = Database['public']['Tables']['courses']['Row']
export type Section = Database['public']['Tables']['sections']['Row']
export type Lesson = Database['public']['Tables']['lessons']['Row']
export type Enrollment = Database['public']['Tables']['enrollments']['Row']
export type Order = Database['public']['Tables']['orders']['Row']
export type Review = Database['public']['Tables']['reviews']['Row']
export type Certificate = Database['public']['Tables']['certificates']['Row']
export type Category = Database['public']['Tables']['categories']['Row']

export type CourseWithInstructor = Course & {
  profiles: Pick<Profile, 'full_name' | 'avatar_url'>
  categories: Pick<Category, 'slug' | 'name_kk' | 'name_ru' | 'name_en'> | null
}
