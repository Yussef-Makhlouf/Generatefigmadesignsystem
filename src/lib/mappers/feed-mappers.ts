import type { Question, Answer } from "../database.types";

type AttachmentRow = {
  type: string;
  url?: string;
  title?: string;
  address?: string;
  lat?: string | number | null;
  lng?: string | number | null;
};

function mapAttachments(attachments: AttachmentRow[] | undefined) {
  const rows = attachments ?? [];
  const images = rows.filter((a) => a.type === "image").map((a) => a.url!).filter(Boolean);
  const links = rows
    .filter((a) => a.type === "link")
    .map((a) => ({ title: a.title ?? "", url: a.url ?? "" }));
  const locAtt = rows.find((a) => a.type === "location");
  const locationDetail = locAtt
    ? {
        name: locAtt.title ?? "",
        address: locAtt.address ?? undefined,
        lat: locAtt.lat != null ? parseFloat(String(locAtt.lat)) : undefined,
        lng: locAtt.lng != null ? parseFloat(String(locAtt.lng)) : undefined,
      }
    : undefined;
  return { images, links, locationDetail };
}

export function mapQuestionRow(q: Record<string, unknown>): Question {
  const authorProfile = q.author as Record<string, unknown> | undefined;
  const tagNames = ((q.question_tags as Array<{ tags?: { name?: string } }>) ?? [])
    .map((qt) => qt.tags?.name)
    .filter(Boolean) as string[];
  const { images, links, locationDetail } = mapAttachments(
    q.question_attachments as AttachmentRow[] | undefined
  );

  return {
    ...(q as Question),
    id: q.id as string,
    author_id: q.author_id as string,
    title: q.title as string,
    description: q.content as string,
    content: q.content as string,
    category: (q.category as string | null | undefined) ?? null,
    location: (q.location as string | null | undefined) ?? null,
    votes: q.votes_count as number,
    votes_count: q.votes_count as number,
    answers: q.answers_count as number,
    answers_count: q.answers_count as number,
    views: q.views_count as number,
    views_count: q.views_count as number,
    tags: tagNames,
    images,
    links,
    locationDetail,
    author: {
      id: (authorProfile?.id as string) ?? "",
      name: (authorProfile?.name as string) ?? "مستخدم",
      username: (authorProfile?.username as string) ?? "",
      avatar: (authorProfile?.avatar_url as string) ?? undefined,
      reputation: (authorProfile?.reputation as number) ?? 0,
    },
    timestamp: q.created_at as string,
    is_deleted: q.is_deleted as boolean,
    created_at: q.created_at as string,
    updated_at: q.updated_at as string,
  } as Question;
}

export function mapAnswerRow(a: Record<string, unknown>): Answer {
  const authorProfile = a.author as Record<string, unknown> | undefined;
  const { images, links, locationDetail } = mapAttachments(
    a.answer_attachments as AttachmentRow[] | undefined
  );

  const verified = a.verified_type
    ? {
        type: a.verified_type as "photo" | "location",
        label:
          (a.verified_label as string) ??
          (a.verified_type === "photo" ? "مُثبت بصورة ميدانية" : "مُثبت بموقع جغرافي"),
      }
    : undefined;

  const mappedComments = ((a.comments as Array<Record<string, unknown>>) ?? []).map((c) => ({
    id: c.id as string,
    answer_id: c.answer_id as string,
    author_id: c.author_id as string,
    content: c.content as string,
    created_at: c.created_at as string,
    updated_at: (c.updated_at as string) ?? (c.created_at as string),
    author: {
      id: (c.author as Record<string, unknown>)?.id as string ?? (c.author_id as string) ?? "",
      name: (c.author as Record<string, unknown>)?.name as string ?? "مستخدم",
      username: (c.author as Record<string, unknown>)?.username as string ?? "",
      avatar_url: (c.author as Record<string, unknown>)?.avatar_url as string | null ?? null,
      reputation: (c.author as Record<string, unknown>)?.reputation as number ?? 0,
    },
    timestamp: c.created_at as string,
  }));

  return {
    ...(a as Answer),
    id: a.id as string,
    questionId: a.question_id as string,
    question_id: a.question_id as string,
    author_id: a.author_id as string,
    content: a.content as string,
    votes: a.votes_count as number,
    votes_count: a.votes_count as number,
    is_accepted: a.is_accepted as boolean,
    verified,
    images,
    links,
    locationDetail,
    author: {
      name: (authorProfile?.name as string) ?? "مستخدم",
      username: (authorProfile?.username as string) ?? "",
      avatar: (authorProfile?.avatar_url as string) ?? undefined,
      reputation: (authorProfile?.reputation as number) ?? 0,
    },
    timestamp: a.created_at as string,
    comments: mappedComments,
    is_deleted: a.is_deleted as boolean,
    created_at: a.created_at as string,
    updated_at: a.updated_at as string,
  } as Answer;
}

export interface UserSettingsShape {
  occupation?: string;
  website?: string;
  cover_url?: string;
  license_document_url?: string;
  notifications?: {
    email?: boolean;
    newAnswers?: boolean;
    newComments?: boolean;
    mentions?: boolean;
    weeklyDigest?: boolean;
    marketingEmails?: boolean;
  };
  privacy?: {
    profileVisibility?: "public" | "members" | "private";
    showEmail?: boolean;
    showLocation?: boolean;
    allowMessages?: boolean;
  };
  appearance?: {
    theme?: "light" | "dark" | "system";
    language?: "ar" | "en";
  };
}

export interface AppUser {
  id: string;
  name: string;
  username: string;
  reputation: number;
  avatar: string;
  accountType: string;
  businessCategory: string;
  businessLicense: string;
  businessAddress: string;
  businessRating: number | null;
  operatingHours: string;
  isVerifiedEntity: boolean;
  joined: string;
  email?: string;
  bio?: string | null;
  location?: string | null;
  avatar_url?: string | null;
  settings?: UserSettingsShape;
}

export function mapProfileRow(u: Record<string, unknown>): AppUser {
  return {
    ...u,
    id: u.id as string,
    name: (u.name as string) ?? "",
    username: (u.username as string) ?? "",
    reputation: (u.reputation as number) ?? 0,
    avatar: (u.avatar_url as string) ?? "",
    accountType: (u.account_type as string) ?? "individual",
    businessCategory: (u.business_category as string) ?? "",
    businessLicense: (u.business_license as string) ?? "",
    businessAddress: (u.business_address as string) ?? "",
    businessRating: (u.business_rating as number | null) ?? null,
    operatingHours: (u.operating_hours as string) ?? "",
    isVerifiedEntity: Boolean(u.is_verified_entity),
    settings: (u.settings as UserSettingsShape | undefined) ?? {},
    joined: new Date(u.created_at as string).toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
  };
}

export function mapReviewRow(r: Record<string, unknown>) {
  const reviewerProfile = r.reviewer as Record<string, unknown> | undefined;
  const { images, links } = mapAttachments(r.review_attachments as AttachmentRow[] | undefined);

  return {
    id: r.id as string,
    userId: r.reviewer_id as string,
    userName: (reviewerProfile?.name as string) ?? "مستخدم",
    userAvatar: (reviewerProfile?.avatar_url as string) ?? "",
    entityId: r.entity_id as string,
    entityName: (r.entity as Record<string, unknown>)?.name as string ?? "منشأة",
    rating: r.rating as number,
    comment: r.comment as string,
    visitDate: r.visit_date as string | undefined,
    timestamp: new Date(r.created_at as string).toLocaleDateString("ar-SA"),
    images,
    links,
  };
}

export const GUEST_USER: AppUser = {
  id: "1",
  name: "زائر",
  username: "guest",
  reputation: 0,
  accountType: "individual",
  avatar: "",
  businessCategory: "",
  businessLicense: "",
  businessAddress: "",
  businessRating: null,
  operatingHours: "",
  isVerifiedEntity: false,
  joined: "",
};
