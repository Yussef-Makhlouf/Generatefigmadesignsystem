// Mock data for La3efo platform - can be replaced with API calls

export interface User {
  id: string;
  name: string;
  username: string;
  avatar?: string;
  reputation: number;
  bio?: string;
  location?: string;
  joined: string;
}

export interface Question {
  id: string;
  title: string;
  description: string;
  author: {
    name: string;
    avatar?: string;
    reputation: number;
  };
  votes: number;
  answers: number;
  tags: string[];
  location?: string;
  timestamp: string;
  isBookmarked?: boolean;
}

export interface Answer {
  id: string;
  questionId: string;
  content: string;
  author: {
    name: string;
    avatar?: string;
    reputation: number;
  };
  votes: number;
  timestamp: string;
  verified?: {
    type: "photo" | "location";
    label: string;
  };
  comments: Comment[];
}

export interface Comment {
  id: string;
  answerId: string;
  author: string;
  content: string;
  timestamp: string;
}

// Sample users
export const mockUsers: User[] = [
  {
    id: "1",
    name: "أحمد محمد",
    username: "ahmed",
    reputation: 1250,
    bio: "مطور برمجيات مهتم بالتقنية والتعليم",
    location: "الرياض، السعودية",
    joined: "يناير 2025",
  },
  {
    id: "2",
    name: "سارة علي",
    username: "sara",
    reputation: 2840,
    bio: "مهندسة برمجيات | خبيرة في React و Node.js",
    location: "جدة، السعودية",
    joined: "ديسمبر 2024",
  },
  {
    id: "3",
    name: "خالد عبدالله",
    username: "khaled",
    reputation: 450,
    location: "الدمام، السعودية",
    joined: "فبراير 2025",
  },
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
