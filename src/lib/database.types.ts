// Database type definitions for Supabase

export type Project = {
  id: string
  title: string
  hook: string
  category: string
  difficulty: "初级" | "中级" | "高级"
  income_estimate: string
  tools_required: string[]
  cover_image: string | null
  content: string
  status: "draft" | "published" | "archived"
  is_premium: boolean
  author_id: string
  created_at: string
  updated_at: string
  // Joined fields
  author_nickname?: string
  like_count?: number
  comment_count?: number
}

export type Comment = {
  id: string
  project_id: string
  user_id: string
  content: string
  parent_id: string | null
  created_at: string
  // Joined fields
  user_nickname?: string
  user_avatar?: string
  replies?: Comment[]
}

export type ProjectCollaborator = {
  id: string
  project_id: string
  user_id: string
  role: string
  message: string
  status: "pending" | "accepted" | "rejected"
  created_at: string
  // Joined fields
  project_title?: string
  user_nickname?: string
}

export type Subscription = {
  id: string
  user_id: string
  plan: string
  status: "active" | "canceled" | "expired"
  start_date: string
  end_date: string
}

export type Profile = {
  id: string
  email: string
  nickname: string
  avatar: string | null
  role: "user" | "admin"
  created_at: string
}

// 公告相关类型
export type Announcement = {
  id: string
  title: string
  content: string
  is_pinned: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export type AnnouncementComment = {
  id: string
  announcement_id: string
  user_id: string
  content: string
  created_at: string
  user_nickname?: string
  user_avatar?: string
}

// 代理相关类型
export type Agent = {
  id: string
  user_id: string
  parent_user_id: string | null
  invite_code: string
  commission_rate: number
  status: "pending" | "active" | "suspended"
  total_earnings: number
  pending_earnings: number
  total_customers: number
  created_at: string
  updated_at: string
  // Joined fields
  nickname?: string
  todayEarnings?: number
  phone?: string
  joinDate?: string
}

export type AgentCommission = {
  id: string
  parent_user_id: string
  agent_id: string | null
  order_type: string
  order_amount: number
  commission_amount: number
  commission_rate: number
  status: "pending" | "settled" | "cancelled"
  created_at: string
  settled_at: string | null
}

export type Settlement = {
  id: string
  user_id: string
  agent_id: string | null
  amount: number
  status: "pending" | "settled" | "rejected"
  payment_method: string
  created_at: string
  updated_at: string
}

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, "created_at">
        Update: Partial<Omit<Profile, "id">>
      }
      projects: {
        Row: Project
        Insert: Omit<Project, "id" | "created_at" | "updated_at">
        Update: Partial<Omit<Project, "id">>
      }
      comments: {
        Row: Comment
        Insert: Omit<Comment, "id" | "created_at">
        Update: Partial<Omit<Comment, "id">>
      }
      project_collaborators: {
        Row: ProjectCollaborator
        Insert: Omit<ProjectCollaborator, "id" | "created_at">
        Update: Partial<Omit<ProjectCollaborator, "id">>
      }
      subscriptions: {
        Row: Subscription
        Insert: Omit<Subscription, "id">
        Update: Partial<Omit<Subscription, "id">>
      }
      likes: {
        Row: { id: string; project_id: string; user_id: string; created_at: string }
        Insert: Omit<{ id: string; project_id: string; user_id: string; created_at: string }, "id" | "created_at">
        Update: never
      }
      announcements: {
        Row: Announcement
        Insert: Omit<Announcement, "id" | "created_at" | "updated_at">
        Update: Partial<Omit<Announcement, "id">>
      }
      announcement_comments: {
        Row: AnnouncementComment
        Insert: Omit<AnnouncementComment, "id" | "created_at">
        Update: Partial<Omit<AnnouncementComment, "id">>
      }
      agents: {
        Row: Agent
        Insert: Omit<Agent, "id" | "created_at" | "updated_at">
        Update: Partial<Omit<Agent, "id">>
      }
      agent_commissions: {
        Row: AgentCommission
        Insert: Omit<AgentCommission, "id" | "created_at">
        Update: Partial<Omit<AgentCommission, "id">>
      }
      settlements: {
        Row: Settlement
        Insert: Omit<Settlement, "id" | "created_at" | "updated_at">
        Update: Partial<Omit<Settlement, "id">>
      }
    }
  }
}
