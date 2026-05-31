import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../lib/supabase";
import {
  getQuestions,
  getAnswers,
  createQuestion,
  createAnswer,
  addComment,
  toggleBookmark as apiToggleBookmark,
  updateProfile as apiUpdateProfile,
  toggleEntityVerification,
  deleteReview as apiDeleteReview,
  deleteQuestion as apiDeleteQuestion,
  castVote,
  createReview,
} from "../../lib/services";
import type { Question, Answer, Profile, CreateQuestionInput, CreateAnswerInput, TargetType, VoteType, NotificationItem } from "../../lib/database.types";
import { notificationToItem } from "../../lib/database.types";

// State structures for UI compatibility
interface AppState {
  questions: Question[];
  answers: Answer[];
  currentUser: any;
  users: any[];
  notifications: NotificationItem[];
  bookmarkedIds: string[];
  reviews: any[];
  isQuestionsLoading: boolean;
}

interface AppStateContextProps extends AppState {
  addQuestion: (
    title: string,
    description: string,
    tags: string[],
    location?: string,
    images?: string[],
    links?: any[],
    locationDetail?: any
  ) => Promise<string | null>;
  deleteQuestion: (id: string) => void;
  addAnswer: (
    questionId: string,
    content: string,
    verifiedType?: "photo" | "location",
    images?: string[],
    links?: any[],
    locationDetail?: any
  ) => void;
  addComment: (answerId: string, content: string) => void;
  voteQuestion: (questionId: string, dir: "up" | "down") => void;
  voteAnswer: (answerId: string, dir: "up" | "down") => void;
  toggleBookmark: (questionId: string) => boolean;
  updateProfile: (
    name: string,
    username: string,
    bio: string,
    location: string,
    avatar: string,
    occupation: string,
    website: string,
    coverUrl?: string,
    businessInfo?: any
  ) => Promise<any>;
  addNotification: (type: "like" | "answer" | "system" | "achievement", title: string, content: string) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  setCurrentUser: React.Dispatch<React.SetStateAction<any>>;
  addReview: (
    entityId: string,
    rating: number,
    comment: string,
    images?: string[],
    links?: any[],
    visitDate?: string
  ) => void;
  toggleVerifyEntity: (userId: string) => void;
  deleteReview: (reviewId: string) => void;
}

const AppStateContext = createContext<AppStateContextProps | undefined>(undefined);

export const AppStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Fetch current user
  const { data: currentUser } = useQuery({
    queryKey: ["currentUser", currentUserId],
    queryFn: async () => {
      if (!currentUserId) return { id: "1", name: "زائر", username: "guest", reputation: 0, accountType: "individual", avatar: "", joined: "" };
      
      // Fetch user email from Supabase Auth
      const { data: { user: authUser } } = await supabase.auth.getUser();
      const email = authUser?.email ?? "";

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", currentUserId)
        .maybeSingle();
      if (!data) return { id: "1", name: "زائر", username: "guest", reputation: 0, accountType: "individual", avatar: "", email };
      return {
        ...data,
        email,
        avatar: data.avatar_url ?? "",
        accountType: data.account_type ?? "individual",
        businessCategory: data.business_category ?? "",
        businessLicense: data.business_license ?? "",
        businessAddress: data.business_address ?? "",
        businessRating: data.business_rating ?? null,
        operatingHours: data.operating_hours ?? "",
        isVerifiedEntity: data.is_verified_entity,
        joined: new Date(data.created_at).toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric" }),
      };
    },
    enabled: !!currentUserId,
  });

  // Questions query
  const { data: questions = [], isLoading: isQuestionsLoading } = useQuery({
    queryKey: ["questions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("questions")
        .select(`
          *,
          author:profiles!author_id(*),
          question_tags(tag_id, tags(*)),
          question_attachments(*)
        `)
        .eq("is_deleted", false)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      
      return (data ?? []).map((q: any) => {
        const authorProfile = q.author;
        const tagNames = (q.question_tags ?? []).map((qt: any) => qt.tags?.name).filter(Boolean);
        const images = (q.question_attachments ?? [])
          .filter((att: any) => att.type === "image")
          .map((att: any) => att.url);
        const links = (q.question_attachments ?? [])
          .filter((att: any) => att.type === "link")
          .map((att: any) => ({ title: att.title ?? "", url: att.url ?? "" }));
        const locAtt = (q.question_attachments ?? []).find((att: any) => att.type === "location");
        const locationDetail = locAtt ? {
          name: locAtt.title ?? "",
          address: locAtt.address ?? undefined,
          lat: locAtt.lat ? parseFloat(locAtt.lat) : undefined,
          lng: locAtt.lng ? parseFloat(locAtt.lng) : undefined,
        } : undefined;

        return {
          ...q,
          id: q.id,
          author_id: q.author_id,
          title: q.title,
          description: q.content,
          content: q.content,
          category: q.category,
          location: q.location,
          votes: q.votes_count,
          votes_count: q.votes_count,
          answers: q.answers_count,
          answers_count: q.answers_count,
          views: q.views_count,
          views_count: q.views_count,
          tags: tagNames,
          images,
          links,
          locationDetail,
          author: {
            name: authorProfile?.name ?? "مستخدم",
            avatar: authorProfile?.avatar_url ?? undefined,
            reputation: authorProfile?.reputation ?? 0,
          },
          timestamp: q.created_at,
          is_deleted: q.is_deleted,
          created_at: q.created_at,
          updated_at: q.updated_at,
        };
      }) as Question[];
    },
    staleTime: 0,   // always re-fetch after invalidation so new questions appear immediately
    refetchOnWindowFocus: true,
  });

  // Answers query
  const { data: answers = [] } = useQuery({
    queryKey: ["answers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("answers")
        .select(`
          *,
          author:profiles!author_id(id, name, username, avatar_url, reputation),
          answer_attachments(*),
          comments(
            *,
            author:profiles!author_id(id, name, username, avatar_url, reputation)
          )
        `)
        .eq("is_deleted", false);
      
      if (error) throw error;
      
      return (data ?? []).map((a: any) => {
        const authorProfile = a.author;
        const images = (a.answer_attachments ?? [])
          .filter((att: any) => att.type === "image")
          .map((att: any) => att.url);
        const links = (a.answer_attachments ?? [])
          .filter((att: any) => att.type === "link")
          .map((att: any) => ({ title: att.title ?? "", url: att.url ?? "" }));
        const locAtt = (a.answer_attachments ?? []).find((att: any) => att.type === "location");
        const locationDetail = locAtt ? {
          name: locAtt.title ?? "",
          address: locAtt.address ?? undefined,
          lat: locAtt.lat ? parseFloat(locAtt.lat) : undefined,
          lng: locAtt.lng ? parseFloat(locAtt.lng) : undefined,
        } : undefined;

        // Verified type
        const verified = a.verified_type ? {
          type: a.verified_type,
          label: a.verified_label ?? (a.verified_type === "photo" ? "مُثبت بصورة ميدانية" : "مُثبت بموقع جغرافي")
        } : undefined;

        const mappedComments = (a.comments ?? []).map((c: any) => ({
          id: c.id,
          answer_id: c.answer_id,
          author_id: c.author_id,
          content: c.content,
          created_at: c.created_at,
          updated_at: c.updated_at ?? c.created_at,
          author: {
            id: c.author?.id ?? c.author_id ?? "",
            name: c.author?.name ?? "مستخدم",
            username: c.author?.username ?? "",
            avatar_url: c.author?.avatar_url ?? null,
            reputation: c.author?.reputation ?? 0,
          },
          timestamp: c.created_at,
        }));

        return {
          ...a,
          id: a.id,
          questionId: a.question_id,
          question_id: a.question_id,
          author_id: a.author_id,
          content: a.content,
          votes: a.votes_count,
          votes_count: a.votes_count,
          is_accepted: a.is_accepted,
          verified,
          images,
          links,
          locationDetail,
          author: {
            name: authorProfile?.name ?? "مستخدم",
            avatar: authorProfile?.avatar_url ?? undefined,
            reputation: authorProfile?.reputation ?? 0,
          },
          timestamp: a.created_at,
          comments: mappedComments,
          is_deleted: a.is_deleted,
          created_at: a.created_at,
          updated_at: a.updated_at,
        };
      }) as Answer[];
    },
    staleTime: 60000,
  });

  // Users query
  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*");
      return (data ?? []).map((u: any) => ({
        ...u,
        avatar: u.avatar_url ?? "",
        accountType: u.account_type ?? "individual",
        businessCategory: u.business_category ?? "",
        businessLicense: u.business_license ?? "",
        businessAddress: u.business_address ?? "",
        businessRating: u.business_rating ?? null,
        operatingHours: u.operating_hours ?? "",
        isVerifiedEntity: u.is_verified_entity,
        joined: new Date(u.created_at).toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric" }),
      })) as any[];
    },
  });

  // Bookmarks
  const { data: bookmarkedIds = [] } = useQuery({
    queryKey: ["bookmarks", currentUserId],
    queryFn: async () => {
      if (!currentUserId) return [] as string[];
      const { data } = await supabase
        .from("bookmarks")
        .select("question_id")
        .eq("user_id", currentUserId);
      return (data?.map((b: any) => b.question_id) as string[]) ?? [];
    },
    enabled: !!currentUserId,
  });

  // Notifications query
  const { data: notifications = [] } = useQuery<NotificationItem[]>({
    queryKey: ["notifications", currentUserId],
    queryFn: async () => {
      if (!currentUserId) return [];
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", currentUserId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map(notificationToItem);
    },
    enabled: !!currentUserId,
  });

  // Reviews query
  const { data: reviews = [] } = useQuery({
    queryKey: ["reviews"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select(`
          *,
          reviewer:profiles!reviewer_id(*),
          entity:profiles!entity_id(*),
          review_attachments(*)
        `)
        .eq("is_deleted", false)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      
      return (data ?? []).map((r: any) => {
        const reviewerProfile = r.reviewer;
        const images = (r.review_attachments ?? [])
          .filter((att: any) => att.type === "image")
          .map((att: any) => att.url);
        const links = (r.review_attachments ?? [])
          .filter((att: any) => att.type === "link")
          .map((att: any) => ({ title: att.title ?? "", url: att.url ?? "" }));
        
        return {
          id: r.id,
          userId: r.reviewer_id,
          userName: reviewerProfile?.name ?? "مستخدم",
          userAvatar: reviewerProfile?.avatar_url ?? "",
          entityId: r.entity_id,
          entityName: r.entity?.name ?? "منشأة",
          rating: r.rating,
          comment: r.comment,
          visitDate: r.visit_date,
          timestamp: new Date(r.created_at).toLocaleDateString("ar-SA"),
          images,
          links,
        };
      });
    },
  });

  // Realtime subscription for notifications
  useEffect(() => {
    if (!currentUserId) return;
    
    const channel = supabase
      .channel(`notifications:${currentUserId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${currentUserId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["notifications", currentUserId] });
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [currentUserId, queryClient]);

  // Auth listener
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setCurrentUserId(user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUserId(session?.user?.id ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Mutations
  const createQuestionMutation = useMutation({
    mutationFn: ({ authorId, input }: { authorId: string; input: CreateQuestionInput }) =>
      createQuestion(authorId, input),
    onSuccess: () => {
      // Invalidate all question-related queries so the feed refreshes immediately
      queryClient.invalidateQueries({ queryKey: ["questions"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["platformStats"] });
      queryClient.invalidateQueries({ queryKey: ["hotQuestions"] });
      queryClient.invalidateQueries({ queryKey: ["trendingTags"] });
    },
  });

  const deleteQuestionMutation = useMutation({
    mutationFn: apiDeleteQuestion,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["questions"] }),
  });

  const createAnswerMutation = useMutation({
    mutationFn: ({ authorId, input }: { authorId: string; input: CreateAnswerInput }) =>
      createAnswer(authorId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["answers"] });
      queryClient.invalidateQueries({ queryKey: ["questions"] });
    },
  });

  const toggleBookmarkMutation = useMutation({
    mutationFn: ({ userId, questionId }: { userId: string; questionId: string }) =>
      apiToggleBookmark(userId, questionId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["bookmarks"] }),
  });

  const voteMutation = useMutation({
    mutationFn: ({ userId, targetId, targetType, voteType }: { userId: string; targetId: string; targetType: TargetType; voteType: VoteType }) =>
      castVote(userId, targetId, targetType, voteType),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["questions"] });
      queryClient.invalidateQueries({ queryKey: ["answers"] });
    },
  });

  // Action handlers
  const addQuestion = async (title: string, description: string, tags: string[], location?: string, images?: string[], links?: any[], locationDetail?: any) => {
    if (!currentUserId) return null;
    const input: CreateQuestionInput = {
      title,
      content: description,
      category: location ?? undefined,
      location: locationDetail?.name ?? undefined,
      tags,
      images,
      links,
      locationDetail: (locationDetail?.lat || locationDetail?.lng) ? locationDetail : undefined,
    };
    const result = await createQuestionMutation.mutateAsync({ authorId: currentUserId, input });
    return result?.id ?? null;
  };

  const deleteQuestion = (id: string) => {
    deleteQuestionMutation.mutate(id);
  };

  const addAnswer = (questionId: string, content: string, verifiedType?: "photo" | "location", images?: string[], links?: any[], locationDetail?: any) => {
    if (!currentUserId) return;
    const input: CreateAnswerInput = { question_id: questionId, content, verified_type: verifiedType, images, links, locationDetail };
    createAnswerMutation.mutate({ authorId: currentUserId, input });
  };

  const addCommentHandler = (answerId: string, content: string) => {
    if (!currentUserId) return;
    addComment(answerId, currentUserId, content);
    queryClient.invalidateQueries({ queryKey: ["answers"] });
  };

  const voteQuestion = (questionId: string, dir: "up" | "down") => {
    if (!currentUserId) return;
    voteMutation.mutate({ userId: currentUserId, targetId: questionId, targetType: "question", voteType: dir });
  };

  const voteAnswer = (answerId: string, dir: "up" | "down") => {
    if (!currentUserId) return;
    voteMutation.mutate({ userId: currentUserId, targetId: answerId, targetType: "answer", voteType: dir });
  };

  const toggleBookmark = (questionId: string): boolean => {
    if (!currentUserId) return false;
    apiToggleBookmark(currentUserId, questionId);
    const existing = bookmarkedIds.includes(questionId);
    return !existing;
  };

  const updateProfile = async (
    name: string,
    username: string,
    bio: string,
    location: string,
    avatar: string,
    occupation: string,
    website: string,
    coverUrl?: string,
    businessInfo?: any
  ) => {
    if (!currentUserId) return null;
    
    // Get existing settings to preserve nested items like notifications/privacy
    const { data: currentProfile } = await supabase
      .from("profiles")
      .select("settings")
      .eq("id", currentUserId)
      .maybeSingle();
      
    const currentSettings = currentProfile?.settings || {};
    const newSettings = {
      ...currentSettings,
      occupation,
      website,
      cover_url: coverUrl,
      license_document_url: businessInfo?.licenseDocumentUrl !== undefined ? businessInfo.licenseDocumentUrl : currentSettings.license_document_url
    };

    const input: any = {
      name,
      username,
      bio,
      location,
      avatar_url: avatar,
      settings: newSettings
    };
    if (businessInfo) {
      if (businessInfo.businessCategory !== undefined) input.business_category = businessInfo.businessCategory;
      if (businessInfo.businessLicense !== undefined) input.business_license = businessInfo.businessLicense;
      if (businessInfo.businessAddress !== undefined) input.business_address = businessInfo.businessAddress;
      if (businessInfo.operatingHours !== undefined) input.operating_hours = businessInfo.operatingHours;
    }
    const result = await apiUpdateProfile(currentUserId, input);
    queryClient.invalidateQueries({ queryKey: ["currentUser", currentUserId] });
    queryClient.invalidateQueries({ queryKey: ["users"] });
    return result;
  };

  const addNotification = async (type: "like" | "answer" | "system" | "achievement", title: string, content: string) => {
    if (!currentUserId) return;
    await supabase.from("notifications").insert({
      user_id: currentUserId,
      type,
      title,
      content,
      is_read: false
    });
    queryClient.invalidateQueries({ queryKey: ["notifications", currentUserId] });
  };

  const markNotificationAsRead = async (id: string) => {
    if (!currentUserId) return;
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", id)
      .eq("user_id", currentUserId);
    queryClient.invalidateQueries({ queryKey: ["notifications", currentUserId] });
  };

  const markAllNotificationsAsRead = async () => {
    if (!currentUserId) return;
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", currentUserId)
      .eq("is_read", false);
    queryClient.invalidateQueries({ queryKey: ["notifications", currentUserId] });
  };

  const createReviewMutation = useMutation({
    mutationFn: ({ reviewerId, input }: { reviewerId: string; input: any }) =>
      createReview(reviewerId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    },
  });

  const addReview = (
    entityId: string,
    rating: number,
    comment: string,
    images?: string[],
    links?: any[],
    visitDate?: string
  ) => {
    if (!currentUserId) return;
    createReviewMutation.mutate({
      reviewerId: currentUserId,
      input: {
        entity_id: entityId,
        rating,
        comment,
        images,
        links,
        visit_date: visitDate,
      },
    });
  };

  const setCurrentUser = (user: any) => {
    setCurrentUserId(user?.id ?? null);
  };

  const toggleVerifyEntity = (userId: string) => {
    const currentState = !!users.find((u: any) => u.id === userId)?.is_verified_entity;
    toggleEntityVerification(userId, currentState);
    queryClient.invalidateQueries({ queryKey: ["users"] });
  };

  const deleteReview = (reviewId: string) => {
    apiDeleteReview(reviewId);
  };

  return (
    <AppStateContext.Provider
      value={{
        questions: questions ?? [],
        answers: answers ?? [],
        currentUser: currentUser ?? { id: "1", name: "زائر", username: "guest", reputation: 0, accountType: "individual" },
        users: users ?? [],
        notifications,
        bookmarkedIds,
        reviews: reviews ?? [],
        isQuestionsLoading,
        addQuestion,
        deleteQuestion,
        addAnswer,
        addComment: addCommentHandler,
        voteQuestion,
        voteAnswer,
        toggleBookmark,
        updateProfile,
        addNotification,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        setCurrentUser,
        addReview,
        toggleVerifyEntity,
        deleteReview,
      }}
    >
      {children}
    </AppStateContext.Provider>
  );
};

export const useAppState = () => {
  const context = useContext(AppStateContext);
  if (!context) throw new Error("useAppState must be used within AppStateProvider");
  return context;
};