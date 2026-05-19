import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";
import { Dialog, DialogContent } from "../components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Badge } from "../components/ui/badge";
import { Eye, EyeOff, CheckCircle2, Sparkles, X, PartyPopper, Rocket } from "lucide-react";

const availableInterests = [
  "برمجة", "تقنية", "تصميم", "أعمال", "تعليم",
  "صحة", "علوم", "رياضيات", "فنون", "أمن معلومات",
  "ذكاء اصطناعي", "تسويق",
];

const perks = [
  "اسأل خبراء معتمدين",
  "شارك معرفتك واكسب نقاطاً",
  "تابع المواضيع التي تهمك",
  "احصل على إجابات من مجتمعك",
];

export function RegisterPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [city, setCity] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setShowOnboarding(true);
    }, 600);
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    navigate("/");
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

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-secondary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/3 right-1/4 w-56 h-56 bg-primary/5 rounded-full blur-3xl" />
        </div>

        <div className="w-full max-w-lg relative grid md:grid-cols-2 gap-6 items-start">
          {/* Left side - Perks (desktop only) */}
          <div className="hidden md:flex flex-col justify-center gap-6 py-8">
            <div>
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-secondary mb-4 shadow-lg">
                <span className="text-white font-bold text-xl">K</span>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Khapeer
              </h1>
              <p className="text-muted-foreground text-sm mt-1">منصة الأسئلة والخبراء العرب</p>
            </div>
            <div className="space-y-3">
              {perks.map((perk) => (
                <div key={perk} className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-secondary flex-shrink-0" />
                  <span className="text-sm">{perk}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Register Card */}
          <Card className="p-6 shadow-xl border-0 bg-card/80 backdrop-blur-sm">
            {/* Mobile Logo */}
            <div className="md:hidden text-center mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary mb-3 shadow-md">
                <span className="text-white font-bold text-lg">K</span>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Khapeer
              </h1>
            </div>

            <div className="mb-5">
              <h2 className="text-lg font-semibold">إنشاء حساب جديد</h2>
              <p className="text-sm text-muted-foreground mt-0.5">مجاناً وبدون أي رسوم</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">الاسم الكامل</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="أحمد محمد"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-input-background h-11 rounded-xl"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-input-background h-11 rounded-xl"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password">كلمة المرور</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-input-background h-11 rounded-xl pl-10"
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
                  <div className="space-y-1">
                    <div className="flex gap-1">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-all ${i <= passwordStrength ? strengthColor : "bg-muted"}`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      قوة كلمة المرور: <span className={passwordStrength === 3 ? "text-green-500" : passwordStrength === 2 ? "text-yellow-500" : "text-red-500"}>{strengthLabel}</span>
                    </p>
                  </div>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-11 rounded-xl"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  "إنشاء حساب"
                )}
              </Button>
            </form>

            <div className="text-center mt-5">
              <p className="text-sm text-muted-foreground">
                لديك حساب؟{" "}
                <Link to="/auth/login" className="text-primary font-semibold hover:underline">
                  سجل دخولك
                </Link>
              </p>
            </div>
          </Card>
        </div>
      </div>

      {/* Onboarding Modal */}
      <Dialog open={showOnboarding} onOpenChange={setShowOnboarding}>
        <DialogContent className="sm:max-w-md border-0 shadow-2xl">
          <div className="space-y-6 py-2">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary mb-3">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-xl font-bold flex items-center justify-center gap-2">
                أهلاً بك في Khapeer!
                <PartyPopper className="h-5 w-5 text-primary" />
              </h2>
              <p className="text-sm text-muted-foreground mt-1">أخبرنا عنك لنخصص تجربتك</p>
            </div>

            {/* Progress */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>اكتمال الملف الشخصي</span>
                <span>{Math.round(((city ? 1 : 0) + interests.length / 3) / 2 * 100)}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
                  style={{ width: `${Math.round(((city ? 1 : 0) + interests.length / 3) / 2 * 100)}%` }}
                />
              </div>
            </div>

            {/* City */}
            <div className="space-y-2">
              <Label>مدينتك</Label>
              <Select value={city} onValueChange={setCity}>
                <SelectTrigger className="bg-input-background h-11 rounded-xl">
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
              <Label>اهتماماتك <span className="text-muted-foreground font-normal text-xs">(اختر 3-5)</span></Label>
              <div className="flex flex-wrap gap-2">
                {availableInterests.map((interest) => (
                  <Badge
                    key={interest}
                    variant={interests.includes(interest) ? "default" : "outline"}
                    className={`cursor-pointer rounded-full px-3 py-1.5 transition-all select-none ${
                      interests.includes(interest)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "hover:border-primary hover:text-primary"
                    }`}
                    onClick={() => toggleInterest(interest)}
                  >
                    {interest}
                    {interests.includes(interest) && <X className="h-3 w-3 mr-1" />}
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">{interests.length}/5 مختارة</p>
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1 rounded-xl" onClick={handleOnboardingComplete}>
                تخطي
              </Button>
              <Button
                className="flex-1 rounded-xl"
                onClick={handleOnboardingComplete}
                disabled={!city || interests.length < 3}
              >
                <Rocket className="h-4 w-4 ml-1" />
                ابدأ الآن
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
