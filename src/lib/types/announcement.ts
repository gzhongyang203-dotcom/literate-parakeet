export type Announcement = {
  id: string
  title: string
  content: string
  is_pinned: boolean
  is_active: boolean
  created_at: string
  updated_at: string
  // Joined
  comment_count?: number
}

export type AnnouncementComment = {
  id: string
  announcement_id: string
  user_id: string
  content: string
  created_at: string
  // Joined
  user_nickname?: string
  user_avatar?: string
}
