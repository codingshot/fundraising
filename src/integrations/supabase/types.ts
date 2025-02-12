export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      crypto_fundraising: {
        Row: {
          ai_generated_summary: string | null
          announcement_username: string | null
          associated_tweet_id: string | null
          categories: string[] | null
          created_at: string
          description: string
          funding: Json | null
          id: string
          logo: string | null
          name: string
          token: string | null
          tweet_url: string | null
          twitter: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          ai_generated_summary?: string | null
          announcement_username?: string | null
          associated_tweet_id?: string | null
          categories?: string[] | null
          created_at?: string
          description: string
          funding?: Json | null
          id?: string
          logo?: string | null
          name: string
          token?: string | null
          tweet_url?: string | null
          twitter?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          ai_generated_summary?: string | null
          announcement_username?: string | null
          associated_tweet_id?: string | null
          categories?: string[] | null
          created_at?: string
          description?: string
          funding?: Json | null
          id?: string
          logo?: string | null
          name?: string
          token?: string | null
          tweet_url?: string | null
          twitter?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      followers: {
        Row: {
          created_at: string
          follower_id: string | null
          following_id: string | null
          id: string
        }
        Insert: {
          created_at?: string
          follower_id?: string | null
          following_id?: string | null
          id?: string
        }
        Update: {
          created_at?: string
          follower_id?: string | null
          following_id?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "followers_profiles_follower_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "followers_profiles_following_fkey"
            columns: ["following_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      idea_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          idea_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          idea_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          idea_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "idea_comments_idea_id_fkey"
            columns: ["idea_id"]
            isOneToOne: false
            referencedRelation: "ideas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "idea_comments_profiles_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      idea_likes: {
        Row: {
          created_at: string
          id: string
          idea_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          idea_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          idea_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "idea_likes_idea_id_fkey"
            columns: ["idea_id"]
            isOneToOne: false
            referencedRelation: "ideas"
            referencedColumns: ["id"]
          },
        ]
      }
      ideas: {
        Row: {
          created_at: string
          description: string
          id: string
          likes: number | null
          project_id: string | null
          slug: string
          tags: string[] | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          likes?: number | null
          project_id?: string | null
          slug: string
          tags?: string[] | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          likes?: number | null
          project_id?: string | null
          slug?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ideas_profiles_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ideas_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      leader_comments: {
        Row: {
          content: string
          created_at: string
          flagged: boolean | null
          id: string
          leader_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          flagged?: boolean | null
          id?: string
          leader_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          flagged?: boolean | null
          id?: string
          leader_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "leader_comments_leader_id_fkey"
            columns: ["leader_id"]
            isOneToOne: false
            referencedRelation: "leaders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leader_comments_profiles_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      leader_likes: {
        Row: {
          created_at: string
          id: string
          leader_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          leader_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          leader_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "leader_likes_leader_id_fkey"
            columns: ["leader_id"]
            isOneToOne: false
            referencedRelation: "leaders"
            referencedColumns: ["id"]
          },
        ]
      }
      leader_project_associations: {
        Row: {
          created_at: string
          id: string
          leader_id: string
          project_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          leader_id: string
          project_id: string
        }
        Update: {
          created_at?: string
          id?: string
          leader_id?: string
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "leader_project_associations_leader_id_fkey"
            columns: ["leader_id"]
            isOneToOne: false
            referencedRelation: "leaders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leader_project_associations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      leaders: {
        Row: {
          bio: string
          birth_state: string
          categories: Database["public"]["Enums"]["leader_category"][]
          citizenship_status: Database["public"]["Enums"]["citizenship_status"]
          created_at: string
          crypto_start_date: string | null
          earliest_crypto_date: string
          farcaster_url: string | null
          id: string
          image_url: string
          is_enemy: boolean | null
          justification: string
          likes: number | null
          linkedin_url: string | null
          name: string
          rank: number | null
          slug: string
          submitted_by: string | null
          twitter_url: string | null
          updated_at: string
          user_id: string | null
          verified: boolean | null
        }
        Insert: {
          bio: string
          birth_state: string
          categories?: Database["public"]["Enums"]["leader_category"][]
          citizenship_status?: Database["public"]["Enums"]["citizenship_status"]
          created_at?: string
          crypto_start_date?: string | null
          earliest_crypto_date: string
          farcaster_url?: string | null
          id?: string
          image_url: string
          is_enemy?: boolean | null
          justification: string
          likes?: number | null
          linkedin_url?: string | null
          name: string
          rank?: number | null
          slug: string
          submitted_by?: string | null
          twitter_url?: string | null
          updated_at?: string
          user_id?: string | null
          verified?: boolean | null
        }
        Update: {
          bio?: string
          birth_state?: string
          categories?: Database["public"]["Enums"]["leader_category"][]
          citizenship_status?: Database["public"]["Enums"]["citizenship_status"]
          created_at?: string
          crypto_start_date?: string | null
          earliest_crypto_date?: string
          farcaster_url?: string | null
          id?: string
          image_url?: string
          is_enemy?: boolean | null
          justification?: string
          likes?: number | null
          linkedin_url?: string | null
          name?: string
          rank?: number | null
          slug?: string
          submitted_by?: string | null
          twitter_url?: string | null
          updated_at?: string
          user_id?: string | null
          verified?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "leaders_submitted_by_fkey"
            columns: ["submitted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          data: Json | null
          id: string
          message: string
          read: boolean | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Insert: {
          created_at?: string
          data?: Json | null
          id?: string
          message: string
          read?: boolean | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Update: {
          created_at?: string
          data?: Json | null
          id?: string
          message?: string
          read?: boolean | null
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pledges: {
        Row: {
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      processed_fundraises: {
        Row: {
          amount_raised: number | null
          announcement_username: string | null
          created_at: string
          description: string
          id: string
          investors: string[] | null
          lead_investor: string | null
          name: string
          original_submission_id: string
          processed_at: string
          round_type: string | null
          token: string | null
          tweet_timestamp: string | null
          twitter_url: string | null
        }
        Insert: {
          amount_raised?: number | null
          announcement_username?: string | null
          created_at?: string
          description: string
          id?: string
          investors?: string[] | null
          lead_investor?: string | null
          name: string
          original_submission_id: string
          processed_at?: string
          round_type?: string | null
          token?: string | null
          tweet_timestamp?: string | null
          twitter_url?: string | null
        }
        Update: {
          amount_raised?: number | null
          announcement_username?: string | null
          created_at?: string
          description?: string
          id?: string
          investors?: string[] | null
          lead_investor?: string | null
          name?: string
          original_submission_id?: string
          processed_at?: string
          round_type?: string | null
          token?: string | null
          tweet_timestamp?: string | null
          twitter_url?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          debug_mode: boolean | null
          email: string | null
          github_url: string | null
          handle: string | null
          id: string
          is_american_born: boolean | null
          is_american_citizen: boolean | null
          is_crypto_founder: boolean | null
          linkedin_url: string | null
          twitter_url: string | null
          updated_at: string
          username: string | null
          website_url: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          debug_mode?: boolean | null
          email?: string | null
          github_url?: string | null
          handle?: string | null
          id: string
          is_american_born?: boolean | null
          is_american_citizen?: boolean | null
          is_crypto_founder?: boolean | null
          linkedin_url?: string | null
          twitter_url?: string | null
          updated_at?: string
          username?: string | null
          website_url?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          debug_mode?: boolean | null
          email?: string | null
          github_url?: string | null
          handle?: string | null
          id?: string
          is_american_born?: boolean | null
          is_american_citizen?: boolean | null
          is_crypto_founder?: boolean | null
          linkedin_url?: string | null
          twitter_url?: string | null
          updated_at?: string
          username?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
      project_comment_upvotes: {
        Row: {
          comment_id: string | null
          created_at: string
          id: string
          user_id: string | null
        }
        Insert: {
          comment_id?: string | null
          created_at?: string
          id?: string
          user_id?: string | null
        }
        Update: {
          comment_id?: string | null
          created_at?: string
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_comment_upvotes_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "project_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      project_comments: {
        Row: {
          content: string
          created_at: string
          flagged: boolean | null
          id: string
          project_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          flagged?: boolean | null
          id?: string
          project_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          flagged?: boolean | null
          id?: string
          project_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_comments_profiles_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_comments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_likes: {
        Row: {
          created_at: string
          id: string
          project_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          project_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          project_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_likes_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          active: boolean | null
          approval_status: string | null
          blockchain: string[] | null
          chat_link: string | null
          created_at: string
          description: string | null
          github: string | null
          id: string
          likes: number | null
          name: string
          profile_image: string | null
          relation: string | null
          slug: string | null
          tags: string[] | null
          tvl: string | null
          twitter: string | null
          type: Database["public"]["Enums"]["project_type"]
          updated_at: string
          url: string | null
          user_id: string | null
        }
        Insert: {
          active?: boolean | null
          approval_status?: string | null
          blockchain?: string[] | null
          chat_link?: string | null
          created_at?: string
          description?: string | null
          github?: string | null
          id?: string
          likes?: number | null
          name: string
          profile_image?: string | null
          relation?: string | null
          slug?: string | null
          tags?: string[] | null
          tvl?: string | null
          twitter?: string | null
          type: Database["public"]["Enums"]["project_type"]
          updated_at?: string
          url?: string | null
          user_id?: string | null
        }
        Update: {
          active?: boolean | null
          approval_status?: string | null
          blockchain?: string[] | null
          chat_link?: string | null
          created_at?: string
          description?: string | null
          github?: string | null
          id?: string
          likes?: number | null
          name?: string
          profile_image?: string | null
          relation?: string | null
          slug?: string | null
          tags?: string[] | null
          tvl?: string | null
          twitter?: string | null
          type?: Database["public"]["Enums"]["project_type"]
          updated_at?: string
          url?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      find_similar_leaders: {
        Args: {
          leader_name: string
          leader_twitter: string
          leader_linkedin: string
          leader_farcaster: string
        }
        Returns: {
          id: string
          name: string
          similarity: number
          reason: string
        }[]
      }
      find_similar_projects: {
        Args: {
          project_name: string
          project_twitter: string
          project_github: string
          project_url: string
        }
        Returns: {
          id: string
          name: string
          similarity: number
          reason: string
        }[]
      }
      get_follower_count: {
        Args: {
          user_id: string
        }
        Returns: number
      }
      get_following_count: {
        Args: {
          user_id: string
        }
        Returns: number
      }
      get_pledge_count: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      get_unique_blockchains: {
        Args: Record<PropertyKey, never>
        Returns: {
          blockchain: string
        }[]
      }
      get_unique_tags: {
        Args: Record<PropertyKey, never>
        Returns: {
          tag: string
        }[]
      }
      mark_notifications_as_read: {
        Args: {
          notification_ids: string[]
        }
        Returns: string[]
      }
      mark_notifications_as_unread: {
        Args: {
          notification_ids: string[]
        }
        Returns: string[]
      }
      slugify: {
        Args: {
          "": string
        }
        Returns: string
      }
    }
    Enums: {
      citizenship_status: "american_born" | "naturalized_citizen"
      leader_category:
        | "Founder"
        | "Engineer"
        | "Politician"
        | "Advocate"
        | "Lawyer"
        | "Pioneer"
        | "Influencer"
        | "Media Personality"
        | "Investor"
        | "Marketer"
        | "Educator"
        | "Regulator"
        | "Researcher"
        | "Government Official"
      notification_type:
        | "project_status"
        | "follow"
        | "idea_like"
        | "idea_comment"
        | "leader_comment"
      project_type: "project" | "tool"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
