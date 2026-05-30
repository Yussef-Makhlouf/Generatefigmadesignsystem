import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";
import { Dialog, DialogContent } from "../components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Badge } from "../components/ui/badge";
import {
  Eye,
  EyeOff,
  CheckCircle2,
  Sparkles,
  X,
  PartyPopper,
  Rocket,
  ChevronLeft,
  ChevronRight,
  User as UserIcon,
  Building2,
  Utensils,
  Stethoscope,
  Compass,
  Star
} from "lucide-react";
import { useAppState } from "../context/AppStateContext";
import { toast } from "sonner";
import { motion } from "motion/react";
import { AccountType } from "../data/mock-data";
import { signUp, updateProfile } from "../../lib/services";

const availableInterests = [
  "برمجة", "تقنية", "تصميم", "أعمال", "تعليم",
  "صحة", "علوم", "رياضيات", "فنون", "أمن معلومات",
  "ذكاء اصطناعي", "تسويق", "مطاعم", "أطباء", "سياحة", "سينما"
];

const perks = [
  "اسأل خبراء معتمدين في شتى المجالات والأنشطة",
  "شارك مراجعاتك الصادقة واكسب شارات مرموقة",
  "تابع المواضيع والخدمات التي تهمك بمدينتك",
  "احصل على إجابات موثوقة من مجتمعك المحلي",
];

export function RegisterPage() {
  const navigate = useNavigate();
  
  // Registration steps state: 1 = Selector, 2 = Form inputs, 3 = City/Interests onboarding
  const [step, setStep] = useState(1);
  const [accountType, setAccountType] = useState<AccountType>("individual");
  
  // Standard fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  // Custom business/medical fields
  const [businessCategory, setBusinessCategory] = useState("");
  const [businessLicense, setBusinessLicense] = useState("");
  const [businessAddress, setBusinessAddress] = useState("");
  const [operatingHours, setOperatingHours] = useState("");
  
  // Onboarding fields (step 3)
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [city, setCity] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleNextStep = () => {
    if (step === 1) {
      setStep(2);
    }
  };

  const handleBackStep = () => {
    if (step === 2) {
      setStep(1);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowOnboarding(true);
  };

  const handleOnboardingComplete = async () => {
    setIsLoading(true);
    try {
      const username = email ? email.split("@")[0] : "user_" + Math.random().toString(36).substring(2, 6);
      
      // 1. Sign up the user via Supabase Auth
      const { user, error } = await signUp(email.toLowerCase().trim(), password, username, name, accountType);

      if (error) {
        let friendlyError = error;
        if (error.includes("User already registered") || error.includes("user already exists")) {
          friendlyError = "هذا البريد الإلكتروني مسجل بالفعل. يرجى تسجيل الدخول بدلاً من ذلك.";
        } else if (error.includes("Password should be")) {
          friendlyError = "كلمة المرور ضعيفة جداً. يجب أن تتكون من ٦ أحرف على الأقل.";
        }
        
        toast.error(`فشل إنشاء الحساب: ${friendlyError}`, {
          position: "bottom-center",
          duration: 3500,
        });
        setIsLoading(false);
        return;
      }

      if (!user) {
        toast.error("فشل إنشاء الحساب. يرجى المحاولة مرة أخرى.", {
          position: "bottom-center",
        });
        setIsLoading(false);
        return;
      }

      // 2. Map city key to display location
      const cityMap: Record<string, string> = {
        riyadh: "الرياض، السعودية",
        jeddah: "جدة، السعودية",
        dammam: "الدمام، السعودية",
        mecca: "مكة المكرمة، السعودية",
        medina: "المدينة المنورة، السعودية",
        cairo: "القاهرة، مصر",
        dubai: "دبي، الإمارات",
        other: "مدينة أخرى",
      };
      const userLocation = cityMap[city] || "الرياض، السعودية";

      // 3. Build bio
      const bioText = accountType !== "individual" 
        ? `${name} - ${businessCategory || "خدمات معتمدة"} في ${userLocation}`
        : interests.length > 0 ? `مهتم بـ ${interests.join("، ")}` : "عضو جديد في مجتمع خبير الفكري";

      // 4. Build profile updates mapping to DB columns
      const profileUpdates: any = {
        bio: bioText,
        location: userLocation,
        settings: { interests: interests }
      };

      if (accountType !== "individual") {
        profileUpdates.business_category = businessCategory || "عام";
        profileUpdates.business_license = businessLicense;
        profileUpdates.business_address = businessAddress;
        profileUpdates.operating_hours = operatingHours || "٩ ص - ٩ م";
        profileUpdates.reputation = 300; // Premium start for business
      } else {
        profileUpdates.reputation = 150; // Welcome reputation points for individual
      }

      // Update user profile table
      await updateProfile(user.id, profileUpdates);

      setShowOnboarding(false);
      toast.success(`أهلاً بك في خبير، تم تفعيل حسابك بنجاح كـ ${
        accountType === "restaurant" ? "مطعم/مقهى" :
        accountType === "clinic" ? "مركز طبي" :
        accountType === "doctor" ? "طبيب معتمد" :
        accountType === "activity" ? "وجهة ترفيهية" :
        accountType === "business" ? "جهة تجارية" : "عضو مستقل"
      }!`, {
        position: "bottom-center",
        duration: 4000,
      });
      navigate("/");
    } catch (err: any) {
      console.error(err);
      toast.error("حدث خطأ غير متوقع أثناء تفعيل الحساب والبيانات الشخصية.", {
        position: "bottom-center",
        duration: 4000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleInterest = (interest: string) => {
    if (interests.includes(interest)) {
      setInterests(interests.filter((i) => i !== interest));
    } else if (interests.length < 5) {
      setInterests([...interests, interest]);
    }
  };

  const passwordStrength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3;
  const strengthLabel = ["", "ضعيفة", "متوسطة", "قوية"][passwordStrength];
  const strengthColor = ["", "bg-red-500", "bg-yellow-500", "bg-green-500"][passwordStrength];

  // Types definitions helper for step 1 UI cards rendering
  const accountTypesList = [
    {
      type: "individual" as AccountType,
      title: "مستكشف / خبير مستقل",
      desc: "طرح أسئلة، المساهمة بالخبرات الطبية والتقنية، كتابة مراجعات الأماكن والخدمات.",
      icon: UserIcon,
      color: "border-primary"
    },
    {
      type: "restaurant" as AccountType,
      title: "مطعم أو مقهى",
      desc: "توثيق صفحة المطعم، عرض أوقات العمل، الرد على استفسارات الزوار وجمع التقييمات.",
      icon: Utensils,
      color: "border-secondary"
    },
    {
      type: "doctor" as AccountType,
      title: "طبيب ممارس",
      desc: "تقديم الاستشارات الطبية الحرة الموثوقة بشارة تحقق طبية رسمية معتمدة.",
      icon: Stethoscope,
      color: "border-emerald-500"
    },
    {
      type: "clinic" as AccountType,
      title: "مركز طبي / عيادة",
      desc: "إدارة الحضور الرقمي للمجمع الطبي، استقبال تقييمات المرضى، واستعراض التخصصات.",
      icon: Building2,
      color: "border-teal-500"
    },
    {
      type: "activity" as AccountType,
      title: "نشاط ترفيهي أو وجهة",
      desc: "للمتاحف، مدن الترفيه، الفنادق، والأنشطة السياحية لربطها بالزوار المستكشفين.",
      icon: Compass,
      color: "border-amber-500"
    },
    {
      type: "business" as AccountType,
      title: "شركة وعلامة تجارية",
      desc: "للخدمات والمكاتب الهندسية، المقاولات، وشركات التقنية لإبراز السمعة المهنية.",
      icon: Star,
      color: "border-sky-500"
    }
  ];

  return (
    <>
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-background">
        <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-primary/5 blur-3xl pointer-events-none animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-secondary/5 blur-3xl pointer-events-none" style={{ animationDelay: "2s" }} />
        <div className="absolute inset-0 arabic-geometric-mesh-fine opacity-25 pointer-events-none" />

        {/* Back button */}
        <Button
          variant="ghost"
          className="absolute top-6 right-6 text-foreground hover:bg-muted rounded-xl"
          onClick={() => navigate("/")}
        >
          <span>الرئيسية</span>
          <ChevronLeft className="h-4 w-4 mr-1.5 flip-rtl" />
        </Button>

        <div className="w-full max-w-5xl relative z-10 grid md:grid-cols-12 gap-8 items-center py-6">
          {/* Left side - Perks (desktop only) */}
          <div className="hidden md:flex md:col-span-4 flex-col justify-center gap-6 py-8 text-foreground">
            <div>
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary text-primary-foreground mb-4 shadow-md shadow-primary/10 animate-pulse-ring">
                <Sparkles className="h-8 w-8" />
              </div>
              <h1 className="text-3xl font-bold font-heading">
                منصة خبير
              </h1>
              <p className="text-muted-foreground text-sm mt-1">منظومة الأسئلة والتوجيه والتقييمات المحلية الراقية</p>
            </div>
            <div className="space-y-4">
              {perks.map((perk) => (
                <div key={perk} className="flex items-center gap-3">
                  <div className="p-1 rounded-full bg-secondary/10 border border-secondary/20">
                    <CheckCircle2 className="h-4 w-4 text-secondary flex-shrink-0" />
                  </div>
                  <span className="text-sm font-medium text-foreground/90">{perk}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Register Card */}
          <div className="md:col-span-8 w-full">
            <Card className="p-8 shadow-xl border border-border bg-card text-foreground rounded-2xl">
              {/* Mobile Logo */}
              <div className="md:hidden text-center mb-6">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary text-primary-foreground mb-3 shadow-md">
                  <Sparkles className="h-6 w-6" />
                </div>
                <h1 className="text-2xl font-bold font-heading">
                  خبير
                </h1>
              </div>

              {step === 1 ? (
                // STEP 1: Account Type Selection
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-xl font-bold font-heading">نوع الحساب والسمة المهنية</h2>
                    <p className="text-sm text-muted-foreground mt-0.5 font-medium">اختر فئة الحساب المناسبة لنشاطك للبدء بالتأسيس الصحيح للعمل والـ Logic</p>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    {accountTypesList.map((item) => {
                      const Icon = item.icon;
                      const isSelected = accountType === item.type;
                      return (
                        <div
                          key={item.type}
                          onClick={() => setAccountType(item.type)}
                          className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 flex flex-col justify-between h-40 select-none ${
                            isSelected
                              ? `bg-primary/5 ${item.color} shadow-sm`
                              : "border-border bg-muted/30 hover:border-muted-foreground/30 hover:bg-muted/50"
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div className={`p-2 rounded-lg ${isSelected ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}>
                              <Icon className="h-5 w-5" />
                            </div>
                            {isSelected && (
                              <Badge className="bg-primary text-white rounded-full h-5 w-5 p-0 flex items-center justify-center">✓</Badge>
                            )}
                          </div>
                          <div>
                            <h3 className="font-bold text-sm text-foreground">{item.title}</h3>
                            <p className="text-xs text-muted-foreground line-clamp-2 mt-1 font-medium">{item.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <Button
                    onClick={handleNextStep}
                    className="w-full h-11 rounded-xl bg-primary text-white font-bold"
                  >
                    <span>المتابعة لملء البيانات</span>
                    <ChevronLeft className="h-4 w-4 mr-1.5 flip-rtl" />
                  </Button>
                </motion.div>
              ) : (
                // STEP 2: Registration Form
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-xl font-bold font-heading">بيانات التسجيل</h2>
                      <p className="text-sm text-muted-foreground mt-0.5 font-medium">أدخل البيانات المطلوبة لتوثيق ملفك</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleBackStep} className="h-9 rounded-lg">
                      <ChevronRight className="h-4 w-4 ml-1 flip-rtl" />
                      <span>تغيير نوع الحساب</span>
                    </Button>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="name" className="text-sm text-foreground/80 font-medium">
                          {accountType === "individual" ? "الاسم الكامل" :
                           accountType === "doctor" ? "اسم الطبيب ثلاثي" : "الاسم التجاري للمنشأة"}
                        </Label>
                        <Input
                          id="name"
                          type="text"
                          placeholder={accountType === "individual" ? "أحمد محمد" :
                                       accountType === "doctor" ? "د. فهد العتيبي" : "مطعم ريف الشام"}
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="h-11 rounded-xl"
                          required
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="email" className="text-sm text-foreground/80 font-medium">البريد الإلكتروني</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="name@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="h-11 rounded-xl"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="password" className="text-sm text-foreground/80 font-medium">كلمة المرور</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="h-11 rounded-xl pl-10"
                          required
                          minLength={8}
                        />
                        <button
                          type="button"
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {password.length > 0 && (
                        <div className="space-y-1 mt-1">
                          <div className="flex gap-1">
                            {[1, 2, 3].map((i) => (
                              <div
                                key={i}
                                className={`h-1 flex-1 rounded-full transition-all ${i <= passwordStrength ? strengthColor : "bg-muted"}`}
                              />
                            ))}
                          </div>
                          <p className="text-xs text-muted-foreground font-medium">
                            قوة كلمة المرور: <span className={passwordStrength === 3 ? "text-green-500" : passwordStrength === 2 ? "text-yellow-500" : "text-red-500"}>{strengthLabel}</span>
                          </p>
                        </div>
                      )}
                    </div>

                    {/* DYNAMIC FIELDS FOR BUSINESS/DOCTORS/CLINICS */}
                    {accountType !== "individual" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="p-4 rounded-xl border border-dashed border-primary/30 bg-primary/5 space-y-4"
                      >
                        <h3 className="text-sm font-bold text-primary flex items-center gap-1.5">
                          <Sparkles className="h-4 w-4" />
                          <span>تطلب التحقق من الحساب المهني</span>
                        </h3>

                        <div className="grid sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <Label className="text-xs text-foreground/80 font-medium">
                              {accountType === "doctor" || accountType === "clinic" ? "التخصص / مجال الممارسة" : "تصنيف النشاط التجاري"}
                            </Label>
                            <Select value={businessCategory} onValueChange={setBusinessCategory} required>
                              <SelectTrigger className="bg-background h-11 rounded-xl">
                                <SelectValue placeholder="اختر التصنيف الرئيسي" />
                              </SelectTrigger>
                              <SelectContent>
                                {accountType === "restaurant" && (
                                  <>
                                    <SelectItem value="مأكولات شرقية">مأكولات شرقية ومشويات</SelectItem>
                                    <SelectItem value="مأكولات إيطالية">مأكولات إيطالية وبيتزا</SelectItem>
                                    <SelectItem value="مقهى وحلويات">مقهى ومحمصة حلويات</SelectItem>
                                    <SelectItem value="وجبات سريعة">وجبات سريعة وعصرية</SelectItem>
                                  </>
                                )}
                                {(accountType === "clinic" || accountType === "doctor") && (
                                  <>
                                    <SelectItem value="طب الأسنان">طب وتجميل الأسنان</SelectItem>
                                    <SelectItem value="طب الأطفال">طب الأطفال وحديثي الولادة</SelectItem>
                                    <SelectItem value="الجلدية والتجميل">الجلدية والتجميل والليزر</SelectItem>
                                    <SelectItem value="الطب العام الباطني">الطب العام والأمراض الباطنية</SelectItem>
                                  </>
                                )}
                                {accountType === "activity" && (
                                  <>
                                    <SelectItem value="ترفيه عائلي">ترفيه أطفال وعائلي</SelectItem>
                                    <SelectItem value="أماكن سياحية">معالم سياحية ومتاحف</SelectItem>
                                    <SelectItem value="أنشطة رياضية">مراكز رياضية وملاعب</SelectItem>
                                    <SelectItem value="سينما ومسارح">دور عرض سينما ومسارح</SelectItem>
                                  </>
                                )}
                                {accountType === "business" && (
                                  <>
                                    <SelectItem value="استشارات وتقنية">خدمات تقنية واستشارات</SelectItem>
                                    <SelectItem value="هندسة ومقاولات">مكاتب هندسة ومقاولات</SelectItem>
                                    <SelectItem value="تعليم وتدريب">مراكز تعليم وتدريب وتطوير</SelectItem>
                                  </>
                                )}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-1.5">
                            <Label htmlFor="businessLicense" className="text-xs text-foreground/80 font-medium">
                              {accountType === "doctor" || accountType === "clinic" ? "رقم ترخيص وزارة الصحة (MOH)" : "رقم السجل التجاري / الترخيص"}
                            </Label>
                            <Input
                              id="businessLicense"
                              type="text"
                              placeholder={accountType === "doctor" ? "M-994827" : "1010304050"}
                              value={businessLicense}
                              onChange={(e) => setBusinessLicense(e.target.value)}
                              className="h-11 rounded-xl bg-background"
                              required
                            />
                          </div>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <Label htmlFor="businessAddress" className="text-xs text-foreground/80 font-medium">العنوان الجغرافي بالتفصيل</Label>
                            <Input
                              id="businessAddress"
                              type="text"
                              placeholder="شارع التحلية، حي السليمانية"
                              value={businessAddress}
                              onChange={(e) => setBusinessAddress(e.target.value)}
                              className="h-11 rounded-xl bg-background"
                              required
                            />
                          </div>

                          <div className="space-y-1.5">
                            <Label htmlFor="operatingHours" className="text-xs text-foreground/80 font-medium">أوقات وساعات العمل</Label>
                            <Input
                              id="operatingHours"
                              type="text"
                              placeholder="٩:٠٠ ص - ١٠:٠٠ م"
                              value={operatingHours}
                              onChange={(e) => setOperatingHours(e.target.value)}
                              className="h-11 rounded-xl bg-background"
                              required
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}

                    <Button
                      type="submit"
                      className="w-full h-11 rounded-xl bg-primary text-white font-bold"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        "إنشاء الحساب وتفعيل العضوية"
                      )}
                    </Button>
                  </form>

                  <div className="text-center mt-6">
                    <p className="text-sm text-muted-foreground font-medium">
                      لديك حساب بالفعل؟{" "}
                      <Link to="/auth/login" className="text-secondary font-semibold hover:underline">
                        سجل دخولك
                      </Link>
                    </p>
                  </div>
                </motion.div>
              )}
            </Card>
          </div>
        </div>
      </div>

      {/* Onboarding Modal (Step 3) */}
      <Dialog open={showOnboarding} onOpenChange={setShowOnboarding}>
        <DialogContent className="sm:max-w-md border border-border bg-card text-foreground shadow-2xl rounded-2xl p-6">
          <div className="space-y-5 py-1">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary text-primary-foreground mb-3 shadow-lg animate-pulse-ring">
                <Sparkles className="h-8 w-8" />
              </div>
              <h2 className="text-xl font-bold flex items-center justify-center gap-2 font-heading">
                أهلاً بك في مجتمع خبير!
                <PartyPopper className="h-5 w-5 text-secondary animate-bounce-cta" />
              </h2>
              <p className="text-sm text-muted-foreground mt-1 font-medium">أكمل الخطوة الأخيرة لمطابقة اهتماماتك بمدينتك</p>
            </div>

            {/* Progress */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground font-medium font-numbers">
                <span>جاهزية الملف الشخصي</span>
                <span>{Math.round(((city ? 1 : 0) + interests.length / 3) / 2 * 100)}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-500 rounded-full"
                  style={{ width: `${Math.round(((city ? 1 : 0) + interests.length / 3) / 2 * 100)}%` }}
                />
              </div>
            </div>

            {/* City */}
            <div className="space-y-1.5">
              <Label className="text-foreground/80 text-xs font-semibold">مدينتك الحالية</Label>
              <Select value={city} onValueChange={setCity}>
                <SelectTrigger className="bg-background h-11 rounded-xl">
                  <SelectValue placeholder="اختر مدينتك" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="riyadh">الرياض</SelectItem>
                  <SelectItem value="jeddah">جدة</SelectItem>
                  <SelectItem value="dammam">الدمام</SelectItem>
                  <SelectItem value="mecca">مكة المكرمة</SelectItem>
                  <SelectItem value="medina">المدينة المنورة</SelectItem>
                  <SelectItem value="cairo">القاهرة</SelectItem>
                  <SelectItem value="dubai">دبي</SelectItem>
                  <SelectItem value="other">مدينة أخرى</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Interests */}
            <div className="space-y-2">
              <Label className="text-foreground/80 text-xs font-semibold flex items-center justify-between">
                <span>المجالات والخدمات المفضلة</span>
                <span className="text-muted-foreground font-normal text-[10px]">(اختر ٣ مجالات على الأقل)</span>
              </Label>
              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
                {availableInterests.map((interest) => (
                  <Badge
                    key={interest}
                    variant={interests.includes(interest) ? "default" : "outline"}
                    className={`cursor-pointer rounded-full px-3 py-1 text-xs transition-all select-none ${
                      interests.includes(interest)
                        ? "bg-primary text-white border-primary"
                        : "border-border text-muted-foreground bg-muted/40 hover:border-primary hover:text-primary"
                    }`}
                    onClick={() => toggleInterest(interest)}
                  >
                    {interest}
                    {interests.includes(interest) && <X className="h-3 w-3 mr-1" />}
                  </Badge>
                ))}
              </div>
              <div className="flex justify-between text-[11px] text-muted-foreground font-numbers">
                <span>تم اختيار:</span>
                <span>{interests.length}/5 مختارة</span>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button 
                variant="outline" 
                className="flex-1 rounded-xl border-border bg-muted/40 hover:bg-muted" 
                onClick={handleOnboardingComplete}
                disabled={isLoading}
              >
                تخطي مؤقتاً
              </Button>
              <Button
                className="flex-1 rounded-xl bg-primary text-white flex items-center justify-center gap-1.5"
                onClick={handleOnboardingComplete}
                disabled={isLoading || !city || interests.length < 3}
              >
                {isLoading ? (
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Rocket className="h-4 w-4 ml-1.5 shrink-0" />
                    <span>ابدأ الآن</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
