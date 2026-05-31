import { useState } from "react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Users,
  MessageSquare,
  TrendingUp,
  Flag,
  Search,
  Check,
  X,
  ShieldAlert,
  ArrowUp,
  ArrowDown,
  Activity,
  Trash2,
  ShieldCheck,
  Star,
} from "lucide-react";
import { useAppState } from "../context/AppStateContext";
import { toast } from "sonner";

const growthData = [
  { month: "يناير", users: 120, questions: 320, answers: 650 },
  { month: "فبراير", users: 190, questions: 480, answers: 920 },
  { month: "مارس", users: 260, questions: 620, answers: 1150 },
  { month: "أبريل", users: 380, questions: 850, answers: 1600 },
  { month: "مايو", users: 520, questions: 1100, answers: 2100 },
  { month: "يونيو", users: 740, questions: 1450, answers: 2800 },
  { month: "يوليو", users: 980, questions: 1900, answers: 3600 },
  { month: "أغسطس", users: 1250, questions: 2400, answers: 4500 },
  { month: "سبتمبر", users: 1580, questions: 3000, answers: 5600 },
  { month: "أكتوبر", users: 1900, questions: 3700, answers: 6800 },
  { month: "نوفمبر", users: 2150, questions: 4400, answers: 8000 },
  { month: "ديسمبر", users: 2458, questions: 5200, answers: 9500 },
];

const topicsData = [
  { name: "تقنية", value: 32, color: "var(--primary)" },
  { name: "تعليم", value: 24, color: "var(--secondary)" },
  { name: "صحة", value: 18, color: "var(--destructive)" },
  { name: "أعمال", value: 15, color: "hsl(265, 90%, 65%)" },
  { name: "علوم", value: 11, color: "hsl(195, 90%, 50%)" },
];

const dailyActivityData = [
  { day: "السبت", active: 230 },
  { day: "الأحد", active: 310 },
  { day: "الاثنين", active: 280 },
  { day: "الثلاثاء", active: 420 },
  { day: "الأربعاء", active: 390 },
  { day: "الخميس", active: 350 },
  { day: "الجمعة", active: 180 },
];

export function AdminPage() {
  const {
    users,
    questions,
    reviews,
    answers,
    toggleVerifyEntity,
    deleteReview,
    deleteQuestion,
  } = useAppState();

  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [userFilter, setUserFilter] = useState("all");

  // Dynamic metrics calculation
  const pendingVerificationsCount = users.filter(
    (u) => u.accountType !== "individual" && !u.isVerifiedEntity
  ).length;

  const stats = [
    {
      title: "إجمالي الأعضاء والجهات",
      value: users.length.toString(),
      change: `+${users.filter(u => u.id.startsWith("user_")).length} جديد`,
      trend: "up",
      icon: Users,
      color: "text-primary",
      bg: "bg-primary/10 border-primary/20",
    },
    {
      title: "الأسئلة والحلول",
      value: questions.length.toString(),
      change: `+${questions.filter(q => q.timestamp === "الآن").length} نشط`,
      trend: "up",
      icon: MessageSquare,
      color: "text-secondary",
      bg: "bg-secondary/10 border-secondary/20",
    },
    {
      title: "تقييمات الأماكن والخدمات",
      value: reviews.length.toString(),
      change: `+${reviews.filter(r => r.timestamp === "الآن").length} جديد`,
      trend: "up",
      icon: Star,
      color: "text-amber-500",
      bg: "bg-amber-500/10 border-amber-500/20",
    },
    {
      title: "طلبات توثيق معلقة",
      value: pendingVerificationsCount.toString(),
      change: pendingVerificationsCount > 0 ? "تتطلب مراجعة" : "مكتمل",
      trend: pendingVerificationsCount > 0 ? "up" : "down",
      icon: ShieldCheck,
      color: pendingVerificationsCount > 0 ? "text-destructive" : "text-emerald-500",
      bg: pendingVerificationsCount > 0 ? "bg-destructive/10 border-destructive/20" : "bg-emerald-500/10 border-emerald-500/20",
    },
  ];

  // Filtering users
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.businessCategory && u.businessCategory.toLowerCase().includes(searchQuery.toLowerCase()));

    if (userFilter === "all") return matchesSearch;
    if (userFilter === "individual") return matchesSearch && u.accountType === "individual";
    if (userFilter === "business_entities") return matchesSearch && u.accountType !== "individual";
    if (userFilter === "unverified") return matchesSearch && u.accountType !== "individual" && !u.isVerifiedEntity;
    if (userFilter === "verified") return matchesSearch && u.isVerifiedEntity;
    return matchesSearch && u.accountType === userFilter;
  });

  const handleVerify = (userId: string, name: string, isVerified: boolean) => {
    toggleVerifyEntity(userId);
    toast.success(
      isVerified
        ? `تم إلغاء اعتماد توثيق الحساب لـ ${name}`
        : `تم اعتماد توثيق الحساب لـ ${name} بنجاح!`,
      { position: "bottom-center" }
    );
  };

  const handleDeleteReview = (reviewId: string, entityName: string) => {
    deleteReview(reviewId);
    toast.success(`تم حذف التقييم الخاص بـ ${entityName} بنجاح لمخالفته المعايير.`, {
      position: "bottom-center",
    });
  };

  const handleDeleteQuestion = (qId: string, title: string) => {
    deleteQuestion(qId);
    toast.success(`تم حذف السؤال "${title.substring(0, 20)}..." بنجاح.`, {
      position: "bottom-center",
    });
  };

  return (
    <div className="w-full relative animate-fade-in">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 arabic-geometric-mesh-fine pointer-events-none opacity-30 z-0" />
      <div className="absolute top-[-5%] right-[-5%] w-[350px] h-[350px] rounded-full bg-primary/5 blur-[100px] pointer-events-none z-0" />
      <div className="absolute bottom-[10%] left-[-10%] w-[350px] h-[350px] rounded-full bg-secondary/5 blur-[100px] pointer-events-none z-0" />

      <div className="relative w-full z-10">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold mb-2 font-heading tracking-tight flex items-center gap-3">
            <span className="p-2 rounded-xl bg-primary/10 border border-primary/20 text-primary shrink-0">
              <ShieldAlert className="h-5 w-5 sm:h-6 sm:w-6" />
            </span>
            <span>لوحة التحكم الإشرافية</span>
          </h1>
          <p className="text-text-secondary text-xs sm:text-sm">أدوات متطورة لإدارة مجتمع خبير والتحقق من التراخيص</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          {/* Tabs: icons only on mobile, full text on sm+ */}
          <TabsList className="w-full justify-start bg-card/50 border border-strong/20 mb-6 sm:mb-8 overflow-x-auto p-1.5 rounded-2xl gap-1 scrollbar-none flex">
            <TabsTrigger
              value="overview"
              className="rounded-xl px-3 sm:px-5 py-2.5 text-xs font-bold transition-all duration-300 min-w-[44px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md"
              title="نظرة عامة"
            >
              <Activity className="h-4 w-4 sm:ml-1.5 shrink-0" />
              <span className="hidden sm:inline whitespace-nowrap">نظرة عامة وتحليلات</span>
            </TabsTrigger>
            <TabsTrigger
              value="users"
              className="rounded-xl px-3 sm:px-5 py-2.5 text-xs font-bold transition-all duration-300 min-w-[44px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md"
              title="إدارة الأعضاء"
            >
              <Users className="h-4 w-4 sm:ml-1.5 shrink-0" />
              <span className="hidden sm:inline whitespace-nowrap">أعضاء ({users.length})</span>
            </TabsTrigger>
            <TabsTrigger
              value="moderation"
              className="rounded-xl px-3 sm:px-5 py-2.5 text-xs font-bold transition-all duration-300 min-w-[44px] flex items-center gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md"
              title="طلبات الإشراف"
            >
              <Flag className="h-4 w-4 shrink-0" />
              <span className="hidden sm:inline whitespace-nowrap">طلبات ومراجعات</span>
              {(pendingVerificationsCount > 0) && (
                <Badge className="bg-destructive text-destructive-foreground text-[10px] px-1.5 py-0.5 rounded-full">
                  {pendingVerificationsCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="rounded-xl px-3 sm:px-5 py-2.5 text-xs font-bold transition-all duration-300 min-w-[44px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md"
              title="القواعد"
            >
              <TrendingUp className="h-4 w-4 sm:ml-1.5 shrink-0" />
              <span className="hidden sm:inline whitespace-nowrap">القواعد والامتيازات</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6 outline-none">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((stat, idx) => {
                const Icon = stat.icon;
                return (
                  <Card
                    key={stat.title}
                    className="premium-glass-card border-strong/30 p-6 rounded-2xl flex flex-col justify-between hover:scale-[1.02] transition-all duration-300"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-2.5 rounded-xl border ${stat.bg} ${stat.color}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div
                        className={`flex items-center gap-1 text-[11px] font-bold ${
                          stat.trend === "up" ? "text-emerald-500" : "text-destructive"
                        }`}
                      >
                        {stat.trend === "up" ? (
                          <ArrowUp className="h-3.5 w-3.5 shrink-0" />
                        ) : (
                          <ArrowDown className="h-3.5 w-3.5 shrink-0" />
                        )}
                        <span>{stat.change}</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-3xl font-extrabold mb-1 numeral text-foreground">{stat.value}</div>
                      <div className="text-xs font-semibold text-text-secondary">{stat.title}</div>
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* Growth & Topics Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="premium-glass-card border-strong/30 p-6 rounded-2xl lg:col-span-2">
                <div className="mb-6">
                  <h3 className="text-lg font-bold font-heading flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    نمو المنصة والتفاعل
                  </h3>
                  <p className="text-xs text-text-muted">النمو التراكمي للمستخدمين والأسئلة والإجابات على مدار العام</p>
                </div>
                <div className="w-full overflow-hidden" style={{ direction: "ltr" }}>
                  <ResponsiveContainer width="100%" height={230}>
                    <LineChart data={growthData} margin={{ top: 10, right: 10, bottom: 5, left: -10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.2} />
                      <XAxis dataKey="month" tick={{ fontSize: 10, fill: "var(--text-muted)", fontFamily: "Cairo", fontWeight: 500 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: "var(--text-muted)", fontFamily: "Outfit", fontWeight: 500 }} axisLine={false} tickLine={false} width={40} />
                      <Tooltip contentStyle={{ background: "var(--glass-bg)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12, backdropFilter: "blur(10px)", textAlign: "right" }} />
                      <Line type="monotone" dataKey="users" name="مستخدمون" stroke="var(--secondary)" strokeWidth={3} dot={false} activeDot={{ r: 5 }} />
                      <Line type="monotone" dataKey="questions" name="أسئلة" stroke="var(--primary)" strokeWidth={3} dot={false} activeDot={{ r: 5 }} />
                      <Line type="monotone" dataKey="answers" name="إجابات" stroke="hsl(265, 90%, 65%)" strokeWidth={3} dot={false} activeDot={{ r: 5 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex gap-5 mt-4 justify-center flex-wrap">
                  {[
                    { label: "مستخدمون", color: "var(--secondary)" },
                    { label: "أسئلة", color: "var(--primary)" },
                    { label: "إجابات", color: "hsl(265, 90%, 65%)" }
                  ].map((l) => (
                    <div key={l.label} className="flex items-center gap-2 text-xs font-bold text-text-secondary">
                      <div className="w-3.5 h-1 rounded" style={{ background: l.color }} />
                      <span>{l.label}</span>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="premium-glass-card border-strong/30 p-6 rounded-2xl">
                <div className="mb-5">
                  <h3 className="text-lg font-bold font-heading">توزيع مواضيع الحوار</h3>
                  <p className="text-xs text-text-muted">النسب المئوية لأكثر مجالات الأسئلة نشاطاً</p>
                </div>
                <div className="relative flex justify-center items-center h-[180px]" style={{ direction: "ltr" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={topicsData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} dataKey="value" paddingAngle={3}>
                        {topicsData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v) => `${v}%`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2 mt-4">
                  {topicsData.map((t) => (
                    <div key={t.name} className="flex items-center justify-between text-xs font-bold">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-md" style={{ background: t.color }} />
                        <span className="text-text-secondary">{t.name}</span>
                      </div>
                      <span className="numeral text-foreground">{t.value.toLocaleString("ar-SA")}%</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Daily Activity */}
            <Card className="premium-glass-card border-strong/30 p-6 rounded-2xl">
              <div className="mb-5">
                <h3 className="text-lg font-bold font-heading flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  أوقات الذروة والنشاط اليومي
                </h3>
                <p className="text-xs text-text-muted">مراقبة كثافة الحضور والزيارات اليومية للأعضاء</p>
              </div>
              <div className="w-full overflow-hidden" style={{ direction: "ltr" }}>
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={dailyActivityData} margin={{ top: 10, right: 10, bottom: 5, left: -15 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.2} vertical={false} />
                    <XAxis dataKey="day" tick={{ fontSize: 11, fill: "var(--text-muted)", fontFamily: "Cairo", fontWeight: 500 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "var(--text-muted)", fontFamily: "Outfit", fontWeight: 500 }} axisLine={false} tickLine={false} width={35} />
                    <Tooltip contentStyle={{ background: "var(--glass-bg)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12, textAlign: "right" }} />
                    <Bar dataKey="active" name="مستعلم نشط" fill="var(--primary)" radius={[5, 5, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6 outline-none">
            {/* Filters */}
            <Card className="premium-glass-card border-strong/30 p-4 rounded-2xl">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                  <Input
                    placeholder="البحث بالاسم أو اسم المستخدم أو التخصص..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pr-10 bg-input-background/40 border-strong/45 rounded-xl hover:border-primary/50 focus:ring-primary h-11 transition-all duration-200"
                  />
                </div>
                <Select value={userFilter} onValueChange={setUserFilter}>
                  <SelectTrigger className="w-full md:w-52 bg-input-background/40 border-strong/45 rounded-xl h-11 hover:border-primary/50 transition-all duration-200">
                    <SelectValue placeholder="تصفية فئة العضو" />
                  </SelectTrigger>
                  <SelectContent className="premium-glass-card border-strong/40 rounded-xl">
                    <SelectItem value="all">جميع الأعضاء والجهات</SelectItem>
                    <SelectItem value="individual">أعضاء مستقلين (مستكشفين)</SelectItem>
                    <SelectItem value="business_entities">الجهات والمنشآت (تطاريح/أطباء/عيادات)</SelectItem>
                    <SelectItem value="doctor">الأطباء الممارسين</SelectItem>
                    <SelectItem value="clinic">المجمعات والعيادات الطبية</SelectItem>
                    <SelectItem value="restaurant">المطاعم والمقاهي</SelectItem>
                    <SelectItem value="activity">الأنشطة والجهات الترفيهية</SelectItem>
                    <SelectItem value="business">الشركات والخدمات التجارية</SelectItem>
                    <SelectItem value="unverified">جهات تجارية معلقة التوثيق</SelectItem>
                    <SelectItem value="verified">الجهات الموثقة فقط</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </Card>

            {/* Users Table */}
            <Card className="premium-glass-card border-strong/30 overflow-hidden rounded-2xl">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/50 border-b border-strong/20">
                    <TableRow>
                      <TableHead className="text-right text-xs font-bold text-text-secondary py-4">الاسم / الجهة</TableHead>
                      <TableHead className="text-right text-xs font-bold text-text-secondary py-4">فئة الحساب</TableHead>
                      <TableHead className="text-right text-xs font-bold text-text-secondary py-4">الموقع الجغرافي</TableHead>
                      <TableHead className="text-right text-xs font-bold text-text-secondary py-4">النقاط (السمعة)</TableHead>
                      <TableHead className="text-right text-xs font-bold text-text-secondary py-4">حالة التوثيق</TableHead>
                      <TableHead className="text-right text-xs font-bold text-text-secondary py-4">الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-text-muted font-medium">
                          لا يوجد أعضاء يطابقون خيارات البحث الحالية.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredUsers.map((user) => (
                        <TableRow key={user.id} className="hover:bg-primary/[0.01] transition-colors border-b border-strong/10 last:border-0">
                          <TableCell className="font-bold text-foreground py-4 text-sm flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs select-none">
                              {user.name.substring(0, 2)}
                            </div>
                            <div>
                              <span>{user.name}</span>
                              <span className="block text-[10px] text-text-muted font-normal font-numbers mt-0.5">@{user.username}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-text-secondary text-sm">
                            <Badge
                              variant="secondary"
                              className={`rounded-lg text-[10px] font-bold ${
                                user.accountType === "individual" ? "bg-muted text-muted-foreground" :
                                user.accountType === "doctor" ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" :
                                user.accountType === "clinic" ? "bg-teal-500/10 text-teal-500 border border-teal-500/20" :
                                user.accountType === "restaurant" ? "bg-secondary/10 text-secondary border border-secondary/20" :
                                user.accountType === "activity" ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" :
                                "bg-sky-500/10 text-sky-500 border border-sky-500/20"
                              }`}
                            >
                              {user.accountType === "individual" ? "مستقل" :
                               user.accountType === "doctor" ? "طبيب" :
                               user.accountType === "clinic" ? "عيادة" :
                               user.accountType === "restaurant" ? "مطعم" :
                               user.accountType === "activity" ? "نشاط" : "شركة"}
                            </Badge>
                            {user.businessCategory && (
                              <span className="block text-[10px] text-text-muted mt-1 font-medium">{user.businessCategory}</span>
                            )}
                          </TableCell>
                          <TableCell className="text-text-secondary text-xs font-semibold">{user.location || "غير محدد"}</TableCell>
                          <TableCell className="numeral text-sm font-bold text-primary">{user.reputation.toLocaleString('ar-SA')}</TableCell>
                          <TableCell>
                            <Badge
                              className={`rounded-lg text-[10px] font-bold border px-2.5 py-0.5 shadow-sm ${
                                user.accountType === "individual"
                                  ? "bg-muted/40 text-text-muted border-transparent"
                                  : user.isVerifiedEntity
                                  ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                  : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                              }`}
                            >
                              {user.accountType === "individual" ? "عضو مستكشف" : user.isVerifiedEntity ? "موثق معتمد" : "معلق المراجعة"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {user.accountType !== "individual" ? (
                              <Button
                                variant="outline"
                                size="sm"
                                className={`rounded-xl h-9 px-3 transition-all duration-200 ${
                                  user.isVerifiedEntity
                                    ? "border-destructive/20 text-destructive hover:bg-destructive/10"
                                    : "border-primary/20 text-primary hover:bg-primary/10"
                                }`}
                                onClick={() => handleVerify(user.id, user.name, !!user.isVerifiedEntity)}
                              >
                                {user.isVerifiedEntity ? (
                                  <>
                                    <X className="h-3.5 w-3.5 ml-1" />
                                    إلغاء التوثيق
                                  </>
                                ) : (
                                  <>
                                    <Check className="h-3.5 w-3.5 ml-1" />
                                    توثيق واعتماد
                                  </>
                                )}
                              </Button>
                            ) : (
                              <span className="text-xs text-text-muted font-medium">-</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </TabsContent>

          {/* Moderation Tab */}
          <TabsContent value="moderation" className="space-y-6 outline-none">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Verification Queue Card */}
              <Card className="premium-glass-card border-strong/30 p-6 rounded-2xl">
                <div className="mb-6 border-b border-strong/15 pb-4">
                  <h3 className="text-lg font-bold font-heading flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-primary" />
                    طلبات توثيق التراخيص المهنية
                    {pendingVerificationsCount > 0 && (
                      <Badge className="bg-destructive text-white rounded-full text-xs px-2 py-0.5">
                        {pendingVerificationsCount}
                      </Badge>
                    )}
                  </h3>
                  <p className="text-xs text-text-muted">مراجعة أرقام السجلات والمستندات الطبية المرفوعة من العيادات والأطباء والمطاعم</p>
                </div>

                <div className="space-y-4">
                  {users.filter(u => u.accountType !== 'individual' && !u.isVerifiedEntity).length === 0 ? (
                    <div className="text-center py-12 text-text-muted font-medium bg-muted/20 border border-dashed border-strong/20 rounded-xl">
                      <ShieldCheck className="h-8 w-8 text-emerald-500 mx-auto mb-2 animate-bounce-cta" />
                      <span>جميع طلبات التراخيص والتحقق معتمدة حالياً!</span>
                    </div>
                  ) : (
                    users.filter(u => u.accountType !== 'individual' && !u.isVerifiedEntity).map((entity) => (
                      <Card key={entity.id} className="premium-glass-card border-strong/25 p-5 rounded-xl hover:border-primary/40 transition-all duration-300">
                        <div className="space-y-3.5">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-bold text-foreground text-sm">{entity.name}</h4>
                              <p className="text-[10px] text-text-muted mt-0.5 font-numbers">@{entity.username}</p>
                            </div>
                            <Badge
                              className={`rounded-lg text-[10px] font-bold ${
                                entity.accountType === "doctor" ? "bg-emerald-500/10 text-emerald-500" :
                                entity.accountType === "clinic" ? "bg-teal-500/10 text-teal-500" :
                                entity.accountType === "restaurant" ? "bg-secondary/10 text-secondary" :
                                "bg-sky-500/10 text-sky-500"
                              }`}
                            >
                              {entity.accountType === "doctor" ? "طبيب" :
                               entity.accountType === "clinic" ? "عيادة" :
                               entity.accountType === "restaurant" ? "مطعم" : "شركة"}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-2 gap-3 text-[11px] font-semibold text-text-secondary bg-muted/40 p-3 rounded-lg border border-strong/10">
                            <div>
                              <span className="text-[10px] text-text-muted block font-medium">الرقم المرفوع للترخيص:</span>
                              <code className="text-primary font-mono select-all text-xs">{entity.businessLicense || "SR-9938283"}</code>
                            </div>
                            <div>
                              <span className="text-[10px] text-text-muted block font-medium">تصنيف التخصص:</span>
                              <span>{entity.businessCategory || "خدمات عامة"}</span>
                            </div>
                            <div className="col-span-2 border-t border-strong/10 pt-1.5 mt-1.5">
                              <span className="text-[10px] text-text-muted block font-medium">العنوان الجغرافي:</span>
                              <span>{entity.businessAddress || "غير مسجل"}</span>
                            </div>
                            <div className="col-span-2">
                              <span className="text-[10px] text-text-muted block font-medium">ساعات الدوام اليومي:</span>
                              <span>{entity.operatingHours || "٩ ص - ٩ م"}</span>
                            </div>
                          </div>

                          {entity.settings?.license_document_url && (
                            <div className="border border-strong/10 rounded-lg p-2.5 bg-background/40 flex items-center justify-between gap-3 text-[11px]">
                              <div className="flex items-center gap-2">
                                {entity.settings.license_document_url.match(/\.(jpeg|jpg|gif|png)$/i) || !entity.settings.license_document_url.endsWith(".pdf") ? (
                                  <img src={entity.settings.license_document_url} alt="Document" className="h-10 w-10 object-cover rounded border border-strong/15" />
                                ) : (
                                  <div className="h-10 w-10 bg-primary/10 border border-primary/20 text-primary flex items-center justify-center rounded">
                                    <ShieldCheck className="h-5 w-5" />
                                  </div>
                                )}
                                <div>
                                  <span className="font-bold text-foreground">مستند التوثيق المرفوع</span>
                                  <span className="block text-[10px] text-text-muted">انقر لعرض الترخيص أو السجل التجاري</span>
                                </div>
                              </div>
                              <a
                                href={entity.settings.license_document_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2.5 py-1 text-[10px] font-bold text-primary bg-primary/10 border border-primary/20 hover:bg-primary hover:text-white rounded-lg transition-colors flex items-center gap-1"
                              >
                                <span>عرض</span>
                              </a>
                            </div>
                          )}

                          <div className="flex gap-2 justify-end pt-1">
                            <Button
                              size="sm"
                              className="rounded-xl bg-primary text-white h-8 text-xs font-bold shadow-md hover:scale-[1.03] transition-all"
                              onClick={() => handleVerify(entity.id, entity.name, false)}
                            >
                              <Check className="h-3.5 w-3.5 ml-1" />
                              اعتماد المستند والتوثيق
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </Card>

              {/* Reviews Moderation Card */}
              <Card className="premium-glass-card border-strong/30 p-6 rounded-2xl">
                <div className="mb-6 border-b border-strong/15 pb-4">
                  <h3 className="text-lg font-bold font-heading flex items-center gap-2">
                    <Star className="h-5 w-5 text-amber-500 shrink-0" />
                    مراقبة تقييمات الأماكن والخدمات ({reviews.length})
                  </h3>
                  <p className="text-xs text-text-muted">متابعة المراجعات والتقييمات المكتوبة للجهات وحذف المنشورات غير اللائقة</p>
                </div>

                <div className="space-y-4 max-h-[550px] overflow-y-auto pr-1">
                  {reviews.length === 0 ? (
                    <div className="text-center py-12 text-text-muted font-medium bg-muted/20 border border-dashed border-strong/20 rounded-xl">
                      <span>لا يوجد تقييمات مسجلة في المنصة بعد.</span>
                    </div>
                  ) : (
                    reviews.map((review) => (
                      <Card key={review.id} className="premium-glass-card border-strong/25 p-4 rounded-xl hover:border-amber-500/20 transition-all duration-300">
                        <div className="space-y-2.5">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-foreground text-xs">{review.userName}</span>
                                <span className="text-[10px] text-text-muted">قيّم</span>
                                <strong className="text-primary text-xs">{review.entityName}</strong>
                              </div>
                              <span className="text-[10px] text-text-muted font-numbers block mt-0.5 numeral">
                                تاريخ الزيارة: {review.visitDate || "غير محدد"} • {review.timestamp}
                              </span>
                            </div>
                            <div className="flex gap-0.5">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-3 w-3 ${
                                    i < review.rating ? "text-amber-500 fill-amber-500" : "text-strong"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>

                          <p className="text-xs font-medium text-foreground leading-relaxed bg-muted/30 p-2.5 rounded-lg border border-strong/10">
                            {review.comment}
                          </p>

                          <div className="flex gap-2 justify-end pt-1">
                            <Button
                              size="sm"
                              variant="outline"
                              className="rounded-xl border-destructive/20 text-destructive hover:bg-destructive/10 h-8 text-xs font-bold"
                              onClick={() => handleDeleteReview(review.id, review.entityName)}
                            >
                              <Trash2 className="h-3.5 w-3.5 ml-1" />
                              حذف التقييم المخالف
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </Card>
            </div>

            {/* Questions Moderation Stream */}
            <Card className="premium-glass-card border-strong/30 p-6 rounded-2xl">
              <div className="mb-6 border-b border-strong/15 pb-4">
                <h3 className="text-lg font-bold font-heading flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary shrink-0" />
                  مراجعة الأسئلة المطروحة ({questions.length})
                </h3>
                <p className="text-xs text-text-muted">مراقبة محتوى الأسئلة والاستفسارات للتأكد من موافقتها لشروط الاستخدام</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {questions.map((q) => (
                  <Card key={q.id} className="premium-glass-card border-strong/25 p-4 rounded-xl hover:border-primary/20 transition-all duration-300 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <h4 className="font-bold text-foreground text-sm line-clamp-1">{q.title}</h4>
                        <Badge className="bg-primary/10 text-primary border border-primary/20 rounded-lg text-[9px] font-bold shrink-0">
                          {q.tags[0] || "عام"}
                        </Badge>
                      </div>
                      <p className="text-xs text-text-muted line-clamp-2 leading-relaxed mb-3">{q.description}</p>
                      <div className="flex items-center justify-between text-[10px] text-text-muted font-semibold">
                        <span>بواسطة: <strong className="text-foreground">{q.author.name}</strong></span>
                        <span className="numeral">{q.timestamp}</span>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 mt-4 pt-2 border-t border-strong/10">
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-xl border-destructive/25 text-destructive hover:bg-destructive/10 h-8 text-[11px] font-bold"
                        onClick={() => handleDeleteQuestion(q.id, q.title)}
                      >
                        <Trash2 className="h-3 w-3 ml-1" />
                        حذف السؤال
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6 outline-none">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="premium-glass-card border-strong/30 p-6 rounded-2xl">
                <div className="mb-5 border-b border-strong/15 pb-3">
                  <h3 className="text-lg font-bold font-heading">إدارة التصنيفات المحلية والعلمية</h3>
                  <p className="text-xs text-text-muted">تعديل وإضافة مجالات التخصص الرئيسية المتوفرة للأسئلة والأنشطة</p>
                </div>
                <div className="space-y-3">
                  {["تقنية", "تعليم", "صحة", "أعمال", "مطاعم ومقاهي", "طب وصحة", "سياحة وترفيه"].map((category) => (
                    <div
                      key={category}
                      className="flex items-center justify-between p-3.5 border border-strong/15 rounded-xl hover:bg-primary/[0.01] transition-all duration-200"
                    >
                      <span className="text-sm font-bold text-foreground">{category}</span>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" className="text-xs font-bold text-primary hover:bg-primary/10 rounded-xl h-8">
                          تعديل
                        </Button>
                        <Button variant="ghost" size="sm" className="text-xs font-bold text-destructive hover:bg-destructive/10 rounded-xl h-8">
                          حذف
                        </Button>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full rounded-xl border-dashed border-primary/40 hover:border-primary text-primary transition-all duration-300 font-bold h-11 mt-4">
                    إضافة تصنيف جديد للمنصة
                  </Button>
                </div>
              </Card>

              <Card className="premium-glass-card border-strong/30 p-6 rounded-2xl">
                <div className="mb-5 border-b border-strong/15 pb-3">
                  <h3 className="text-lg font-bold font-heading">معايير النقاط ومحرك السمعة</h3>
                  <p className="text-xs text-text-muted">تعديل خوارزمية اكتساب السمعة والامتيازات داخل النظام الفكري لخبير</p>
                </div>
                <div className="space-y-3 text-xs font-semibold">
                  {[
                    { rule: "طرح سؤال جديد بالمجتمع", score: "+٥ نقاط" },
                    { rule: "الحصول على ترخيص مهني معتمد", score: "+١٥٠ نقطة توثيقية" },
                    { rule: "إضافة تقييم/مراجعة مع التواريخ", score: "+١٥ نقطة" },
                    { rule: "تقديم إجابة حرة موثوقة من خبير", score: "+١٠ نقاط" },
                    { rule: "الحصول على تصويت إيجابي من الأعضاء", score: "+١٥ نقطة" },
                  ].map((r, i) => (
                    <div key={i} className="flex justify-between items-center py-3 border-b border-strong/10 last:border-0">
                      <span className="text-text-secondary">{r.rule}</span>
                      <span className="font-extrabold numeral text-primary text-sm">{r.score}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

