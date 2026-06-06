import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";
import { Separator } from "../components/ui/separator";
import { Badge } from "../components/ui/badge";
import { Eye, EyeOff, Zap, Sparkles, Shield, MessageSquare, ChevronLeft, Star, Trophy, ArrowRight, Quote } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { signIn } from "../../lib/services";

const FEATURES = [
  { icon: MessageSquare, text: "آلاف الأسئلة والإجابات التقنية" },
  { icon: Shield,        text: "خبراء ومستشارون موثوقون" },
  { icon: Sparkles,      text: "محتوى عربي أصيل عالي الجودة" },
];

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail]           = useState("");
  const [password, setPassword]     = useState("");
  const [showPass, setShowPass]     = useState(false);
  const [loading, setLoading]       = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const cleanEmail = email.toLowerCase().trim();
      const { user, error } = await signIn(cleanEmail, password);

      if (error) {
        // Map common Supabase error codes to friendly Arabic text
        let friendlyError = error;
        if (error.includes("Invalid login credentials")) {
          friendlyError = "البريد الإلكتروني أو كلمة المرور غير صحيحة.";
        } else if (error.includes("Email not confirmed")) {
          friendlyError = "البريد الإلكتروني لم يتم تأكيده بعد. يرجى مراجعة بريدك الإلكتروني.";
        }
        
        toast.error(`فشل تسجيل الدخول: ${friendlyError}`, {
          position: "bottom-center",
          duration: 3000,
        });
        setLoading(false);
        return;
      }

      if (user) {
        toast.success(`مرحباً بك مجدداً، ${user.name}!`, {
          position: "bottom-center",
          duration: 2000,
        });
        navigate("/");
      } else {
        toast.error("فشل تحميل بيانات الحساب الشخصي.", {
          position: "bottom-center",
        });
        setLoading(false);
      }
    } catch (err: any) {
      console.error(err);
      toast.error("حدث خطأ غير متوقع أثناء تسجيل الدخول.", {
        position: "bottom-center",
        duration: 3000,
      });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen md:h-screen w-full flex flex-col md:flex-row relative overflow-y-auto md:overflow-hidden bg-neutral-950 text-white font-sans">
      
      {/* Dynamic Ambient Background (Universal) */}
      <div className="absolute inset-0 arabic-geometric-mesh-fine opacity-20 pointer-events-none z-0" />
      
      {/* ── LEFT SIDE: Elegant Auth Form Panel ── */}
      <div className="flex-1 flex flex-col justify-between p-6 sm:p-10 md:p-16 z-10 relative bg-neutral-950/70 backdrop-blur-md min-h-screen md:min-h-0 pb-[calc(2rem+env(safe-area-inset-bottom))]">
        
        {/* Top bar header */}
        <div className="flex items-center justify-between w-full mb-8">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shadow-primary shadow-sm group-hover:scale-105 transition-transform duration-280 ease-spring">
              <Zap className="h-4.5 w-4.5 text-white" />
            </div>
            <span className="font-heading font-bold text-lg text-white tracking-wide">خبير</span>
          </Link>

          <Button
            variant="ghost"
            className="text-neutral-400 hover:text-white hover:bg-white/5 rounded-xl px-4 py-2 text-xs flex items-center gap-1.5 transition-all duration-280"
            onClick={() => navigate("/")}
          >
            <span>العودة للرئيسية</span>
            <ChevronLeft className="h-4 w-4 flip-rtl" />
          </Button>
        </div>

        {/* Center content Form */}
        <div className="w-full max-w-md mx-auto my-auto">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <div className="mb-8 text-right">
              <h2 className="text-2xl sm:text-3xl font-bold font-heading text-white mb-2">مرحباً بعودتك</h2>
              <p className="text-sm text-neutral-400">سجّل دخولك الآن للوصول إلى شبكة خبراء خبير واستئناف رحلة المعرفة</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs text-neutral-300 font-medium">البريد الإلكتروني</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 rounded-xl bg-neutral-900/60 border-neutral-800 text-white placeholder:text-neutral-600 focus:border-primary/50 text-right"
                  required
                  dir="ltr"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-xs text-neutral-300 font-medium">كلمة المرور</Label>
                  <Link to="/auth/forgot-password" className="text-[11px] text-secondary hover:underline transition-colors font-medium">
                    نسيت كلمة المرور؟
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPass ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 rounded-xl bg-neutral-900/60 border-neutral-800 text-white placeholder:text-neutral-600 focus:border-primary/50 pl-10 text-right"
                    required
                  />
                  <button
                    type="button"
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white transition-colors"
                    onClick={() => setShowPass(!showPass)}
                  >
                    {showPass ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 rounded-xl bg-primary hover:bg-primary-hover border-0 shadow-primary shadow-sm hover:shadow-md transition-all duration-280 font-bold text-white mt-4 flex items-center justify-center gap-2"
                disabled={loading}
              >
                {loading ? (
                  <div className="h-5 w-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>تسجيل الدخول</span>
                    <ArrowRight className="h-4 w-4 shrink-0 flip-rtl" />
                  </>
                )}
              </Button>
            </form>

            <div className="relative my-8">
              <Separator className="bg-neutral-800" />
              <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-neutral-950 px-3 text-xs text-neutral-500 font-medium">
                أو تابع باستخدام
              </span>
            </div>

            <Button
              variant="outline"
              className="w-full h-12 rounded-xl border-neutral-800 bg-neutral-900/40 text-neutral-300 hover:text-white hover:bg-neutral-800 gap-2 cursor-not-allowed opacity-60 flex items-center justify-center"
              disabled
            >
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span>حساب Google (قريباً)</span>
            </Button>
          </motion.div>
        </div>

        {/* Footer legal */}
        <div className="w-full text-center mt-8">
          <p className="text-xs text-neutral-500">
            ليس لديك حساب؟{" "}
            <Link to="/auth/register" className="text-secondary font-bold hover:underline transition-all">
              انضم الآن مجاناً
            </Link>
          </p>
        </div>
      </div>

      {/* ── RIGHT SIDE: Premium Graphic Wisdom Panel (Desktop Only) ── */}
      <div className="hidden md:flex flex-1 relative overflow-hidden bg-gradient-to-br from-neutral-900 via-neutral-950 to-primary/20 items-center justify-center p-12 border-r border-neutral-800">
        
        {/* Dynamic decorative backdrop blobs */}
        <div className="absolute top-1/4 right-1/4 w-80 h-80 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 rounded-full bg-secondary/5 blur-3xl pointer-events-none" />
        
        {/* Top-right subtle brand tagline */}
        <div className="absolute top-10 left-10 flex items-center gap-1.5 text-neutral-400 text-xs font-heading">
          <Sparkles className="h-3 w-3 text-secondary animate-float" />
          <span>منصة المعرفة العربية الراقية</span>
        </div>

        {/* Dynamic mockup / stats illustration container */}
        <div className="w-full max-w-lg relative z-10 space-y-8">
          
          {/* Main Title & Features list */}
          <div className="space-y-4">
            <Badge className="bg-primary/10 text-primary border border-primary/20 rounded-full px-3.5 py-1 text-xs font-semibold">
              سمعة موثوقة · إجابات دقيقة
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold font-heading text-white leading-tight">
              اجتمع بصفوة العقول <br />
              <span className="text-primary font-heading">وتبادل المعرفة الفائقة</span>
            </h2>
            <p className="text-neutral-400 text-sm leading-relaxed max-w-md">
              خبير توفر بيئة معرفية راقية وهادئة، تتيح لك توثيق خبراتك، الإجابة عن تساؤلات المطورين، وبناء مكانتك الرقمية.
            </p>
          </div>

          {/* Testimonial component (Featured Expert highlight) */}
          <div className="bg-neutral-900/60 backdrop-blur-xl border border-white/[0.08] p-6 sm:p-8 rounded-2xl relative overflow-hidden shadow-2xl group hover:border-primary/30 transition-all duration-300">
            {/* Ambient subtle light spots inside */}
            <div className="absolute -top-10 -left-10 w-32 h-32 rounded-full bg-primary/10 blur-2xl pointer-events-none" />
            <div className="absolute -bottom-10 -right-10 w-32 h-32 rounded-full bg-secondary/5 blur-2xl pointer-events-none" />
            
            {/* Editorial quote backdrop */}
            <Quote className="absolute -top-2 left-4 h-16 w-16 text-primary/10 -rotate-12 pointer-events-none" />
            
            <div className="flex justify-between items-center mb-5">
              <div className="flex items-center gap-0.5 text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-amber-500 shrink-0" />
                ))}
              </div>
              <Badge className="bg-primary/15 text-primary border border-primary/20 text-[10px] rounded-md px-2 py-0.5 font-medium">
                مساهم متميز
              </Badge>
            </div>
            
            <p className="text-neutral-100 text-sm leading-relaxed font-normal mb-6 relative z-10">
              "ساعدتني منصة خبير في مشاركة مساهماتي التقنية وتطوير مجتمعات المطورين العرب، كما أتاحت لي فرصة التعرف على نخبة من المستشارين والخبراء."
            </p>

            <div className="flex items-center gap-3.5 relative z-10 pt-4 border-t border-white/[0.05]">
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary/20 via-primary/10 to-transparent border border-primary/30 text-primary-300 flex items-center justify-center font-bold text-base shadow-sm shrink-0">
                س
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-semibold text-white">سارة علي</span>
                <div className="flex items-center gap-2 text-xs text-neutral-400 font-medium">
                  <span>مهندسة برمجيات</span>
                  <span className="w-1 h-1 rounded-full bg-neutral-700" />
                  <div className="flex items-center gap-1 text-amber-400/90 font-numbers">
                    <Trophy className="h-3 w-3" />
                    <span>٢,٨٤٠ نقطة سمعة</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats quick strip */}
          <div className="grid grid-cols-3 gap-4 pt-4">
            {FEATURES.map((feat, index) => {
              const Icon = feat.icon;
              return (
                <div key={index} className="flex flex-col gap-2 p-4 rounded-xl bg-neutral-900/30 border border-neutral-800/40">
                  <Icon className="h-5 w-5 text-secondary shrink-0" />
                  <span className="text-[11px] text-neutral-300 leading-snug">{feat.text}</span>
                </div>
              );
            })}
          </div>

        </div>
      </div>
      
    </div>
  );
}
