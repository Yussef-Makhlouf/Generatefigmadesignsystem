import { useState } from "react";
import { useNavigate } from "react-router";
import { Card } from "../components/ui/card";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { Switch } from "../components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import {
  User,
  Bell,
  Lock,
  Eye,
  Globe,
  Palette,
  Shield,
  Mail,
  MapPin,
  Briefcase,
  AlertCircle,
  Check,
  X,
  Upload,
  Trash2,
  Star,
  MessageSquare
} from "lucide-react";
import { toast } from "sonner";
import { useAppState } from "../context/AppStateContext";

export function SettingsPage() {
  const navigate = useNavigate();
  const { currentUser, updateProfile, reviews, deleteReview } = useAppState();
  const [activeTab, setActiveTab] = useState("profile");
  const [isSaving, setIsSaving] = useState(false);

  // Profile settings
  const [name, setName] = useState(currentUser.name);
  const [username, setUsername] = useState(currentUser.username);
  const [email, setEmail] = useState("mohammad@example.com");
  const [bio, setBio] = useState(currentUser.bio || "مطور برمجيات مهتم بالتقنية والتعليم");
  const [location, setLocation] = useState(currentUser.location || "الرياض، السعودية");
  const [occupation, setOccupation] = useState("مهندس برمجيات");
  const [website, setWebsite] = useState("");

  // Business/Professional settings
  const [businessCategory, setBusinessCategory] = useState(currentUser.businessCategory || "");
  const [businessLicense, setBusinessLicense] = useState(currentUser.businessLicense || "");
  const [businessAddress, setBusinessAddress] = useState(currentUser.businessAddress || "");
  const [operatingHours, setOperatingHours] = useState(currentUser.operatingHours || "");

  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [newAnswers, setNewAnswers] = useState(true);
  const [newComments, setNewComments] = useState(true);
  const [mentions, setMentions] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);
  const [marketingEmails, setMarketingEmails] = useState(false);

  // Privacy settings
  const [profileVisibility, setProfileVisibility] = useState("public");
  const [showEmail, setShowEmail] = useState(false);
  const [showLocation, setShowLocation] = useState(true);
  const [allowMessages, setAllowMessages] = useState(true);

  // Appearance settings
  const [theme, setTheme] = useState("system");
  const [language, setLanguage] = useState("ar");

  const handleSaveProfile = () => {
    setIsSaving(true);
    setTimeout(() => {
      updateProfile(name, bio, location, currentUser.avatar || "", [], {
        businessCategory,
        businessLicense,
        businessAddress,
        operatingHours,
      });
      setIsSaving(false);
      toast.success("تم حفظ التغييرات بنجاح");
    }, 1000);
  };

  const handleSaveNotifications = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success("تم تحديث إعدادات الإشعارات");
    }, 1000);
  };

  const handleSavePrivacy = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success("تم تحديث إعدادات الخصوصية");
    }, 1000);
  };

  const handleDeleteAccount = () => {
    if (confirm("هل أنت متأكد من حذف حسابك نهائياً؟ لا يمكن التراجع عن هذا الإجراء.")) {
      toast.error("تم تقديم طلب حذف الحساب");
    }
  };

  return (
    <div className="max-w-4xl w-full mx-auto animate-fade-in relative pb-8" >
      {/* Decorative Ambient Auroras */}
      <div className="absolute top-0 right-1/4 w-[350px] h-[350px] bg-primary/10 rounded-full blur-[120px] pointer-events-none -z-10 animate-float" />
      <div className="absolute bottom-1/4 left-1/4 w-[300px] h-[300px] bg-secondary/5 rounded-full blur-[100px] pointer-events-none -z-10" />

      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-primary mb-1.5">
          الإعدادات
        </h1>
        <p className="text-sm text-text-secondary">إدارة حسابك وتفضيلاتك الرقمية بالكامل</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} dir="rtl">
        {/* Responsive Tabs: icons-only on mobile, icons+labels on sm+ */}
        <TabsList className="w-full justify-start bg-card/45 border border-border/45 mb-6 overflow-x-auto rounded-2xl p-1.5 backdrop-blur-md scrollbar-none flex gap-1">
          <TabsTrigger
            value="profile"
            className="flex items-center gap-2 rounded-xl transition-all duration-300 px-3 py-2.5 min-w-[44px]"
            title="الملف الشخصي"
          >
            <User className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline whitespace-nowrap">الملف الشخصي</span>
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="flex items-center gap-2 rounded-xl transition-all duration-300 px-3 py-2.5 min-w-[44px]"
            title="الإشعارات"
          >
            <Bell className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline whitespace-nowrap">الإشعارات</span>
          </TabsTrigger>
          <TabsTrigger
            value="privacy"
            className="flex items-center gap-2 rounded-xl transition-all duration-300 px-3 py-2.5 min-w-[44px]"
            title="الخصوصية"
          >
            <Shield className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline whitespace-nowrap">الخصوصية</span>
          </TabsTrigger>
          <TabsTrigger
            value="appearance"
            className="flex items-center gap-2 rounded-xl transition-all duration-300 px-3 py-2.5 min-w-[44px]"
            title="المظهر"
          >
            <Palette className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline whitespace-nowrap">المظهر</span>
          </TabsTrigger>
          <TabsTrigger
            value="security"
            className="flex items-center gap-2 rounded-xl transition-all duration-300 px-3 py-2.5 min-w-[44px]"
            title="الأمان"
          >
            <Lock className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline whitespace-nowrap">الأمان</span>
          </TabsTrigger>
          <TabsTrigger
            value="reviews"
            className="flex items-center gap-2 rounded-xl transition-all duration-300 px-3 py-2.5 min-w-[44px]"
            title="تقييماتي السابقة"
          >
            <MessageSquare className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline whitespace-nowrap">تقييماتي</span>
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6" dir="rtl">
          <div className="premium-glass-card p-6 border border-border/45 rounded-2xl">
            <h2 className="text-lg font-bold text-text-primary mb-5 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-primary rounded-full" />
              المعلومات الشخصية
            </h2>

            {/* Avatar */}
            <div className="flex items-center gap-5 mb-8 bg-muted/20 p-4 rounded-2xl border border-border/25">
              <Avatar className="h-20 w-20 border-2 border-primary/20 shadow-md">
                <AvatarImage src="" />
                <AvatarFallback className="text-2xl font-bold bg-primary text-white">
                  {name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button variant="outline" size="sm" className="rounded-xl border-border/60 hover:border-primary/40 bg-card hover:bg-muted transition-all duration-200">
                  <Upload className="h-4 w-4 ml-2" />
                  تحميل صورة
                </Button>
                <Button variant="ghost" size="sm" className="rounded-xl text-destructive hover:bg-destructive/5 transition-all duration-200">
                  <Trash2 className="h-4 w-4 ml-2" />
                  حذف
                </Button>
              </div>
            </div>

            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-text-primary">الاسم الكامل</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="rounded-xl border-border/60 bg-background/30 focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-300 input-glow"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-text-primary">اسم المستخدم</Label>
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="rounded-xl border-border/60 bg-background/30 focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-300 input-glow"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-text-primary">البريد الإلكتروني</Label>
                <div className="relative">
                  <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="rounded-xl pr-10 border-border/60 bg-background/30 focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-300 input-glow"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio" className="text-text-primary">السيرة الذاتية</Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  className="rounded-xl resize-none border-border/60 bg-background/30 focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-300 input-glow leading-relaxed"
                  maxLength={160}
                />
                <p className="text-xs text-text-muted text-left font-numbers">
                  {bio.length}/160 حرف
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="location" className="text-text-primary">الموقع</Label>
                  <div className="relative">
                    <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                    <Input
                      id="location"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="rounded-xl pr-10 border-border/60 bg-background/30 focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-300 input-glow"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="occupation" className="text-text-primary">المهنة</Label>
                  <div className="relative">
                    <Briefcase className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                    <Input
                      id="occupation"
                      value={occupation}
                      onChange={(e) => setOccupation(e.target.value)}
                      className="rounded-xl pr-10 border-border/60 bg-background/30 focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-300 input-glow"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="website" className="text-text-primary">الموقع الإلكتروني</Label>
                <div className="relative">
                  <Globe className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                  <Input
                    id="website"
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://"
                    className="rounded-xl pr-10 border-border/60 bg-background/30 focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-300 input-glow text-left"
                    dir="ltr"
                  />
                </div>
              </div>

              {currentUser.accountType !== "individual" && (
                <div className="space-y-5 border-t border-border/20 pt-6 mt-6">
                  <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
                    <span className="w-1.5 h-3.5 bg-secondary rounded-full" />
                    تفاصيل النشاط التجاري / المهني ({
                      currentUser.accountType === "restaurant" ? "مطعم ومقهى" :
                      currentUser.accountType === "clinic" ? "عيادة طبية" :
                      currentUser.accountType === "doctor" ? "طبيب متخصص" :
                      currentUser.accountType === "activity" ? "وجهة ترفيهية" : "شركة تجارية"
                    })
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="businessCategory" className="text-text-primary">تصنيف النشاط</Label>
                      <Select value={businessCategory} onValueChange={setBusinessCategory}>
                        <SelectTrigger className="rounded-xl border-border/60 bg-background/30 focus:border-primary transition-all duration-300 input-glow">
                          <SelectValue placeholder="اختر التصنيف الرئيسي" />
                        </SelectTrigger>
                        <SelectContent className="border-border/45 bg-popover/95 backdrop-blur-md rounded-xl">
                          <SelectItem value="مأكولات">مطعم / مقهى (مأكولات)</SelectItem>
                          <SelectItem value="صحة وعيادات">عيادة طبية / طبيب (صحة)</SelectItem>
                          <SelectItem value="ترفيه">ترفيه وفعاليات</SelectItem>
                          <SelectItem value="تعليم">مؤسسة تعليمية</SelectItem>
                          <SelectItem value="أعمال">خدمات وأعمال</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="operatingHours" className="text-text-primary">أوقات العمل</Label>
                      <Input
                        id="operatingHours"
                        value={operatingHours}
                        onChange={(e) => setOperatingHours(e.target.value)}
                        placeholder="مثال: 9:00 ص - 10:00 م"
                        className="rounded-xl border-border/60 bg-background/30 focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-300 input-glow"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="businessAddress" className="text-text-primary">العنوان التفصيلي للمنشأة</Label>
                      <div className="relative">
                        <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                        <Input
                          id="businessAddress"
                          value={businessAddress}
                          onChange={(e) => setBusinessAddress(e.target.value)}
                          placeholder="مثال: شارع التحلية، حي السليمانية"
                          className="rounded-xl pr-10 border-border/60 bg-background/30 focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-300 input-glow"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="businessLicense" className="text-text-primary">رقم الترخيص / السجل التجاري</Label>
                      <div className="relative">
                        <Briefcase className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                        <Input
                          id="businessLicense"
                          value={businessLicense}
                          onChange={(e) => setBusinessLicense(e.target.value)}
                          placeholder="مثال: 1010203040"
                          className="rounded-xl pr-10 border-border/60 bg-background/30 focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-300 input-glow"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Verification Documents Upload Zone */}
                  <div className="p-5 rounded-2xl border border-border/30 bg-muted/5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <h4 className="text-sm font-bold text-text-primary">مستندات التوثيق والترخيص المهني</h4>
                        <p className="text-xs text-text-muted">قم بإرفاق صورة السجل التجاري أو ترخيص الهيئة الصحية لاعتماد حسابك</p>
                      </div>
                      <Badge
                        className={`rounded-xl text-xs font-bold px-3 py-1 border shadow-sm ${
                          currentUser.isVerifiedEntity
                            ? "bg-success-light text-success border-success/20"
                            : businessLicense.trim()
                            ? "bg-warning-light text-warning border-warning/20"
                            : "bg-muted text-text-muted border-border/20"
                        }`}
                      >
                        {currentUser.isVerifiedEntity
                          ? "موثق بالكامل"
                          : businessLicense.trim()
                          ? "قيد المراجعة"
                          : "بانتظار إرفاق المستندات"}
                      </Badge>
                    </div>

                    <div 
                      className="border-2 border-dashed border-border/60 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-primary/50 transition-all duration-300 bg-background/20"
                      onClick={() => toast.info("تم تفعيل إرفاق المستند. بانتظار موافقة الإدارة.")}
                    >
                      <Upload className="h-8 w-8 text-text-muted mb-2 animate-pulse" />
                      <span className="text-sm font-semibold text-text-primary mb-1">اسحب مستند الترخيص هنا، أو تصفح الملفات</span>
                      <span className="text-xs text-text-muted">الحد الأقصى للملف: 5 ميجابايت (PDF, PNG, JPG)</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Button
              className="mt-8 rounded-xl bg-primary hover:bg-primary-hover hover:shadow-primary/20 hover:shadow-lg transition-all duration-300 text-white font-medium"
              onClick={handleSaveProfile}
              disabled={isSaving}
            >
              {isSaving ? (
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin ml-2" />
              ) : (
                <Check className="h-4 w-4 ml-2" />
              )}
              حفظ التغييرات
            </Button>
          </div>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6" dir="rtl">
          <div className="premium-glass-card p-6 border border-border/45 rounded-2xl">
            <h2 className="text-lg font-bold text-text-primary mb-5 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-primary rounded-full" />
              تفضيلات الإشعارات
            </h2>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-text-primary font-bold">إشعارات البريد الإلكتروني</Label>
                  <p className="text-xs text-text-muted leading-relaxed">
                    استلام تفاصيل التفاعل عبر بريدك الإلكتروني المسجل
                  </p>
                </div>
                <Switch
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
              </div>

              <Separator className="bg-border/30" />

              <div className="space-y-5">
                <h3 className="font-bold text-sm text-text-primary flex items-center gap-2">
                  <span className="w-1 h-3 bg-secondary rounded-full" />
                  إشعارات النشاط
                </h3>

                <div className="flex items-center justify-between p-3 rounded-xl bg-muted/10 border border-border/20">
                  <div className="space-y-0.5">
                    <Label className="text-text-primary">إجابات جديدة</Label>
                    <p className="text-xs text-text-muted">
                      عند إجابة أحد الخبراء على سؤالك المطروح
                    </p>
                  </div>
                  <Switch
                    checked={newAnswers}
                    onCheckedChange={setNewAnswers}
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-muted/10 border border-border/20">
                  <div className="space-y-0.5">
                    <Label className="text-text-primary">تعليقات جديدة</Label>
                    <p className="text-xs text-text-muted">
                      عند كتابة تعليق على إجاباتك أو منشوراتك
                    </p>
                  </div>
                  <Switch
                    checked={newComments}
                    onCheckedChange={setNewComments}
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-muted/10 border border-border/20">
                  <div className="space-y-0.5">
                    <Label className="text-text-primary">الإشارات</Label>
                    <p className="text-xs text-text-muted">
                      عند ذكر اسمك أو الإشارة إليك في نقاش
                    </p>
                  </div>
                  <Switch
                    checked={mentions}
                    onCheckedChange={setMentions}
                  />
                </div>
              </div>

              <Separator className="bg-border/30" />

              <div className="space-y-5">
                <h3 className="font-bold text-sm text-text-primary flex items-center gap-2">
                  <span className="w-1 h-3 bg-primary rounded-full" />
                  النشرات الإخبارية
                </h3>

                <div className="flex items-center justify-between p-3 rounded-xl bg-muted/10 border border-border/20">
                  <div className="space-y-0.5">
                    <Label className="text-text-primary">ملخص أسبوعي</Label>
                    <p className="text-xs text-text-muted">
                      ملخص دوري لأبرز الأسئلة والتفاعلات المتميزة
                    </p>
                  </div>
                  <Switch
                    checked={weeklyDigest}
                    onCheckedChange={setWeeklyDigest}
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-muted/10 border border-border/20">
                  <div className="space-y-0.5">
                    <Label className="text-text-primary">رسائل تسويقية</Label>
                    <p className="text-xs text-text-muted">
                      متابعة آخر التحديثات، الخصائص والعروض في منصة خبير
                    </p>
                  </div>
                  <Switch
                    checked={marketingEmails}
                    onCheckedChange={setMarketingEmails}
                  />
                </div>
              </div>
            </div>

            <Button
              className="mt-8 rounded-xl bg-primary hover:bg-primary-hover hover:shadow-primary/20 hover:shadow-lg transition-all duration-300 text-white font-medium"
              onClick={handleSaveNotifications}
              disabled={isSaving}
            >
              {isSaving ? (
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin ml-2" />
              ) : (
                <Check className="h-4 w-4 ml-2" />
              )}
              حفظ التغييرات
            </Button>
          </div>
        </TabsContent>

        {/* Privacy Tab */}
        <TabsContent value="privacy" className="space-y-6" dir="rtl">
          <div className="premium-glass-card p-6 border border-border/45 rounded-2xl">
            <h2 className="text-lg font-bold text-text-primary mb-5 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-primary rounded-full" />
              إعدادات الخصوصية
            </h2>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="text-text-primary font-bold mb-1 block">ظهور الملف الشخصي</Label>
                <Select value={profileVisibility} onValueChange={setProfileVisibility}>
                  <SelectTrigger className="rounded-xl border-border/60 bg-background/30 focus:border-primary transition-all duration-300 input-glow">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-border/45 bg-popover/95 backdrop-blur-md rounded-xl">
                    <SelectItem value="public">عام - يمكن للجميع رؤيته</SelectItem>
                    <SelectItem value="members">الأعضاء المسجلين فقط</SelectItem>
                    <SelectItem value="private">خاص - أنت فقط من يمكنه رؤية الملف</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator className="bg-border/30" />

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-xl bg-muted/10 border border-border/20">
                  <div className="space-y-0.5">
                    <Label className="text-text-primary">إظهار البريد الإلكتروني</Label>
                    <p className="text-xs text-text-muted">
                      السماح لأعضاء المنصة برؤية بريدك الإلكتروني في صفحتك
                    </p>
                  </div>
                  <Switch
                    checked={showEmail}
                    onCheckedChange={setShowEmail}
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-muted/10 border border-border/20">
                  <div className="space-y-0.5">
                    <Label className="text-text-primary">إظهار الموقع</Label>
                    <p className="text-xs text-text-muted">
                      عرض مدينتك ودولتك في ملفك الشخصي للعامة
                    </p>
                  </div>
                  <Switch
                    checked={showLocation}
                    onCheckedChange={setShowLocation}
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-muted/10 border border-border/20">
                  <div className="space-y-0.5">
                    <Label className="text-text-primary">السماح بالرسائل</Label>
                    <p className="text-xs text-text-muted">
                      تمكين الآخرين من بدء محادثات مباشرة معك
                    </p>
                  </div>
                  <Switch
                    checked={allowMessages}
                    onCheckedChange={setAllowMessages}
                  />
                </div>
              </div>
            </div>

            <Button
              className="mt-8 rounded-xl bg-primary hover:bg-primary-hover hover:shadow-primary/20 hover:shadow-lg transition-all duration-300 text-white font-medium"
              onClick={handleSavePrivacy}
              disabled={isSaving}
            >
              {isSaving ? (
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin ml-2" />
              ) : (
                <Check className="h-4 w-4 ml-2" />
              )}
              حفظ التغييرات
            </Button>
          </div>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance" className="space-y-6" dir="rtl">
          <div className="premium-glass-card p-6 border border-border/45 rounded-2xl">
            <h2 className="text-lg font-bold text-text-primary mb-5 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-primary rounded-full" />
              المظهر والعرض
            </h2>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="text-text-primary font-bold mb-1 block">السمة البصرية</Label>
                <Select value={theme} onValueChange={setTheme}>
                  <SelectTrigger className="rounded-xl border-border/60 bg-background/30 focus:border-primary transition-all duration-300 input-glow">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-border/45 bg-popover/95 backdrop-blur-md rounded-xl">
                    <SelectItem value="light">فاتح (شروق المعرفة)</SelectItem>
                    <SelectItem value="dark">داكن (إشعاع المعرفة)</SelectItem>
                    <SelectItem value="system">تلقائي (حسب النظام)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-text-muted leading-relaxed mt-1.5">
                  اختر نمط الألوان المناسب لراحتك البصرية
                </p>
              </div>

              <Separator className="bg-border/30" />

              <div className="space-y-2">
                <Label className="text-text-primary font-bold mb-1 block">لغة المنصة</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="rounded-xl border-border/60 bg-background/30 focus:border-primary transition-all duration-300 input-glow">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-border/45 bg-popover/95 backdrop-blur-md rounded-xl">
                    <SelectItem value="ar">العربية (رسمي)</SelectItem>
                    <SelectItem value="en">English (الانجليزية)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              className="mt-8 rounded-xl bg-primary hover:bg-primary-hover hover:shadow-primary/20 hover:shadow-lg transition-all duration-300 text-white font-medium"
              onClick={() => {
                setIsSaving(true);
                setTimeout(() => {
                  setIsSaving(false);
                  toast.success("تم تحديث إعدادات المظهر");
                }, 1000);
              }}
              disabled={isSaving}
            >
              {isSaving ? (
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin ml-2" />
              ) : (
                <Check className="h-4 w-4 ml-2" />
              )}
              حفظ التغييرات
            </Button>
          </div>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6" dir="rtl">
          <div className="premium-glass-card p-6 border border-border/45 rounded-2xl">
            <h2 className="text-lg font-bold text-text-primary mb-5 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-primary rounded-full" />
              الأمان وحماية الحساب
            </h2>

            <div className="space-y-5">
              <div className="space-y-2">
                <Label className="text-text-primary">كلمة المرور الحالية</Label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  className="rounded-xl border-border/60 bg-background/30 focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-300 input-glow text-left"
                  dir="ltr"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-text-primary">كلمة المرور الجديدة</Label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  className="rounded-xl border-border/60 bg-background/30 focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-300 input-glow text-left"
                  dir="ltr"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-text-primary">تأكيد كلمة المرور الجديدة</Label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  className="rounded-xl border-border/60 bg-background/30 focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-300 input-glow text-left"
                  dir="ltr"
                />
              </div>

              <Button variant="outline" className="mt-2 rounded-xl border-primary/20 hover:border-primary/40 bg-primary/5 hover:bg-primary/10 text-primary transition-all duration-200 font-medium">
                تغيير كلمة المرور
              </Button>
            </div>
          </div>

          <div className="premium-glass-card p-6 border border-destructive/25 bg-destructive/[0.02] rounded-2xl shadow-md">
            <div className="flex items-start gap-4 mb-5">
              <div className="h-10 w-10 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center justify-center text-destructive shrink-0">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-destructive mb-1">منطقة الخطر</h2>
                <p className="text-xs text-text-secondary leading-relaxed">
                  حذف حسابك بشكل نهائي من منصة خبير. لا يمكن استعادة البيانات أو التراجع عن هذا الإجراء لاحقاً.
                </p>
              </div>
            </div>

            <Button
              variant="destructive"
              className="rounded-xl hover:shadow-destructive/20 hover:shadow-md transition-all duration-300 font-medium"
              onClick={handleDeleteAccount}
            >
              <Trash2 className="h-4 w-4 ml-2" />
              حذف الحساب نهائياً
            </Button>
          </div>
        </TabsContent>

        {/* Reviews Tab */}
        <TabsContent value="reviews" className="space-y-6" dir="rtl">
          <div className="premium-glass-card p-6 border border-border/45 rounded-2xl">
            <h2 className="text-lg font-bold text-text-primary mb-5 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-primary rounded-full" />
              تقييماتي ومراجعاتي السابقة
            </h2>

            {reviews.filter((r) => r.userId === currentUser.id).length === 0 ? (
              <div className="text-center py-12 bg-muted/5 border border-dashed border-border/30 rounded-2xl">
                <MessageSquare className="h-10 w-10 text-text-muted mx-auto mb-3" />
                <p className="text-text-secondary font-medium">لم تقم بكتابة أي تقييمات حتى الآن.</p>
                <p className="text-xs text-text-muted mt-1">تفضل بزيارة صفحات الأنشطة التجارية والعيادات وشارك تجربتك!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reviews
                  .filter((r) => r.userId === currentUser.id)
                  .map((review) => (
                    <div
                      key={review.id}
                      className="p-5 border border-border/45 bg-muted/10 rounded-2xl hover:border-primary/30 transition-all duration-300 relative group"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                        <div>
                          <h3 className="font-bold text-text-primary text-base">{review.entityName}</h3>
                          <div className="flex items-center gap-1.5 mt-1">
                            <div className="flex items-center text-secondary">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < review.rating ? "fill-secondary text-secondary" : "text-border"
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-xs text-text-muted font-numbers font-medium mr-2">
                              {review.visitDate ? `تاريخ الزيارة: ${review.visitDate}` : review.timestamp}
                            </span>
                          </div>
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:bg-destructive/10 rounded-xl shrink-0 gap-1.5"
                          onClick={() => {
                            if (confirm("هل أنت متأكد من حذف هذا التقييم؟")) {
                              deleteReview(review.id);
                              toast.success("تم حذف التقييم بنجاح");
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                          حذف التقييم
                        </Button>
                      </div>

                      <p className="text-sm text-text-secondary leading-relaxed bg-background/25 p-3.5 rounded-xl border border-border/10">
                        {review.comment}
                      </p>

                      {review.images && review.images.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {review.images.map((img: string, idx: number) => (
                            <img
                              key={idx}
                              src={img}
                              alt="مرفق التقييم"
                              className="h-14 w-14 object-cover rounded-xl border border-border/30"
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
