import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";
import { Separator } from "../components/ui/separator";
import { Eye, EyeOff, Zap, Sparkles, Shield, MessageSquare, ChevronLeft } from "lucide-react";
import { motion } from "motion/react";
import { useAppState } from "../context/AppStateContext";
import { toast } from "sonner";

const FEATURES = [
  { icon: MessageSquare, text: "آلاف الأسئلة والإجابات" },
  { icon: Shield,        text: "خبراء موثّقون" },
  { icon: Sparkles,      text: "محتوى عربي أصيل" },
];

export function LoginPage() {
  const navigate = useNavigate();
  const { users, setCurrentUser } = useAppState();
  const [email, setEmail]           = useState("");
  const [password, setPassword]     = useState("");
  const [showPass, setShowPass]     = useState(false);
  const [loading, setLoading]       = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const cleanEmail = email.toLowerCase().trim();
      let matchedUser = users.find(u => cleanEmail.startsWith(u.username) || cleanEmail.includes(u.username));
      if (!matchedUser) {
        matchedUser = users[0]; // Ahmad Mohamed
      }
      setCurrentUser(matchedUser);
      toast.success(`مرحباً بك مجدداً، ${matchedUser.name}!`, {
        position: "bottom-center",
        duration: 2000,
      });
      navigate("/");
    }, 900);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, hsl(180, 22%, 6%) 0%, hsl(170, 95%, 10%) 50%, hsl(43, 96%, 6%) 100%)" }}
    >
      {/* Dynamic Orbs */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-primary/10 blur-3xl pointer-events-none animate-float" />
      <div className="absolute bottom-1/4 left-1/4 w-80 h-80 rounded-full bg-secondary/10 blur-3xl pointer-events-none" style={{ animationDelay: "1.5s" }} />
      <div className="absolute inset-0 arabic-geometric-mesh-fine opacity-25 pointer-events-none" />

      {/* Back button */}
      <Button
        variant="ghost"
        className="absolute top-6 right-6 text-white/80 hover:text-white hover:bg-white/10 rounded-xl"
        onClick={() => navigate("/")}
      >
        <span>الرئيسية</span>
        <ChevronLeft className="h-4 w-4 mr-1.5 flip-rtl" />
      </Button>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-primary mb-4 shadow-primary shadow-lg animate-pulse-ring">
            <Zap className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-wide font-heading">
            خبير
          </h1>
          <p className="text-muted-foreground text-sm mt-1">منصة المعرفة العربية الراقية</p>
          
          <div className="flex items-center justify-center gap-4 mt-4">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.text} className="flex items-center gap-1.5 text-[11px] font-medium text-white/60">
                  <Icon className="h-3.5 w-3.5 text-secondary" />
                  <span>{f.text}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Card */}
        <Card
          className="p-8 shadow-xl border border-white/10 bg-black/40 backdrop-blur-xl text-white"
          style={{ borderRadius: "var(--radius-xl)" }}
        >
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white font-heading">مرحباً بعودتك</h2>
            <p className="text-sm text-white/60 mt-0.5">سجّل دخولك للمتابعة واستعراض الخبرات</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm text-white/80 font-medium">البريد الإلكتروني</Label>
              <div className="input-glow rounded-xl">
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 rounded-xl bg-white/5 border-white/10 focus:border-primary/50 text-white placeholder:text-white/30"
                  required
                  dir="ltr"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm text-white/80 font-medium">كلمة المرور</Label>
                <button type="button" className="text-xs text-secondary hover:underline">
                  نسيت كلمة المرور؟
                </button>
              </div>
              <div className="relative input-glow rounded-xl">
                <Input
                  id="password"
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 rounded-xl bg-white/5 border-white/10 focus:border-primary/50 text-white placeholder:text-white/30 pl-10"
                  required
                />
                <button
                  type="button"
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                  onClick={() => setShowPass(!showPass)}
                >
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11 rounded-xl gradient-primary border-0 shadow-primary shadow-sm hover:opacity-90 transition-all text-white font-bold"
              disabled={loading}
            >
              {loading ? (
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : "تسجيل الدخول"}
            </Button>
          </form>

          <div className="relative my-6">
            <Separator className="bg-white/10" />
            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/60 px-3 text-xs text-white/40 whitespace-nowrap">
              أو تابع مع
            </span>
          </div>

          <Button
            variant="outline"
            className="w-full h-11 rounded-xl border-white/10 bg-white/5 text-white hover:bg-white/10 gap-2 cursor-not-allowed opacity-60"
            disabled
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google (قريباً)
          </Button>

          <p className="text-center text-sm text-white/60 mt-6">
            ليس لديك حساب؟{" "}
            <Link to="/auth/register" className="text-secondary font-semibold hover:underline">
              انضم الآن مجاناً
            </Link>
          </p>
        </Card>
      </motion.div>
    </div>
  );
}
