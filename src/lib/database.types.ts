// ============================================================
// Supabase Database Types — Auto-aligned with schema.sql
// ============================================================

export type AccountType =
  | "individual"
  | "business"
  | "restaurant"
  | "clinic"
  | "doctor"
  | "activity"
  | "admin";

export type VoteType = "up" | "down";
export type TargetType = "question" | "answer";
export type AttachmentType = "image" | "link" | "location";
export type NotificationType = "like" | "answer" | "comment" | "follow" | "review" | "system" | "achievement";
export type NotificationPriority = "low" | "normal" | "high" | "urgent";
export type VerifiedType = "photo" | "location";

export interface AttachmentLink {
  title: string;
  url: string;
}

export interface AttachmentLocation {
  name: string;
  address?: string;
  lat?: number;
  lng?: number;
}

// ── Profiles ────────────────────────────────────────────────
export type Profile = {
  id: string;
  username: string;
  name: string;
  avatar_url: string | null;
  bio: string | null;
  location: string | null;
  account_type: AccountType;
  reputation: number;
  settings: Record<string, unknown>;
  // Business fields
  business_category: string | null;
  business_license: string | null;
  business_address: string | null;
  business_rating: number | null;
  reviews_count: number;
  operating_hours: string | null;
  lat: number | null;
  lng: number | null;
  is_verified_entity: boolean;
  created_at: string;
  updated_at: string;
  // UI Compatibility fields
  avatar?: string;
  businessCategory?: string;
  businessLicense?: string;
  businessAddress?: string;
  operatingHours?: string;
  isVerifiedEntity?: boolean;
  joined?: string;
};

// ── Questions ────────────────────────────────────────────────
export type Question = {
  id: string;
  author_id: string;
  title: string;
  content: string;
  category: string | null;
  location: string | null;
  votes_count: number;
  answers_count: number;
  views_count: number;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  // Joined fields
  author: Profile;
  tags: any[];
  attachments?: QuestionAttachment[];
  user_vote?: VoteType | null;
  is_bookmarked?: boolean;
  // UI Compatibility fields
  votes: number;
  answers: number;
  views: number;
  description: string;
  timestamp: string;
  images?: string[];
  links?: { title: string; url: string }[];
  locationDetail?: { name: string; address?: string; lat?: number; lng?: number };
};

// ── Attachments ──────────────────────────────────────────────
export type QuestionAttachment = {
  id: string;
  question_id: string;
  type: AttachmentType;
  url: string | null;
  title: string | null;
  address: string | null;
  lat: number | null;
  lng: number | null;
  sort_order: number;
  created_at: string;
  updated_at: string; // ✅ ADDED: aligned with schema v2.0
};

export type AnswerAttachment = {
  id: string;
  answer_id: string;
  type: AttachmentType;
  url: string | null;
  title: string | null;
  address: string | null;
  lat: number | null;
  lng: number | null;
  sort_order: number;
  created_at: string;
  updated_at: string; // ✅ ADDED: aligned with schema v2.0
};

// ── Tags ─────────────────────────────────────────────────────
export type Tag = {
  id: string;
  name: string;
  usage_count: number;
  created_at: string;
};

// ── Answers ──────────────────────────────────────────────────
export type Answer = {
  id: string;
  question_id: string;
  author_id: string;
  content: string;
  votes_count: number;
  is_accepted: boolean;
  verified_type: VerifiedType | null;
  verified_label: string | null;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  // Joined fields
  author: Profile;
  comments: Comment[];
  attachments?: AnswerAttachment[];
  user_vote?: VoteType | null;
  // UI Compatibility fields
  votes: number;
  timestamp: string;
  images?: string[];
  links?: { title: string; url: string }[];
  locationDetail?: { name: string; address?: string; lat?: number; lng?: number };
  verified?: { type: VerifiedType; label: string };
  questionId: string;
};

// ── Comments ─────────────────────────────────────────────────
/** Inline author shape embedded in comments (subset of Profile) */
export type CommentAuthor = {
  id: string;
  name: string;
  username: string;
  avatar_url: string | null;
  reputation: number;
};

export type Comment = {
  id: string;
  answer_id: string;
  author_id: string;
  content: string;
  created_at: string;
  updated_at: string; // ✅ ADDED: aligned with schema v2.0
  // Joined — full profile so the UI can show avatar + reputation
  author: CommentAuthor;
  // UI Compatibility fields
  timestamp: string;
  // Attachment fields (optional, populated when comments include attachments)
  images?: string[];
  links?: { title: string; url: string }[];
};

// ── Votes ────────────────────────────────────────────────────
export type Vote = {
  id: string;
  user_id: string;
  target_id: string;
  target_type: TargetType;
  vote_type: VoteType;
  created_at: string;
};

// ── Bookmarks ────────────────────────────────────────────────
export type Bookmark = {
  user_id: string;
  question_id: string;
  created_at: string;
  question?: Question;
};

// ── Reviews ──────────────────────────────────────────────────
export type Review = {
  id: string;
  reviewer_id: string;
  entity_id: string;
  rating: number;
  comment: string;
  visit_date: string | null;
  is_deleted: boolean;
  created_at: string;
  updated_at: string; // ✅ ADDED: aligned with schema v2.0
  // Joined
  reviewer?: Profile;
  entity?: Profile;
};

// ── Review Attachments ───────────────────────────────────────
export type ReviewAttachment = {
  id: string;
  review_id: string;
  type: "image" | "link";
  url: string;
  title: string | null;
  created_at: string;
};

// ── Notifications ────────────────────────────────────────────
export type Notification = {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  content: string;
  notification_data: Record<string, unknown>; // ✅ ADDED: schema v2.0
  action_url: string | null;                  // ✅ ADDED: schema v2.0
  priority: NotificationPriority;              // ✅ ADDED: schema v2.0
  is_read: boolean;
  created_at: string;
};

/** UI-facing notification shape (compatible with legacy components) */
export type NotificationItem = {
  id: string;
  type: NotificationType;
  title: string;
  content: string;
  timestamp: string;
  read: boolean;
  action_url?: string;           // ✅ ADDED: for notification click navigation
  priority?: NotificationPriority; // ✅ ADDED: for visual priority indicators
  data?: Record<string, unknown>; // ✅ ADDED: for dynamic notification rendering
};

/** Convert a DB Notification row → UI NotificationItem */
export function notificationToItem(n: Notification): NotificationItem {
  return {
    id: n.id,
    type: n.type,
    title: n.title,
    content: n.content,
    timestamp: n.created_at,
    read: n.is_read,
    action_url: n.action_url ?? undefined,
    priority: n.priority,
    data: n.notification_data,
  };
}

// ── Spaces ───────────────────────────────────────────────────
export type Space = {
  id: string;
  name: string;
  description: string | null;
  icon_url: string | null;
  is_active: boolean;
  created_at: string;
};

// ── Follows ────────────────────────────────────────────────────
export type Follow = {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
};

// ── Reputation Logs ──────────────────────────────────────────
export type ReputationLog = {
  id: string;
  user_id: string;
  points: number;
  reason: string;
  ref_id: string | null;
  ref_type: string | null;
  created_at: string;
};

// ── Reputation Daily Limits ──────────────────────────────────
// ✅ ADDED: aligned with schema v2.0 — daily reputation cap tracking
export type ReputationDailyLimit = {
  id: string;
  user_id: string;
  date: string;
  points_earned: number;
};

// ── Question → QuestionCard Mapper ──────────────────────────
/**
 * Maps a DB Question row (with optional joins) to the props
 * expected by <QuestionCard>. Use this at call-sites instead of
 * spreading the raw Question object, to avoid field-name mismatches.
 */
export function questionToCardProps(q: Question, users?: Profile[]) {
  const author = q.author ?? users?.find((u) => u.id === q.author_id);
  const tagNames = (q.tags ?? []).map((t) =>
    typeof t === "string" ? t : (t as { name: string }).name
  );

  return {
    id: q.id,
    title: q.title,
    description: q.content,
    author: {
      name: author?.name ?? "مستخدم",
      username: author?.username ?? "",
      avatar: author?.avatar_url ?? undefined,
      reputation: author?.reputation ?? 0,
    },
    votes: q.votes_count,
    answers: q.answers_count,
    views: q.views_count,
    tags: tagNames,
    location: q.location ?? undefined,
    timestamp: q.created_at,
  };
}

// ── API Input Types ──────────────────────────────────────────
export interface CreateQuestionInput {
  title: string;
  content: string;
  category?: string;
  location?: string;
  tags: string[];
  images?: string[];
  links?: { title: string; url: string }[];
  locationDetail?: { name: string; address?: string; lat?: number; lng?: number };
}

export interface CreateAnswerInput {
  question_id: string;
  content: string;
  verified_type?: VerifiedType;
  images?: string[];
  links?: { title: string; url: string }[];
  locationDetail?: { name: string; address?: string; lat?: number; lng?: number };
}

export interface UpdateProfileInput {
  name?: string;
  username?: string;
  bio?: string;
  location?: string;
  avatar_url?: string;
  business_category?: string;
  business_license?: string;
  business_address?: string;
  operating_hours?: string;
  lat?: number;
  lng?: number;
  settings?: Record<string, unknown>;
}

export interface CreateReviewInput {
  entity_id: string;
  rating: number;
  comment: string;
  visit_date?: string;
  images?: string[];
  links?: { title: string; url: string }[];
}

// ── Supabase Database Schema Definition (for createClient generic) ──
export type Database = {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Partial<Profile>; Update: Partial<Profile>; Relationships: [] };
      questions: { Row: Question; Insert: Partial<Question>; Update: Partial<Question>; Relationships: [] };
      question_attachments: { Row: QuestionAttachment; Insert: Partial<QuestionAttachment>; Update: Partial<QuestionAttachment>; Relationships: [] };
      answers: { Row: Answer; Insert: Partial<Answer>; Update: Partial<Answer>; Relationships: [] };
      answer_attachments: { Row: AnswerAttachment; Insert: Partial<AnswerAttachment>; Update: Partial<AnswerAttachment>; Relationships: [] };
      comments: { Row: Comment; Insert: Partial<Comment>; Update: Partial<Comment>; Relationships: [] };
      votes: { Row: Vote; Insert: Partial<Vote>; Update: Partial<Vote>; Relationships: [] };
      bookmarks: { Row: Bookmark; Insert: Partial<Bookmark>; Update: Partial<Bookmark>; Relationships: [] };
      reviews: { Row: Review; Insert: Partial<Review>; Update: Partial<Review>; Relationships: [] };
      review_attachments: { Row: ReviewAttachment; Insert: Partial<ReviewAttachment>; Update: Partial<ReviewAttachment>; Relationships: [] };
      notifications: { Row: Notification; Insert: Partial<Notification>; Update: Partial<Notification>; Relationships: [] };
      tags: { Row: Tag; Insert: Partial<Tag>; Update: Partial<Tag>; Relationships: [] };
      question_tags: { Row: { question_id: string; tag_id: string }; Insert: { question_id: string; tag_id: string }; Update: never; Relationships: [] };
      reputation_logs: { Row: ReputationLog; Insert: Partial<ReputationLog>; Update: never; Relationships: [] };
      spaces: { Row: Space; Insert: Partial<Space>; Update: Partial<Space>; Relationships: [] };
      follows: { Row: Follow; Insert: Partial<Follow>; Update: Partial<Follow>; Relationships: [] };
      // ✅ ADDED: schema v2.0
      reputation_daily_limits: { Row: ReputationDailyLimit; Insert: Partial<ReputationDailyLimit>; Update: Partial<ReputationDailyLimit>; Relationships: [] };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      toggle_follow: {
        Args: {
          p_follower_id: string;
          p_following_id: string;
        };
        Returns: boolean;
      };
      // ✅ ADDED: schema v2.0 RPCs
      increment_tag_usage: {
        Args: { tag_id_param: string };
        Returns: void;
      };
      award_reputation: {
        Args: {
          p_user_id: string;
          p_points: number;
          p_reason: string;
          p_ref_id?: string;
          p_ref_type?: string;
        };
        Returns: void;
      };
      check_daily_rep_limit: {
        Args: {
          p_user_id: string;
          p_points: number;
          p_max?: number;
        };
        Returns: number;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
