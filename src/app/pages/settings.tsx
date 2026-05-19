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
  Trash2
} from "lucide-react";
import { toast } from "sonner";

export function SettingsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");
  const [isSaving, setIsSaving] = useState(false);

  // Profile settings
  const [name, setName] = useState("محمد الأحمد");
  const [username, setUsername] = useState("mohammad_ahmed");
  const [email, setEmail] = useState("mohammad@example.com");
  const [bio, setBio] = useState("مطور برمجيات مهتم بالتقنية والتعليم");
  const [location, setLocation] = useState("الرياض، السعودية");
  const [occupation, setOccupation] = useState("مهندس برمجيات");
  const [website, setWebsite] = useState("");

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
    if (confirm("هل أنت متأكد من حذف حسابك؟ لا يمكن التراجع عن هذا الإجراء.")) {
      toast.error("تم حذف الحساب");
      setTimeout(() => navigate("/"), 2000);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">الإعدادات</h1>
        <p className="text-sm text-muted-foreground">إدارة حسابك وتفضيلاتك</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full justify-start bg-card border border-border mb-6 overflow-x-auto">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            الملف الشخصي
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            الإشعارات
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            الخصوصية
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            المظهر
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            الأمان
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">المعلومات الشخصية</h2>

            {/* Avatar */}
            <div className="flex items-center gap-4 mb-6">
              <Avatar className="h-20 w-20">
                <AvatarImage src="" />
                <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-primary to-secondary text-white">
                  {name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-2">
                <Button variant="outline" size="sm" className="rounded-lg">
                  <Upload className="h-4 w-4 ml-2" />
                  تحميل صورة
                </Button>
                <Button variant="ghost" size="sm" className="rounded-lg text-destructive">
                  <Trash2 className="h-4 w-4 ml-2" />
                  حذف
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">الاسم الكامل</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">اسم المستخدم</Label>
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <div className="relative">
                  <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="rounded-xl pr-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">السيرة الذاتية</Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  className="rounded-xl resize-none"
                  maxLength={160}
                />
                <p className="text-xs text-muted-foreground text-left">
                  {bio.length}/160 حرف
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">الموقع</Label>
                  <div className="relative">
                    <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="location"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="rounded-xl pr-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="occupation">المهنة</Label>
                  <div className="relative">
                    <Briefcase className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="occupation"
                      value={occupation}
                      onChange={(e) => setOccupation(e.target.value)}
                      className="rounded-xl pr-10"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">الموقع الإلكتروني</Label>
                <div className="relative">
                  <Globe className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="website"
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://"
                    className="rounded-xl pr-10"
                  />
                </div>
              </div>
            </div>

            <Button
              className="mt-6 rounded-xl"
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
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">تفضيلات الإشعارات</h2>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>إشعارات البريد الإلكتروني</Label>
                  <p className="text-sm text-muted-foreground">
                    استلام إشعارات عبر البريد الإلكتروني
                  </p>
                </div>
                <Switch
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="font-medium text-sm">إشعارات النشاط</h3>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>إجابات جديدة</Label>
                    <p className="text-sm text-muted-foreground">
                      عند إجابة أحدهم على سؤالك
                    </p>
                  </div>
                  <Switch
                    checked={newAnswers}
                    onCheckedChange={setNewAnswers}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>تعليقات جديدة</Label>
                    <p className="text-sm text-muted-foreground">
                      عند التعليق على منشوراتك
                    </p>
                  </div>
                  <Switch
                    checked={newComments}
                    onCheckedChange={setNewComments}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>الإشارات</Label>
                    <p className="text-sm text-muted-foreground">
                      عند ذكر اسمك في منشور
                    </p>
                  </div>
                  <Switch
                    checked={mentions}
                    onCheckedChange={setMentions}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="font-medium text-sm">النشرات الإخبارية</h3>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>ملخص أسبوعي</Label>
                    <p className="text-sm text-muted-foreground">
                      ملخص لأهم الأسئلة والإجابات
                    </p>
                  </div>
                  <Switch
                    checked={weeklyDigest}
                    onCheckedChange={setWeeklyDigest}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>رسائل تسويقية</Label>
                    <p className="text-sm text-muted-foreground">
                      أخبار وعروض Khapeer
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
              className="mt-6 rounded-xl"
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
          </Card>
        </TabsContent>

        {/* Privacy Tab */}
        <TabsContent value="privacy" className="space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">إعدادات الخصوصية</h2>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label>ظهور الملف الشخصي</Label>
                <Select value={profileVisibility} onValueChange={setProfileVisibility}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">عام - يمكن للجميع رؤيته</SelectItem>
                    <SelectItem value="members">الأعضاء فقط</SelectItem>
                    <SelectItem value="private">خاص - أنت فقط</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>إظهار البريد الإلكتروني</Label>
                  <p className="text-sm text-muted-foreground">
                    السماح للآخرين برؤية بريدك
                  </p>
                </div>
                <Switch
                  checked={showEmail}
                  onCheckedChange={setShowEmail}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>إظهار الموقع</Label>
                  <p className="text-sm text-muted-foreground">
                    عرض موقعك في ملفك الشخصي
                  </p>
                </div>
                <Switch
                  checked={showLocation}
                  onCheckedChange={setShowLocation}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>السماح بالرسائل</Label>
                  <p className="text-sm text-muted-foreground">
                    استقبال رسائل من المستخدمين
                  </p>
                </div>
                <Switch
                  checked={allowMessages}
                  onCheckedChange={setAllowMessages}
                />
              </div>
            </div>

            <Button
              className="mt-6 rounded-xl"
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
          </Card>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance" className="space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">المظهر والعرض</h2>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label>المظهر</Label>
                <Select value={theme} onValueChange={setTheme}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">فاتح</SelectItem>
                    <SelectItem value="dark">داكن</SelectItem>
                    <SelectItem value="system">تلقائي (حسب النظام)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  اختر المظهر المفضل للتطبيق
                </p>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>اللغة</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ar">العربية</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              className="mt-6 rounded-xl"
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
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">الأمان</h2>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>كلمة المرور الحالية</Label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label>كلمة المرور الجديدة</Label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label>تأكيد كلمة المرور</Label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  className="rounded-xl"
                />
              </div>

              <Button variant="outline" className="rounded-xl">
                تغيير كلمة المرور
              </Button>
            </div>
          </Card>

          <Card className="p-6 border-destructive/50">
            <div className="flex items-start gap-3 mb-4">
              <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
              <div>
                <h2 className="text-lg font-semibold text-destructive mb-1">منطقة الخطر</h2>
                <p className="text-sm text-muted-foreground">
                  حذف حسابك بشكل نهائي. لا يمكن التراجع عن هذا الإجراء.
                </p>
              </div>
            </div>

            <Button
              variant="destructive"
              className="rounded-xl"
              onClick={handleDeleteAccount}
            >
              <Trash2 className="h-4 w-4 ml-2" />
              حذف الحساب
            </Button>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
