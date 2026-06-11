import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";
import { Zap, Sparkles, ChevronLeft, ArrowRight, Mail } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { sendPasswordReset } from "../../lib/services";
import { SEO } from "../components/seo";

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("يرجى إدخال بريد إلكتروني صالح.", { position: "bottom-center" });
      return;
    }

    setLoading(true);
    try {
      const cleanEmail = email.toLowerCase().trim();
      const { success, error } = await sendPasswordReset(cleanEmail);

      if (!success) {
        toast.error(`فشل الطلب: ${error || "حدث خطأ غير متوقع"}`, {
          position: "bottom-center",
        });
        setLoading(false);
        return;
      }

      setSent(true);
      toast.success("تم إرسال رابط إعادة التعيين بنجاح!", {
        position: "bottom-center",
        duration: 4000,
      });
    } catch (err) {
      console.error(err);
      toast.error("حدث خطأ غير متوقع في الخادم.", {
        position: "bottom-center",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-neutral-950 text-white font-sans px-4">
      <SEO title="نسيت كلمة المرور" description="استعد كلمة مرور حسابك على منصة خبير." canonical="/auth/forgot-password" noindex />
      <div className="absolute inset-0 arabic-geometric-mesh-fine opacity-20 pointer-events-none z-0" />
      <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-secondary/5 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md z-10">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="bg-neutral-900/60 backdrop-blur-xl border border-white/[0.08] p-8 rounded-2xl shadow-2xl relative"
        >
          {/* Top Logo and Tagline */}
          <div className="flex flex-col items-center mb-8">
            <Link to="/" className="flex items-center gap-2 group mb-4">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-primary shadow-sm group-hover:scale-105 transition-transform duration-280">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <span className="font-heading font-bold text-2xl text-white tracking-wide">خبير</span>
            </Link>
            <div className="flex items-center gap-1 text-neutral-400 text-xs font-heading">
              <Sparkles className="h-3.5 w-3.5 text-secondary animate-pulse" />
              <span>منصة المعرفة العربية الراقية</span>
            </div>
          </div>

          {!sent ? (
            <>
              <div className="mb-6 text-center">
                <h2 className="text-xl font-bold font-heading text-white mb-2">استعادة كلمة المرور</h2>
                <p className="text-sm text-neutral-400">
                  أدخل بريدك الإلكتروني المسجل وسنرسل لك رابطاً آمناً لإعادة تعيين كلمة المرور الخاصة بك.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2 text-right">
                  <Label htmlFor="email" className="text-xs text-neutral-300 font-medium">البريد الإلكتروني</Label>
                  <div className="relative">
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-12 rounded-xl bg-neutral-950/80 border-neutral-800 text-white placeholder:text-neutral-600 focus:border-primary/50 text-right pl-10"
                      required
                      disabled={loading}
                      dir="ltr"
                    />
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
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
                      <span>إرسال رابط إعادة التعيين</span>
                      <ArrowRight className="h-4 w-4 shrink-0 flip-rtl" />
                    </>
                  )}
                </Button>
              </form>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-6"
            >
              <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-5">
                <Mail className="h-7 w-7" />
              </div>
              <h3 className="text-lg font-bold font-heading text-white mb-2">تفقد صندوق الوارد</h3>
              <p className="text-sm text-neutral-400 max-w-sm mx-auto leading-relaxed mb-6">
                إذا كان البريد الإلكتروني <strong className="text-white font-semibold">{email}</strong> مسجلاً لدينا، فستتلقى رسالة تحتوي على رابط آمن لإعادة تعيين كلمة المرور قريباً.
              </p>
              <Button
                variant="outline"
                className="rounded-xl border-neutral-800 bg-neutral-900/40 text-neutral-300 hover:text-white hover:bg-neutral-800"
                onClick={() => setSent(false)}
              >
                إعادة المحاولة ببريد آخر
              </Button>
            </motion.div>
          )}

          <div className="mt-8 pt-6 border-t border-neutral-800/60 text-center">
            <Link
              to="/auth/login"
              className="text-xs text-neutral-400 hover:text-white flex items-center justify-center gap-1.5 transition-colors font-medium"
            >
              <ChevronLeft className="h-4 w-4 flip-rtl" />
              <span>العودة لتسجيل الدخول</span>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
