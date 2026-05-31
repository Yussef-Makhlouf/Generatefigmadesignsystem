import { useState, useEffect } from "react";
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
  MessageSquare,
  Compass,
  Camera,
  Loader2,
  FileText
} from "lucide-react";
import { toast } from "sonner";
import { useAppState } from "../context/AppStateContext";
import { signOut, getUserSettings, saveUserSettings, getDefaultSettings, uploadAvatar, uploadCoverImage, uploadLicenseDocument } from "../../lib/services";
import { supabase } from "../../lib/supabase";
import type { UserSettings } from "../../lib/services/settings.service";

export function SettingsPage() {
  const navigate = useNavigate();
  const { currentUser, updateProfile, reviews, deleteReview } = useAppState();
  const [activeTab, setActiveTab] = useState("profile");
  const [isSaving, setIsSaving] = useState(false);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [showDevMode, setShowDevMode] = useState(false);
  const [clickCount, setClickCount] = useState(0);

  // Check URL params for dev=true on load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("dev") === "true") {
      setShowDevMode(true);
    }
  }, []);

  const handleHeaderClick = () => {
    setClickCount(prev => {
      const next = prev + 1;
      if (next === 5) {
        setShowDevMode(true);
        toast.success("🔓 تم تفعيل وضع المطور السري بنجاح!", { position: "bottom-center" });
        return 0;
      } else if (next > 1) {
        toast.info(`انقر ${5 - next} متبقية لتفعيل وضع المطور`, { position: "bottom-center", duration: 1000 });
      }
      return next;
    });
  };

  const [settings, setSettings] = useState<UserSettings>(() => getDefaultSettings());

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("تم تسجيل الخروج بنجاح. رافقتك السلامة!", {
        position: "bottom-center",
        duration: 3000,
      });
      navigate("/");
    } catch (error) {
      console.error(error);
      toast.error("فشل تسجيل الخروج. يرجى المحاولة مرة أخرى.", {
        position: "bottom-center",
      });
    }
  };

  // Profile settings
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [occupation, setOccupation] = useState("");
  const [website, setWebsite] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [licenseDocumentUrl, setLicenseDocumentUrl] = useState("");

  // Upload/Detection states
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isUploadingDocument, setIsUploadingDocument] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  // Synchronize state when currentUser resolves
  useEffect(() => {
    if (!currentUser || currentUser.username === "guest" || currentUser.id === "1") return;

    setName(currentUser.name || "");
    setUsername(currentUser.username || "");
    setEmail(currentUser.email || "");
    setBio(currentUser.bio || "");
    setLocation(currentUser.location || "");

    const userSettings = currentUser.settings || {};
    setOccupation(userSettings.occupation || "");
    setWebsite(userSettings.website || "");
    setCoverUrl(userSettings.cover_url || "");
    setLicenseDocumentUrl(userSettings.license_document_url || "");

    // Business/Professional settings
    setBusinessCategory(currentUser.businessCategory || "");
    setBusinessLicense(currentUser.businessLicense || "");
    setBusinessAddress(currentUser.businessAddress || "");
    setOperatingHours(currentUser.operatingHours || "");

    // Privacy settings
    if (userSettings.privacy) {
      setProfileVisibility(userSettings.privacy.profileVisibility || "public");
      setShowEmail(userSettings.privacy.showEmail || false);
      setShowLocation(userSettings.privacy.showLocation || true);
      setAllowMessages(userSettings.privacy.allowMessages || true);
    }

    // Appearance settings
    if (userSettings.appearance) {
      setTheme(userSettings.appearance.theme || "system");
      setLanguage(userSettings.appearance.language || "ar");
    }

    // Notification settings
    if (userSettings.notifications) {
      setEmailNotifications(userSettings.notifications.email !== false);
      setNewAnswers(userSettings.notifications.newAnswers !== false);
      setNewComments(userSettings.notifications.newComments !== false);
      setMentions(userSettings.notifications.mentions !== false);
      setWeeklyDigest(!!userSettings.notifications.weeklyDigest);
      setMarketingEmails(!!userSettings.notifications.marketingEmails);
    }

    setSettingsLoaded(true);
  }, [currentUser]);

  // Real-time GPS reverse geocoder
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      toast.error("متصفحك لا يدعم تحديد الموقع الجغرافي تلقائياً.");
      return;
    }

    setIsDetectingLocation(true);
    toast.info("جاري تحديد موقعك الجغرافي...");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=ar`
          );
          if (response.ok) {
            const data = await response.json();
            const displayName = data.display_name;
            const address = data.address || {};
            const city = address.city || address.town || address.village || address.suburb || address.state || "";
            const country = address.country || "";
            const formatted = city && country ? `${city}، ${country}` : displayName;
            setLocation(formatted);
            toast.success("تم تحديد موقعك بنجاح!");
          } else {
            setLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
            toast.success("تم تحديد الإحداثيات بنجاح!");
          }
        } catch (error) {
          console.error(error);
          setLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
          toast.success("تم تحديد الإحداثيات بنجاح!");
        } finally {
          setIsDetectingLocation(false);
        }
      },
      (error) => {
        console.error(error);
        toast.error("فشل تحديد الموقع. يرجى تفعيل إذن الوصول للموقع الجغرافي في المتصفح.");
        setIsDetectingLocation(false);
      }
    );
  };

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      toast.error("حجم الصورة الشخصية كبير جداً. يجب أن يكون أقل من 3 ميجابايت.");
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const url = await uploadAvatar(currentUser.id, file);
      if (url) {
        await updateProfile(
          name || currentUser.name,
          username || currentUser.username,
          bio || currentUser.bio,
          location || currentUser.location,
          url,
          occupation,
          website,
          coverUrl,
          {
            businessCategory,
            businessLicense,
            businessAddress,
            operatingHours,
          }
        );
        toast.success("تم رفع وتحديث الصورة الشخصية بنجاح!");
      } else {
        toast.error("فشل رفع الصورة الشخصية.");
      }
    } catch (err) {
      console.error(err);
      toast.error("حدث خطأ أثناء رفع الصورة الشخصية.");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleCoverFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("حجم صورة الغلاف كبير جداً. يجب أن يكون أقل من 5 ميجابايت.");
      return;
    }

    setIsUploadingCover(true);
    try {
      const url = await uploadCoverImage(currentUser.id, file);
      if (url) {
        setCoverUrl(url);
        await updateProfile(
          name || currentUser.name,
          username || currentUser.username,
          bio || currentUser.bio,
          location || currentUser.location,
          currentUser.avatar || "",
          occupation,
          website,
          url,
          {
            businessCategory,
            businessLicense,
            businessAddress,
            operatingHours,
          }
        );
        toast.success("تم رفع وتحديث صورة الغلاف بنجاح!");
      } else {
        toast.error("فشل رفع صورة الغلاف.");
      }
    } catch (err) {
      console.error(err);
      toast.error("حدث خطأ أثناء رفع صورة الغلاف.");
    } finally {
      setIsUploadingCover(false);
    }
  };

  const handleLicenseFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("حجم الملف كبير جداً. يجب أن يكون أقل من 5 ميجابايت.");
      return;
    }

    setIsUploadingDocument(true);
    try {
      const url = await uploadLicenseDocument(currentUser.id, file);
      if (url) {
        setLicenseDocumentUrl(url);
        toast.success("تم رفع مستند الترخيص بنجاح! سيتم حفظه عند الضغط على حفظ التغييرات.");
      } else {
        toast.error("فشل رفع المستند.");
      }
    } catch (err) {
      console.error(err);
      toast.error("حدث خطأ أثناء رفع المستند.");
    } finally {
      setIsUploadingDocument(false);
    }
  };

  // Business/Professional settings
  const [businessCategory, setBusinessCategory] = useState("");
  const [businessLicense, setBusinessLicense] = useState("");
  const [businessAddress, setBusinessAddress] = useState("");
  const [operatingHours, setOperatingHours] = useState("");

  // Privacy settings
  const [profileVisibility, setProfileVisibility] = useState<"public" | "members" | "private">("public");
  const [showEmail, setShowEmail] = useState<boolean>(false);
  const [showLocation, setShowLocation] = useState<boolean>(true);
  const [allowMessages, setAllowMessages] = useState<boolean>(true);

  // Appearance settings
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system");
  const [language, setLanguage] = useState<"ar" | "en">("ar");

  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState<boolean>(true);
  const [newAnswers, setNewAnswers] = useState<boolean>(true);
  const [newComments, setNewComments] = useState<boolean>(true);
  const [mentions, setMentions] = useState<boolean>(true);
  const [weeklyDigest, setWeeklyDigest] = useState<boolean>(false);
  const [marketingEmails, setMarketingEmails] = useState<boolean>(false);

  const handleSaveNotifications = async () => {
    if (!currentUser?.id) return;
    setIsSaving(true);
    try {
      await saveUserSettings(currentUser.id, {
        notifications: {
          email: emailNotifications,
          newAnswers,
          newComments,
          mentions,
          weeklyDigest,
          marketingEmails,
        },
      });
      toast.success("تم تحديث إعدادات الإشعارات");
    } catch {
      toast.error("فشل حفظ الإعدادات");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSavePrivacy = async () => {
    if (!currentUser?.id) return;
    setIsSaving(true);
    try {
      await saveUserSettings(currentUser.id, {
        privacy: {
          profileVisibility: profileVisibility as "public" | "members" | "private",
          showEmail,
          showLocation,
          allowMessages,
        },
      });
      toast.success("تم تحديث إعدادات الخصوصية");
    } catch {
      toast.error("فشل حفظ الإعدادات");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAppearance = async () => {
    if (!currentUser?.id) return;
    setIsSaving(true);
    try {
      await saveUserSettings(currentUser.id, {
        appearance: {
          theme: theme as "light" | "dark" | "system",
          language: language as "ar" | "en",
        },
      });
      toast.success("تم تحديث إعدادات المظهر");
    } catch {
      toast.error("فشل حفظ الإعدادات");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!currentUser?.id) return;
    setIsSaving(true);
    try {
      // Check if email changed
      if (email !== currentUser.email) {
        const { error } = await supabase.auth.updateUser({ email });
        if (error) {
          toast.error("فشل تحديث البريد الإلكتروني: " + error.message);
        } else {
          toast.info("تم إرسال رابط تأكيد إلى البريد الإلكتروني الجديد.");
        }
      }

      await updateProfile(
        name,
        username,
        bio,
        location,
        currentUser.avatar || "",
        occupation,
        website,
        coverUrl,
        {
          businessCategory,
          businessLicense,
          businessAddress,
          operatingHours,
          licenseDocumentUrl,
        }
      );
      toast.success("تم حفظ التغييرات بنجاح");
    } catch (error) {
      console.error(error);
      toast.error("فشل حفظ التغييرات");
    } finally {
      setIsSaving(false);
    }
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
      <div className="mb-6 sm:mb-8 select-none">
        <h1 
          className="text-2xl sm:text-3xl font-extrabold tracking-tight text-primary mb-1.5 cursor-default active:scale-95 transition-transform"
          onClick={handleHeaderClick}
        >
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

            {/* Premium Avatar & Cover Editor Preview */}
            <div className="relative mb-8 rounded-2xl border border-border/30 overflow-hidden bg-muted/10 group/banner">
              {/* Cover Banner Preview */}
              <div className="h-32 sm:h-40 relative bg-primary/10 border-b border-border/30 overflow-hidden flex items-center justify-center">
                {coverUrl ? (
                  <img src={coverUrl} alt="Cover Banner" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center p-4">
                    <Compass className="h-8 w-8 text-primary/40 mx-auto mb-1.5 animate-pulse" />
                    <span className="text-xs text-text-muted">لم يتم رفع صورة غلاف بعد</span>
                  </div>
                )}
                
                {/* Upload Banner Trigger */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/banner:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                  <label className="cursor-pointer bg-black/60 hover:bg-black/80 text-white rounded-xl px-4 py-2 text-xs font-semibold border border-white/20 transition-all duration-200 flex items-center gap-1.5 shadow-md">
                    <Upload className="h-3.5 w-3.5" />
                    <span>تغيير الغلاف</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleCoverFileChange}
                      disabled={isUploadingCover}
                    />
                  </label>
                  {coverUrl && (
                    <Button
                      variant="destructive"
                      size="sm"
                      className="rounded-xl h-8 text-[11px] font-bold"
                      onClick={async () => {
                        setCoverUrl("");
                        await updateProfile(
                          name || currentUser.name,
                          username || currentUser.username,
                          bio || currentUser.bio,
                          location || currentUser.location,
                          currentUser.avatar || "",
                          occupation,
                          website,
                          "",
                          {
                            businessCategory,
                            businessLicense,
                            businessAddress,
                            operatingHours,
                          }
                        );
                        toast.success("تم إزالة صورة الغلاف.");
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5 ml-1" />
                      إزالة
                    </Button>
                  )}
                </div>
                {isUploadingCover && (
                  <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                    <Loader2 className="h-5 w-5 text-primary animate-spin" />
                    <span className="text-xs text-text-primary mr-2 font-semibold animate-pulse">جاري رفع الغلاف...</span>
                  </div>
                )}
              </div>

              {/* Avatar Editor Overlay */}
              <div className="p-4 flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4 -mt-10 sm:-mt-14 relative z-10">
                <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 text-center sm:text-right">
                  <div className="relative group/avatar">
                    <Avatar className="h-20 w-20 sm:h-24 sm:w-24 border-4 border-card shadow-lg ring-1 ring-border/20">
                      <AvatarImage src={currentUser?.avatar || ""} />
                      <AvatarFallback className="text-2xl font-bold bg-primary text-white">
                        {name ? name.charAt(0) : "ي"}
                      </AvatarFallback>
                    </Avatar>
                    
                    {/* Hover camera upload overlay for avatar */}
                    <label className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center cursor-pointer opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-300 border border-white/10">
                      <Camera className="h-5 w-5 text-white" />
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarFileChange}
                        disabled={isUploadingAvatar}
                      />
                    </label>

                    {isUploadingAvatar && (
                      <div className="absolute inset-0 bg-background/80 rounded-full flex items-center justify-center">
                        <Loader2 className="h-4 w-4 text-primary animate-spin" />
                      </div>
                    )}
                  </div>
                  
                  <div className="pb-1">
                    <h3 className="text-base sm:text-lg font-bold text-text-primary">{name || "مستخدم"}</h3>
                    <p className="text-xs text-text-muted">@{username || "username"}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <label className="cursor-pointer bg-card hover:bg-muted text-text-primary border border-border/60 hover:border-primary/40 rounded-xl px-4 py-2 text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 shadow-sm">
                    <Camera className="h-3.5 w-3.5" />
                    <span>تغيير الصورة الشخصية</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarFileChange}
                      disabled={isUploadingAvatar}
                    />
                  </label>
                  {currentUser?.avatar && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="rounded-xl text-destructive hover:bg-destructive/5 text-xs font-semibold h-8"
                      onClick={async () => {
                        await updateProfile(
                          name || currentUser.name,
                          username || currentUser.username,
                          bio || currentUser.bio,
                          location || currentUser.location,
                          "",
                          occupation,
                          website,
                          coverUrl,
                          {
                            businessCategory,
                            businessLicense,
                            businessAddress,
                            operatingHours,
                          }
                        );
                        toast.success("تم إزالة الصورة الشخصية.");
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5 ml-1.5" />
                      إزالة
                    </Button>
                  )}
                </div>
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
                      className="rounded-xl pr-10 pl-10 border-border/60 bg-background/30 focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-300 input-glow"
                    />
                    <button
                      type="button"
                      onClick={handleDetectLocation}
                      disabled={isDetectingLocation}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-primary hover:text-primary-hover p-1 rounded-md hover:bg-primary/10 transition-colors disabled:opacity-50"
                      title="تحديد الموقع الجغرافي تلقائياً"
                    >
                      {isDetectingLocation ? (
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      ) : (
                        <Compass className="h-4 w-4" />
                      )}
                    </button>
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

                    {licenseDocumentUrl ? (
                      <div className="flex items-center justify-between p-4 rounded-xl border border-border/40 bg-background/30">
                        <div className="flex items-center gap-3">
                          {licenseDocumentUrl.match(/\.(jpeg|jpg|gif|png)$/i) || !licenseDocumentUrl.endsWith(".pdf") ? (
                            <img src={licenseDocumentUrl} alt="License Document" className="h-16 w-16 object-cover rounded-lg border border-border/25" />
                          ) : (
                            <div className="h-16 w-16 bg-primary/10 border border-primary/20 text-primary flex items-center justify-center rounded-lg">
                              <FileText className="h-8 w-8" />
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-semibold text-text-primary">مستند الترخيص المرفق</p>
                            <a 
                              href={licenseDocumentUrl} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="text-xs text-primary hover:underline flex items-center gap-1 mt-1 font-numbers"
                            >
                              <Eye className="h-3 w-3" />
                              <span>عرض المستند</span>
                            </a>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:bg-destructive/5 rounded-xl h-9"
                          onClick={() => setLicenseDocumentUrl("")}
                        >
                          <Trash2 className="h-4 w-4 ml-1" />
                          <span>إزالة</span>
                        </Button>
                      </div>
                    ) : (
                      <label className="border-2 border-dashed border-border/60 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-primary/50 transition-all duration-300 bg-background/20 relative">
                        {isUploadingDocument ? (
                          <div className="flex flex-col items-center justify-center">
                            <Loader2 className="h-8 w-8 text-primary animate-spin mb-2" />
                            <span className="text-sm font-semibold text-text-primary">جاري رفع المستند...</span>
                          </div>
                        ) : (
                          <>
                            <Upload className="h-8 w-8 text-text-muted mb-2 animate-pulse" />
                            <span className="text-sm font-semibold text-text-primary mb-1">اضغط لتحميل مستند الترخيص، أو اسحب الملف هنا</span>
                            <span className="text-xs text-text-muted">الحد الأقصى للملف: 5 ميجابايت (PDF, PNG, JPG)</span>
                          </>
                        )}
                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          onChange={handleLicenseFileChange}
                          disabled={isUploadingDocument}
                        />
                      </label>
                    )}
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
                <Select value={profileVisibility} onValueChange={(v) => setProfileVisibility(v as "public" | "members" | "private")}>
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
                <Select value={theme} onValueChange={(v) => setTheme(v as "light" | "dark" | "system")}>
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
                <Select value={language} onValueChange={(v) => setLanguage(v as "ar" | "en")}>
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
              onClick={handleSaveAppearance}
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

          {/* Sign Out Card */}
          <div className="premium-glass-card p-6 border border-border/45 rounded-2xl mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                <Lock className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-text-primary mb-1">تسجيل الخروج الآمن</h2>
                <p className="text-xs text-text-secondary leading-relaxed font-sans">
                  إنهاء جلستك الحالية على هذا الجهاز بشكل آمن. يمكنك تسجيل الدخول مجدداً في أي وقت.
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              className="rounded-xl border-border hover:bg-muted font-bold text-xs sm:text-sm px-4 h-10 transition-all duration-200 text-foreground shrink-0"
              onClick={handleSignOut}
            >
              تسجيل الخروج
            </Button>
          </div>

          {/* Secret Developer Section */}
          {showDevMode && (
            <div className="premium-glass-card p-6 border border-primary/30 bg-primary/[0.02] rounded-2xl shadow-lg relative overflow-hidden mb-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-xl pointer-events-none" />
              <div className="flex items-start gap-4 mb-5">
                <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                  <Shield className="h-5 w-5 animate-pulse" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-primary mb-1">لوحة الإشراف والتطوير السرية</h2>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    هذا القسم سري ولا يظهر إلا للمطورين. يمكنك ترقية حسابك إلى مسؤول لتجربة واجهات وميزات المشرفين، أو إلغاء الترقية للعودة لحساب عادي واختبار نظام السرية.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                {currentUser?.accountType === "admin" ? (
                  <Button
                    variant="destructive"
                    className="rounded-xl font-bold text-xs"
                    disabled={isSaving}
                    onClick={async () => {
                      setIsSaving(true);
                      try {
                        const { updateUserAccountType } = await import("../../lib/services");
                        const success = await updateUserAccountType(currentUser.id, "individual");
                        if (success) {
                          toast.success("تم إلغاء ترقية حسابك إلى مستخدم عادي. ستختفي لوحة التحكم والروابط تماماً.", { position: "bottom-center" });
                          // Refresh page after a short delay
                          setTimeout(() => window.location.reload(), 1500);
                        } else {
                          toast.error("فشل إلغاء ترقية الحساب.");
                        }
                      } catch (err) {
                        console.error(err);
                        toast.error("حدث خطأ غير متوقع.");
                      } finally {
                        setIsSaving(false);
                      }
                    }}
                  >
                    إلغاء الترقية (العودة لعضو مستقل)
                  </Button>
                ) : (
                  <Button
                    className="rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-xs shadow-md shadow-primary/20"
                    disabled={isSaving}
                    onClick={async () => {
                      setIsSaving(true);
                      try {
                        const { updateUserAccountType } = await import("../../lib/services");
                        const success = await updateUserAccountType(currentUser.id, "admin");
                        if (success) {
                          toast.success("تهانينا! تم ترقيتك إلى مسؤول (أدمن). ستظهر لك روابط لوحة التحكم فوراً.", { position: "bottom-center" });
                          setTimeout(() => window.location.reload(), 1500);
                        } else {
                          toast.error("فشل ترقية الحساب.");
                        }
                      } catch (err) {
                        console.error(err);
                        toast.error("حدث خطأ غير متوقع.");
                      } finally {
                        setIsSaving(false);
                      }
                    }}
                  >
                    ترقية حسابي فوراً إلى مسؤول (Admin)
                  </Button>
                )}
              </div>
            </div>
          )}

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
