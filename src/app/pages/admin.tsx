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
  Legend,
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
} from "lucide-react";

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
  { name: "تقنية", value: 32, color: "#2563EB" },
  { name: "تعليم", value: 24, color: "#0D9488" },
  { name: "صحة", value: 18, color: "#EF4444" },
  { name: "أعمال", value: 15, color: "#8B5CF6" },
  { name: "علوم", value: 11, color: "#F59E0B" },
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
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [userFilter, setUserFilter] = useState("all");

  // Mock data
  const stats = [
    {
      title: "إجمالي المستخدمين",
      value: "2,458",
      change: "+12%",
      trend: "up",
      icon: Users,
      color: "text-blue-600",
    },
    {
      title: "إجمالي الأسئلة",
      value: "8,234",
      change: "+8%",
      trend: "up",
      icon: MessageSquare,
      color: "text-green-600",
    },
    {
      title: "إجمالي الإجابات",
      value: "15,678",
      change: "+15%",
      trend: "up",
      icon: TrendingUp,
      color: "text-teal-600",
    },
    {
      title: "البلاغات المعلقة",
      value: "23",
      change: "-5%",
      trend: "down",
      icon: Flag,
      color: "text-red-600",
    },
  ];

  const users = [
    {
      id: "1",
      name: "أحمد محمد",
      email: "ahmed@example.com",
      role: "user",
      reputation: 1250,
      status: "active",
      joined: "2025-01-15",
    },
    {
      id: "2",
      name: "سارة علي",
      email: "sara@example.com",
      role: "moderator",
      reputation: 2840,
      status: "active",
      joined: "2024-12-10",
    },
    {
      id: "3",
      name: "خالد عبدالله",
      email: "khaled@example.com",
      role: "user",
      reputation: 450,
      status: "suspended",
      joined: "2025-02-01",
    },
  ];

  const reports = [
    {
      id: "1",
      type: "question",
      content: "محتوى غير لائق في سؤال...",
      reportedBy: "عمر يوسف",
      reason: "محتوى مخالف",
      timestamp: "منذ ساعة",
      status: "pending",
    },
    {
      id: "2",
      type: "answer",
      content: "إجابة مسيئة تحتوي على...",
      reportedBy: "فاطمة حسن",
      reason: "إساءة",
      timestamp: "منذ 3 ساعات",
      status: "pending",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">لوحة التحكم</h1>
        <p className="text-muted-foreground">إدارة المنصة والمستخدمين والمحتوى</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full justify-start bg-card border border-border mb-6 overflow-x-auto">
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="users">المستخدمين</TabsTrigger>
          <TabsTrigger value="moderation">الإشراف</TabsTrigger>
          <TabsTrigger value="settings">الإعدادات</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.title} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-2 rounded-lg bg-muted ${stat.color}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div
                      className={`flex items-center gap-1 text-xs font-medium ${
                        stat.trend === "up" ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {stat.trend === "up" ? (
                        <ArrowUp className="h-3 w-3" />
                      ) : (
                        <ArrowDown className="h-3 w-3" />
                      )}
                      {stat.change}
                    </div>
                  </div>
                  <div className="text-2xl font-bold mb-1">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.title}</div>
                </Card>
              );
            })}
          </div>

          {/* Growth Chart */}
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="p-6 md:col-span-2">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                نمو المنصة
              </h3>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={growthData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} width={35} />
                  <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                  <Line type="monotone" dataKey="users" name="مستخدمون" stroke="#2563EB" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="questions" name="أسئلة" stroke="#0D9488" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="answers" name="إجابات" stroke="#8B5CF6" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
              <div className="flex gap-4 mt-2 justify-center flex-wrap">
                {[{ label: "مستخدمون", color: "#2563EB" }, { label: "أسئلة", color: "#0D9488" }, { label: "إجابات", color: "#8B5CF6" }].map((l) => (
                  <div key={l.label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <div className="w-3 h-0.5 rounded" style={{ background: l.color }} />
                    {l.label}
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">توزيع المواضيع</h3>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={topicsData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={2}>
                    {topicsData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => `${v}%`} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-2">
                {topicsData.map((t) => (
                  <div key={t.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-sm" style={{ background: t.color }} />
                      <span className="text-muted-foreground">{t.name}</span>
                    </div>
                    <span className="font-medium">{t.value}%</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Daily Activity */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Activity className="h-4 w-4 text-secondary" />
              النشاط اليومي (هذا الأسبوع)
            </h3>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={dailyActivityData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} width={35} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="active" name="مستخدم نشط" fill="#0D9488" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Recent Activity */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4">النشاط الأخير</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-green-500 mt-2" />
                <div className="flex-1">
                  <p className="text-sm">انضم مستخدم جديد: محمد الأحمد</p>
                  <p className="text-xs text-muted-foreground">منذ 10 دقائق</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
                <div className="flex-1">
                  <p className="text-sm">سؤال جديد: كيف أتعلم React؟</p>
                  <p className="text-xs text-muted-foreground">منذ 25 دقيقة</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-red-500 mt-2" />
                <div className="flex-1">
                  <p className="text-sm">بلاغ جديد على محتوى</p>
                  <p className="text-xs text-muted-foreground">منذ ساعة</p>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          {/* Filters */}
          <Card className="p-4">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="ابحث عن مستخدم..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10 bg-input-background"
                />
              </div>
              <Select value={userFilter} onValueChange={setUserFilter}>
                <SelectTrigger className="w-full md:w-48 bg-input-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع المستخدمين</SelectItem>
                  <SelectItem value="active">نشط</SelectItem>
                  <SelectItem value="suspended">موقوف</SelectItem>
                  <SelectItem value="moderator">مشرف</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Card>

          {/* Users Table */}
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">الاسم</TableHead>
                  <TableHead className="text-right">البريد الإلكتروني</TableHead>
                  <TableHead className="text-right">الدور</TableHead>
                  <TableHead className="text-right">النقاط</TableHead>
                  <TableHead className="text-right">الحالة</TableHead>
                  <TableHead className="text-right">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={user.role === "moderator" ? "default" : "secondary"}>
                        {user.role === "moderator" ? "مشرف" : "مستخدم"}
                      </Badge>
                    </TableCell>
                    <TableCell>{user.reputation.toLocaleString('ar-SA')}</TableCell>
                    <TableCell>
                      <Badge
                        variant={user.status === "active" ? "default" : "destructive"}
                        className={
                          user.status === "active"
                            ? "bg-green-100 text-green-700 border-green-300"
                            : ""
                        }
                      >
                        {user.status === "active" ? "نشط" : "موقوف"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {user.status === "active" ? (
                          <Button variant="outline" size="sm" className="rounded-lg">
                            <X className="h-4 w-4 ml-1" />
                            إيقاف
                          </Button>
                        ) : (
                          <Button variant="outline" size="sm" className="rounded-lg">
                            <Check className="h-4 w-4 ml-1" />
                            تفعيل
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Moderation Tab */}
        <TabsContent value="moderation" className="space-y-4">
          <Card className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-red-600" />
              قائمة الانتظار للإشراف
            </h3>
            <div className="space-y-4">
              {reports.map((report) => (
                <Card key={report.id} className="p-4 border-red-200">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="rounded-full">
                          {report.type === "question" ? "سؤال" : "إجابة"}
                        </Badge>
                        <Badge variant="destructive" className="rounded-full">
                          {report.reason}
                        </Badge>
                      </div>
                      <p className="text-sm mb-2">{report.content}</p>
                      <p className="text-xs text-muted-foreground">
                        بلّغ بواسطة {report.reportedBy} • {report.timestamp}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="rounded-lg">
                        <Check className="h-4 w-4 ml-1 text-green-600" />
                        قبول
                      </Button>
                      <Button variant="outline" size="sm" className="rounded-lg">
                        <X className="h-4 w-4 ml-1 text-red-600" />
                        رفض
                      </Button>
                      <Button variant="outline" size="sm" className="rounded-lg">
                        <Flag className="h-4 w-4 ml-1" />
                        علّم
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <Card className="p-6">
            <h3 className="font-semibold mb-4">إدارة التصنيفات</h3>
            <div className="space-y-3">
              {["تقنية", "تعليم", "صحة", "أعمال", "علوم"].map((category) => (
                <div
                  key={category}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <span>{category}</span>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm">
                      تعديل
                    </Button>
                    <Button variant="ghost" size="sm" className="text-red-600">
                      حذف
                    </Button>
                  </div>
                </div>
              ))}
              <Button variant="outline" className="w-full rounded-lg">
                إضافة تصنيف جديد
              </Button>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold mb-4">قواعد النقاط</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between p-2">
                <span>طرح سؤال</span>
                <span className="font-medium">+5 نقاط</span>
              </div>
              <div className="flex justify-between p-2">
                <span>كتابة إجابة</span>
                <span className="font-medium">+10 نقاط</span>
              </div>
              <div className="flex justify-between p-2">
                <span>تصويت إيجابي على إجابتك</span>
                <span className="font-medium">+15 نقاط</span>
              </div>
              <div className="flex justify-between p-2">
                <span>قبول إجابتك</span>
                <span className="font-medium">+25 نقاط</span>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
