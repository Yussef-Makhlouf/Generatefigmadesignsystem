import React, { createContext, useContext, useState, useEffect } from "react";
import {
  Question,
  Answer,
  User,
  mockQuestions as initialQuestions,
  mockUsers,
  AttachmentLink,
  AttachmentLocation,
  Review,
} from "../data/mock-data";

// Initial mock answers since they are inline in question-detail.tsx, let's define a robust set
const initialAnswers: Answer[] = [
  {
    id: "a1",
    questionId: "1",
    content: "أنصحك بالبدء بلغة Python فهي سهلة التعلم وممتازة للمبتدئين. يمكنك استخدام منصات مثل Codecademy أو freeCodeCamp. المهم هو الممارسة اليومية وبناء مشاريع صغيرة.",
    author: { name: "سارة علي", avatar: "", reputation: 2840 },
    votes: 28,
    timestamp: "منذ ساعة",
    verified: { type: "photo", label: "تم التحقق من الخبرة" },
    comments: [
      { id: "c1", answerId: "a1", author: "خالد عبدالله", content: "نصيحة رائعة، شكراً!", timestamp: "منذ 30 دقيقة" },
    ],
  },
  {
    id: "a2",
    questionId: "1",
    content: "بالإضافة لما ذكر، أنصحك بالانضمام لمجتمعات المطورين المحلية والعالمية. التعلم مع آخرين يساعد كثيراً في الاستمرارية والتحفيز.",
    author: { name: "خالد عبدالله", avatar: "", reputation: 450 },
    votes: 15,
    timestamp: "منذ 45 دقيقة",
    verified: { type: "location", label: "من نفس المدينة" },
    comments: [],
  },
  {
    id: "a3",
    questionId: "1",
    content: "أهم شيء هو تحديد هدفك أولاً. هل تريد تطوير تطبيقات ويب؟ أم علم البيانات؟ أم تطوير الألعاب؟ كل مجال له مساره المناسب.",
    author: { name: "فاطمة حسن", avatar: "", reputation: 940 },
    votes: 11,
    timestamp: "منذ ساعتين",
    comments: [],
  },
];

const initialReviews: Review[] = [
  {
    id: "r1",
    userId: "1",
    userName: "أحمد محمد",
    entityId: "b1",
    entityName: "مطعم المذاق العربي",
    rating: 5,
    comment: "المشويات هنا مذهلة والخدمة سريعة وممتازة! أنصح بشدة بزيارته وعائلته.",
    visitDate: "2026-05-10",
    timestamp: "منذ أسبوع",
  },
  {
    id: "r2",
    userId: "2",
    userName: "سارة علي",
    entityId: "b2",
    entityName: "عيادة الدكتور فهد لطب الأسنان",
    rating: 5,
    comment: "دكتور فهد محترف جداً والعيادة غاية في النظافة والتعقيم. الخدمة كانت رائعة وبدون ألم.",
    visitDate: "2026-05-15",
    timestamp: "منذ يومين",
  }
];

export interface NotificationItem {
  id: string;
  type: "like" | "answer" | "system" | "achievement";
  title: string;
  content: string;
  timestamp: string;
  read: boolean;
}

interface AppState {
  questions: Question[];
  answers: Answer[];
  currentUser: User;
  users: User[];
  notifications: NotificationItem[];
  bookmarkedIds: string[];
  reviews: Review[];
}

interface AppStateContextProps extends AppState {
  addQuestion: (
    title: string,
    description: string,
    tags: string[],
    location?: string,
    images?: string[],
    links?: AttachmentLink[],
    locationDetail?: AttachmentLocation
  ) => string;
  deleteQuestion: (id: string) => void;
  addAnswer: (
    questionId: string,
    content: string,
    verifiedType?: "photo" | "location",
    images?: string[],
    links?: AttachmentLink[],
    locationDetail?: AttachmentLocation
  ) => void;
  addComment: (
    answerId: string,
    content: string,
    images?: string[],
    links?: AttachmentLink[]
  ) => void;
  voteQuestion: (questionId: string, dir: "up" | "down") => void;
  voteAnswer: (answerId: string, dir: "up" | "down") => void;
  toggleBookmark: (questionId: string) => boolean;
  updateProfile: (
    name: string,
    bio: string,
    location: string,
    avatar: string,
    interests: string[],
    extraFields?: Partial<User>
  ) => void;
  addNotification: (type: "like" | "answer" | "system" | "achievement", title: string, content: string) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  setCurrentUser: React.Dispatch<React.SetStateAction<User>>;
  addReview: (
    entityId: string,
    rating: number,
    comment: string,
    images?: string[],
    links?: AttachmentLink[],
    visitDate?: string
  ) => void;
  toggleVerifyEntity: (userId: string) => void;
  deleteReview: (reviewId: string) => void;
}

const AppStateContext = createContext<AppStateContextProps | undefined>(undefined);

export const AppStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = localStorage.getItem("khapeer_current_user");
    if (saved) return JSON.parse(saved);
    return mockUsers[0]; // احمد محمد
  });

  const [questions, setQuestions] = useState<Question[]>(() => {
    const saved = localStorage.getItem("khapeer_questions");
    if (saved) return JSON.parse(saved);
    return initialQuestions;
  });

  const [answers, setAnswers] = useState<Answer[]>(() => {
    const saved = localStorage.getItem("khapeer_answers");
    if (saved) return JSON.parse(saved);
    return initialAnswers;
  });

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem("khapeer_users");
    if (saved) return JSON.parse(saved);
    return mockUsers;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem("khapeer_notifications");
    if (saved) return JSON.parse(saved);
    return [
      {
        id: "n1",
        type: "answer",
        title: "إجابة جديدة على سؤالك",
        content: "أضافت سارة علي إجابة جديدة على سؤالك 'كيف يمكنني تعلم البرمجة من الصفر؟'",
        timestamp: "منذ ساعة",
        read: false,
      },
      {
        id: "n2",
        type: "achievement",
        title: "إنجاز جديد!",
        content: "لقد حصلت على شارة 'مساهم نشط' لتفاعلك المستمر هذا الأسبوع.",
        timestamp: "منذ يومين",
        read: true,
      },
    ];
  });

  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(() => {
    const saved = localStorage.getItem("khapeer_bookmarks");
    return saved ? JSON.parse(saved) : ["1", "3"]; // Default bookmarks matching mockSaved
  });

  const [reviews, setReviews] = useState<Review[]>(() => {
    const saved = localStorage.getItem("khapeer_reviews");
    return saved ? JSON.parse(saved) : initialReviews;
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem("khapeer_current_user", JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem("khapeer_questions", JSON.stringify(questions));
  }, [questions]);

  useEffect(() => {
    localStorage.setItem("khapeer_answers", JSON.stringify(answers));
  }, [answers]);

  useEffect(() => {
    localStorage.setItem("khapeer_users", JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem("khapeer_notifications", JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem("khapeer_bookmarks", JSON.stringify(bookmarkedIds));
  }, [bookmarkedIds]);

  useEffect(() => {
    localStorage.setItem("khapeer_reviews", JSON.stringify(reviews));
  }, [reviews]);

  // Actions
  const addQuestion = (
    title: string,
    description: string,
    tags: string[],
    location?: string,
    images?: string[],
    links?: AttachmentLink[],
    locationDetail?: AttachmentLocation
  ) => {
    const newId = (questions.length + 1).toString();
    const newQ: Question = {
      id: newId,
      title,
      description,
      author: {
        name: currentUser.name,
        avatar: currentUser.avatar,
        reputation: currentUser.reputation,
        accountType: currentUser.accountType,
      },
      votes: 0,
      answers: 0,
      tags,
      location,
      timestamp: "الآن",
      images,
      links,
      locationDetail,
    };
    setQuestions((prev) => [newQ, ...prev]);
    // award reputation for asking question
    setCurrentUser((prev) => ({ ...prev, reputation: prev.reputation + 5 }));
    return newId;
  };

  const deleteQuestion = (id: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
    setAnswers((prev) => prev.filter((a) => a.questionId !== id));
    setBookmarkedIds((prev) => prev.filter((bid) => bid !== id));
  };

  const addAnswer = (
    questionId: string,
    content: string,
    verifiedType?: "photo" | "location",
    images?: string[],
    links?: AttachmentLink[],
    locationDetail?: AttachmentLocation
  ) => {
    const newId = "a_" + (answers.length + 1).toString();
    const newAns: Answer = {
      id: newId,
      questionId,
      content,
      author: {
        name: currentUser.name,
        avatar: currentUser.avatar,
        reputation: currentUser.reputation,
        accountType: currentUser.accountType,
      },
      votes: 0,
      timestamp: "الآن",
      comments: [],
      verified: verifiedType ? { type: verifiedType, label: verifiedType === "photo" ? "تم التحقق بالصورة" : "من نفس المدينة" } : undefined,
      images,
      links,
      locationDetail,
    };
    setAnswers((prev) => [...prev, newAns]);

    // Update answer count on question
    setQuestions((prev) =>
      prev.map((q) => (q.id === questionId ? { ...q, answers: q.answers + 1 } : q))
    );

    // Award reputation
    setCurrentUser((prev) => ({ ...prev, reputation: prev.reputation + 15 }));
  };

  const addComment = (
    answerId: string,
    content: string,
    images?: string[],
    links?: AttachmentLink[]
  ) => {
    const newComment = {
      id: "c_" + Date.now().toString(),
      answerId,
      author: currentUser.name,
      content,
      timestamp: "الآن",
      images,
      links,
    };

    setAnswers((prev) =>
      prev.map((ans) =>
        ans.id === answerId ? { ...ans, comments: [...ans.comments, newComment] } : ans
      )
    );
  };

  const voteQuestion = (questionId: string, dir: "up" | "down") => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id === questionId) {
          const delta = dir === "up" ? 1 : -1;
          return { ...q, votes: q.votes + delta };
        }
        return q;
      })
    );
  };

  const voteAnswer = (answerId: string, dir: "up" | "down") => {
    setAnswers((prev) =>
      prev.map((a) => {
        if (a.id === answerId) {
          const delta = dir === "up" ? 1 : -1;
          return { ...a, votes: a.votes + delta };
        }
        return a;
      })
    );
  };

  const toggleBookmark = (questionId: string) => {
    let isBookmarkedNow = false;
    setBookmarkedIds((prev) => {
      if (prev.includes(questionId)) {
        return prev.filter((id) => id !== questionId);
      } else {
        isBookmarkedNow = true;
        return [...prev, questionId];
      }
    });
    return isBookmarkedNow;
  };

  const updateProfile = (
    name: string,
    bio: string,
    location: string,
    avatar: string,
    interests: string[],
    extraFields?: Partial<User>
  ) => {
    const updatedUser = {
      ...currentUser,
      name,
      bio,
      location,
      avatar,
      ...extraFields,
    };
    setCurrentUser(updatedUser);
    // also update in users list
    setUsers((prev) =>
      prev.map((u) => (u.id === currentUser.id ? { ...u, ...updatedUser } : u))
    );
  };

  const addNotification = (type: "like" | "answer" | "system" | "achievement", title: string, content: string) => {
    const newNotif: NotificationItem = {
      id: "n_" + Date.now().toString(),
      type,
      title,
      content,
      timestamp: "الآن",
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const addReview = (
    entityId: string,
    rating: number,
    comment: string,
    images?: string[],
    links?: AttachmentLink[],
    visitDate?: string
  ) => {
    const newReview: Review = {
      id: "r_" + Date.now().toString(),
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      entityId,
      entityName: users.find((u) => u.id === entityId)?.name || "جهة غير معروفة",
      rating,
      comment,
      visitDate,
      images,
      links,
      timestamp: "الآن",
    };
    
    setReviews((prev) => [newReview, ...prev]);

    // Recalculate average rating for reviewed business in users list
    setUsers((prevUsers) =>
      prevUsers.map((u) => {
        if (u.id === entityId) {
          const entityReviews = [newReview, ...reviews].filter((r) => r.entityId === entityId);
          const totalRating = entityReviews.reduce((sum, r) => sum + r.rating, 0);
          const avgRating = totalRating / entityReviews.length;
          return {
            ...u,
            businessRating: parseFloat(avgRating.toFixed(1)),
            reviewsCount: entityReviews.length,
          };
        }
        return u;
      })
    );
    
    addNotification("like", "تقييم جديد لخدمتك!", `أضاف ${currentUser.name} تقييماً بـ ${rating} نجوم لصفحتك.`);
  };

  const toggleVerifyEntity = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, isVerifiedEntity: !u.isVerifiedEntity } : u))
    );
    if (currentUser.id === userId) {
      setCurrentUser((prev) => ({ ...prev, isVerifiedEntity: !prev.isVerifiedEntity }));
    }
  };

  const deleteReview = (reviewId: string) => {
    const reviewToDelete = reviews.find((r) => r.id === reviewId);
    if (!reviewToDelete) return;
    
    const entityId = reviewToDelete.entityId;
    const updatedReviews = reviews.filter((r) => r.id !== reviewId);
    setReviews(updatedReviews);

    // Recalculate average rating for the entity
    setUsers((prevUsers) =>
      prevUsers.map((u) => {
        if (u.id === entityId) {
          const entityReviews = updatedReviews.filter((r) => r.entityId === entityId);
          if (entityReviews.length === 0) {
            return {
              ...u,
              businessRating: undefined,
              reviewsCount: 0,
            };
          }
          const totalRating = entityReviews.reduce((sum, r) => sum + r.rating, 0);
          const avgRating = totalRating / entityReviews.length;
          return {
            ...u,
            businessRating: parseFloat(avgRating.toFixed(1)),
            reviewsCount: entityReviews.length,
          };
        }
        return u;
      })
    );
  };

  return (
    <AppStateContext.Provider
      value={{
        questions,
        answers,
        currentUser,
        users,
        notifications,
        bookmarkedIds,
        reviews,
        addQuestion,
        deleteQuestion,
        addAnswer,
        addComment,
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
  if (context === undefined) {
    throw new Error("useAppState must be used within an AppStateProvider");
  }
  return context;
};
