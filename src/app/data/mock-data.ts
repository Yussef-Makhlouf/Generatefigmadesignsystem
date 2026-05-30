// Mock data for La3efo platform - can be replaced with API calls

export type AccountType = "individual" | "business" | "restaurant" | "clinic" | "doctor" | "activity" | "admin";

export interface User {
  id: string;
  name: string;
  username: string;
  avatar?: string;
  reputation: number;
  bio?: string;
  location?: string;
  joined: string;
  accountType: AccountType;
  
  // Specific entity details (optional)
  businessCategory?: string;       // e.g. "مأكولات", "صحة وعيادات", "ترفيه"
  businessLicense?: string;        // License or medical registration number
  businessAddress?: string;        // Detailed street address
  businessRating?: number;         // Average star rating (1.0 to 5.0)
  reviewsCount?: number;           // Total count of place reviews received
  operatingHours?: string;         // e.g. "9:00 ص - 10:00 م"
  isVerifiedEntity?: boolean;      // Moderation flag
}

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

export interface Question {
  id: string;
  title: string;
  description: string;
  author: {
    name: string;
    avatar?: string;
    reputation: number;
    accountType?: AccountType;
  };
  votes: number;
  answers: number;
  views?: number;
  tags: string[];
  location?: string;
  timestamp: string;
  isBookmarked?: boolean;
  
  // Attachment fields
  images?: string[];
  links?: AttachmentLink[];
  locationDetail?: AttachmentLocation;
}

export interface Answer {
  id: string;
  questionId: string;
  content: string;
  author: {
    name: string;
    avatar?: string;
    reputation: number;
    accountType?: AccountType;
  };
  votes: number;
  timestamp: string;
  verified?: {
    type: "photo" | "location";
    label: string;
  };
  comments: Comment[];
  
  // Attachment fields
  images?: string[];
  links?: AttachmentLink[];
  locationDetail?: AttachmentLocation;
}

export interface Comment {
  id: string;
  answerId: string;
  author: string;
  content: string;
  timestamp: string;
  
  // Attachment fields
  images?: string[];
  links?: AttachmentLink[];
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  entityId: string;                // The business user's ID being reviewed
  entityName: string;
  rating: number;                  // 1 to 5 stars
  comment: string;
  visitDate?: string;
  images?: string[];
  links?: AttachmentLink[];
  timestamp: string;
}

// Sample users
export const mockUsers: User[] = [
  {
    id: "1",
    name: "أحمد محمد",
    username: "ahmed",
    reputation: 1250,
    bio: "مطور برمجيات مهتم بالتقنية والتعليم والمشورة المحلية",
    location: "الرياض، السعودية",
    joined: "يناير 2025",
    accountType: "individual",
  },
  {
    id: "2",
    name: "سارة علي",
    username: "sara",
    reputation: 2840,
    bio: "مهندسة برمجيات | خبيرة في React و Node.js",
    location: "جدة، السعودية",
    joined: "ديسمبر 2024",
    accountType: "individual",
  },
  {
    id: "3",
    name: "خالد عبدالله",
    username: "khaled",
    reputation: 450,
    location: "الدمام، السعودية",
    joined: "فبراير 2025",
    accountType: "individual",
  },
  {
    id: "b1",
    name: "مطعم المذاق العربي",
    username: "arabic_taste",
    reputation: 500,
    bio: "أشهى المأكولات الشرقية والمشويات الأصيلة في قلب العاصمة",
    location: "الرياض، السعودية",
    joined: "يناير 2025",
    accountType: "restaurant",
    businessCategory: "مأكولات",
    businessLicense: "1010203040",
    businessAddress: "شارع التحلية، الرياض",
    businessRating: 4.8,
    reviewsCount: 24,
    operatingHours: "1:00 م - 1:00 ص",
    isVerifiedEntity: true,
  },
  {
    id: "b2",
    name: "عيادة الدكتور فهد لطب الأسنان",
    username: "dr_fahad_dental",
    reputation: 850,
    bio: "عيادة متخصصة في زراعة وتجميل الأسنان بأحدث التقنيات الطبية",
    location: "جدة، السعودية",
    joined: "فبراير 2025",
    accountType: "clinic",
    businessCategory: "صحة وعيادات",
    businessLicense: "M-553229",
    businessAddress: "طريق الملك، جدة",
    businessRating: 4.6,
    reviewsCount: 18,
    operatingHours: "9:00 ص - 9:00 م",
    isVerifiedEntity: true,
  },
  {
    id: "b3",
    name: "سينما ريل الرياض",
    username: "reel_riyadh",
    reputation: 350,
    bio: "تجربة سينمائية فاخرة بأحدث تقنيات العرض والصوت العالمية المبتكرة",
    location: "الرياض، السعودية",
    joined: "مارس 2025",
    accountType: "activity",
    businessCategory: "ترفيه",
    businessLicense: "2020405060",
    businessAddress: "رياض بارك مول، الرياض",
    businessRating: 4.2,
    reviewsCount: 15,
    operatingHours: "10:00 ص - 2:00 ص",
    isVerifiedEntity: false,
  }
];

// Sample questions
export const mockQuestions: Question[] = [
  {
    id: "1",
    title: "كيف يمكنني تعلم البرمجة من الصفر؟",
    description: "أنا مهتم بتعلم البرمجة ولكن لا أعرف من أين أبدأ. ما هي أفضل الموارد والمسارات للمبتدئين؟",
    author: { name: "أحمد محمد", reputation: 450 },
    votes: 42,
    answers: 15,
    tags: ["برمجة", "تعليم", "مبتدئين"],
    location: "الرياض",
    timestamp: "منذ ساعتين",
  },
  {
    id: "2",
    title: "ما هي أفضل الممارسات في تطوير تطبيقات الويب الحديثة؟",
    description: "أبحث عن نصائح وإرشادات حول أفضل الممارسات في تطوير تطبيقات الويب باستخدام التقنيات الحديثة.",
    author: { name: "سارة علي", reputation: 1250 },
    votes: 38,
    answers: 12,
    tags: ["تطوير ويب", "React", "تقنية"],
    timestamp: "منذ 3 ساعات",
  },
  {
    id: "3",
    title: "كيف أتعامل مع إدارة الحالة في React؟",
    description: "أواجه صعوبة في فهم متى أستخدم useState مقابل useContext مقابل Redux في تطبيقي.",
    author: { name: "خالد عبدالله", reputation: 320 },
    votes: 21,
    answers: 8,
    tags: ["React", "JavaScript", "برمجة"],
    timestamp: "منذ 5 ساعات",
  },
  {
    id: "4",
    title: "ما الفرق بين REST API و GraphQL؟",
    description: "أريد أن أفهم متى أختار REST وإمتى أختار GraphQL في مشاريعي.",
    author: { name: "عمر يوسف", reputation: 780 },
    votes: 17,
    answers: 6,
    tags: ["برمجة", "API", "تطوير ويب"],
    timestamp: "منذ يوم",
  },
  {
    id: "5",
    title: "ما هي أفضل الكتب لتعلم الذكاء الاصطناعي؟",
    description: "أبحث عن مصادر موثوقة لتعلم أساسيات الذكاء الاصطناعي وتعلم الآلة.",
    author: { name: "يوسف العمري", reputation: 1820 },
    votes: 55,
    answers: 22,
    tags: ["ذكاء اصطناعي", "تعلم آلة", "كتب"],
    timestamp: "منذ يومين",
  },
  {
    id: "6",
    title: "كيف أحسّن أداء قاعدة بيانات PostgreSQL؟",
    description: "تطبيقي يعاني من بطء في الاستعلامات. كيف يمكنني تحسين الفهارس والاستعلامات؟",
    author: { name: "فاطمة حسن", reputation: 940 },
    votes: 33,
    answers: 10,
    tags: ["قواعد البيانات", "PostgreSQL", "تقنية"],
    timestamp: "منذ 3 أيام",
  },
  {
    id: "7",
    title: "ما هي أفضل أدوات تصميم واجهات المستخدم؟",
    description: "أبحث عن أدوات احترافية لتصميم واجهات المستخدم. هل Figma هي الأفضل؟",
    author: { name: "ريم الزهراني", reputation: 680 },
    votes: 28,
    answers: 14,
    tags: ["تصميم", "UI", "Figma"],
    timestamp: "منذ 4 أيام",
  },
  {
    id: "8",
    title: "كيف أبدأ في مجال ريادة الأعمال التقنية؟",
    description: "لدي فكرة لشركة ناشئة تقنية. كيف أبدأ؟ ما هي الخطوات الأولى؟",
    author: { name: "محمد الأحمد", reputation: 560 },
    votes: 45,
    answers: 19,
    tags: ["ريادة أعمال", "تقنية", "شركات ناشئة"],
    timestamp: "منذ أسبوع",
  },
];

// Sample categories
export const mockCategories = [
  { name: "تقنية", count: 245, color: "bg-blue-500" },
  { name: "تعليم", count: 189, color: "bg-green-500" },
  { name: "صحة", count: 156, color: "bg-red-500" },
  { name: "أعمال", count: 134, color: "bg-purple-500" },
  { name: "علوم", count: 98, color: "bg-teal-500" },
];

// Sample cities
export const mockCities = [
  "الرياض",
  "جدة",
  "الدمام",
  "مكة المكرمة",
  "المدينة المنورة",
  "الخبر",
  "الطائف",
  "تبوك",
  "أبها",
  "القطيف",
];

// Sample tags
export const mockTags = [
  "برمجة",
  "تقنية",
  "تصميم",
  "أعمال",
  "تعليم",
  "صحة",
  "علوم",
  "رياضيات",
  "فنون",
  "موسيقى",
];
