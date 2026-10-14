export type Profile = {
  id: string
  full_name: string
  birth_date: string
  nickname: string
  avatar_path: string | null
  created_at: string
  updated_at: string
}

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: {
          id: string
          full_name: string
          birth_date: string
          nickname: string
          avatar_path?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          full_name?: string
          birth_date?: string
          nickname?: string
          avatar_path?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}