import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "../supabase";
import {
  addComment,
  updateProfile as apiUpdateProfile,
  toggleEntityVerification,
  deleteReview as apiDeleteReview,
} from "../services";
import type { CreateQuestionInput, CreateAnswerInput } from "../database.types";
import { queryKeys } from "../query-keys";
import { useAuthSession } from "./use-auth-session";
import { useFeedUsers } from "./use-feed-queries";
import {
  useContentMutations,
  insertNotification,
  markAllNotificationsRead,
  markNotificationRead,
} from "./use-content-mutations";

export function useAppActions() {
  const { currentUserId } = useAuthSession();
  const { data: users = [] } = useFeedUsers();
  const queryClient = useQueryClient();
  const {
    createQuestionMutation,
    deleteQuestionMutation,
    createAnswerMutation,
    createReviewMutation,
  } = useContentMutations(currentUserId);

  const addQuestion = useCallback(
    async (
      title: string,
      description: string,
      tags: string[],
      category?: string,
      images?: string[],
      links?: { title: string; url: string }[],
      locationDetail?: { name: string; address?: string; lat?: number; lng?: number }
    ) => {
      if (!currentUserId) return null;
      const input: CreateQuestionInput = {
        title,
        content: description,
        category: category ?? undefined,
        location: locationDetail?.name ?? undefined,
        tags,
        images,
        links,
        locationDetail: locationDetail?.lat || locationDetail?.lng ? locationDetail : undefined,
      };
      const result = await createQuestionMutation.mutateAsync({ authorId: currentUserId, input });
      return result?.id ?? null;
    },
    [createQuestionMutation, currentUserId]
  );

  const addAnswer = useCallback(
    (
      questionId: string,
      content: string,
      verifiedType?: "photo" | "location",
      images?: string[],
      links?: { title: string; url: string }[],
      locationDetail?: { name: string; address?: string; lat?: number; lng?: number }
    ) => {
      if (!currentUserId) return;
      const input: CreateAnswerInput = {
        question_id: questionId,
        content,
        verified_type: verifiedType,
        images,
        links,
        locationDetail,
      };
      createAnswerMutation.mutate({ authorId: currentUserId, input });
    },
    [createAnswerMutation, currentUserId]
  );

  const addCommentOnAnswer = useCallback(
    (answerId: string, content: string) => {
      if (!currentUserId) return;
      void addComment(answerId, currentUserId, content).then(() => {
        queryClient.invalidateQueries({ queryKey: ["answers"] });
      });
    },
    [currentUserId, queryClient]
  );

  const deleteQuestion = useCallback(
    (id: string) => deleteQuestionMutation.mutate(id),
    [deleteQuestionMutation]
  );

  const updateProfile = useCallback(
    async (
      name: string,
      username: string,
      bio: string,
      location: string,
      avatar: string,
      occupation: string,
      website: string,
      coverUrl?: string,
      businessInfo?: Record<string, unknown>
    ) => {
      if (!currentUserId) return null;

      const { data: currentProfile } = await supabase
        .from("profiles")
        .select("settings")
        .eq("id", currentUserId)
        .maybeSingle();

      const currentSettings = (currentProfile?.settings as Record<string, unknown>) || {};
      const newSettings = {
        ...currentSettings,
        occupation,
        website,
        cover_url: coverUrl,
        license_document_url:
          businessInfo?.licenseDocumentUrl !== undefined
            ? businessInfo.licenseDocumentUrl
            : currentSettings.license_document_url,
      };

      const input: Record<string, unknown> = {
        name,
        username,
        bio,
        location,
        avatar_url: avatar,
        settings: newSettings,
      };

      if (businessInfo) {
        if (businessInfo.businessCategory !== undefined) input.business_category = businessInfo.businessCategory;
        if (businessInfo.businessLicense !== undefined) input.business_license = businessInfo.businessLicense;
        if (businessInfo.businessAddress !== undefined) input.business_address = businessInfo.businessAddress;
        if (businessInfo.operatingHours !== undefined) input.operating_hours = businessInfo.operatingHours;
      }

      const result = await apiUpdateProfile(currentUserId, input);
      queryClient.invalidateQueries({ queryKey: queryKeys.currentUser(currentUserId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.users });
      return result;
    },
    [currentUserId, queryClient]
  );

  const addReview = useCallback(
    (
      entityId: string,
      rating: number,
      comment: string,
      images?: string[],
      links?: { title: string; url: string }[],
      visitDate?: string
    ) => {
      if (!currentUserId) return;
      createReviewMutation.mutate({
        reviewerId: currentUserId,
        input: { entity_id: entityId, rating, comment, images, links, visit_date: visitDate },
      });
    },
    [createReviewMutation, currentUserId]
  );

  const toggleVerifyEntity = useCallback(
    (userId: string) => {
      const currentState = !!users.find((u) => u.id === userId)?.isVerifiedEntity;
      void toggleEntityVerification(userId, currentState).then(() => {
        queryClient.invalidateQueries({ queryKey: queryKeys.users });
      });
    },
    [users, queryClient]
  );

  const deleteReview = useCallback((reviewId: string) => {
    void apiDeleteReview(reviewId);
  }, []);

  const markNotificationAsRead = useCallback(
    (id: string) => {
      if (!currentUserId) return;
      void markNotificationRead(currentUserId, id, queryClient);
    },
    [currentUserId, queryClient]
  );

  const markAllNotificationsAsRead = useCallback(() => {
    if (!currentUserId) return;
    void markAllNotificationsRead(currentUserId, queryClient);
  }, [currentUserId, queryClient]);

  const addNotification = useCallback(
    (type: "like" | "answer" | "system" | "achievement", title: string, content: string) => {
      if (!currentUserId) return;
      void insertNotification(currentUserId, { type, title, content }, queryClient);
    },
    [currentUserId, queryClient]
  );

  return {
    addQuestion,
    addAnswer,
    addCommentOnAnswer,
    deleteQuestion,
    updateProfile,
    addReview,
    toggleVerifyEntity,
    deleteReview,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    addNotification,
  };
}
