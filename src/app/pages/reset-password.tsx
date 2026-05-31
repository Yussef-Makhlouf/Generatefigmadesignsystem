import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";
import { Zap, Sparkles, ChevronLeft, Lock, Eye, EyeOff } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { completePasswordReset } from "../../lib/services";

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  // Password Validation Checks
  const hasMinLength = password.length >= 8;
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const matchesConfirm = password === confirmPassword && password.length > 0;

  const isFormValid = hasMinLength && hasNumber && hasSpecial && matchesConfirm;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) {
      toast.error("يرجى التأكد من استيفاء جميع متطلبات أمان كلمة المرور.", {
        position: "bottom-center",
      });
      return;
    }

    setLoading(true);
    try {
      const { success, error } = await completePasswordReset(password);

      if (!success) {
        toast.error(`فشل التحديث: ${error || "حدث خطأ غير متوقع"}`, {
          position: "bottom-center",
        });
        setLoading(false);
        return;
      }

      toast.success("تم تحديث كلمة المرور بنجاح! جاري تحويلك لتسجيل الدخول...", {
        position: "bottom-center",
        duration: 3000,
      });

      setTimeout(() => {
        navigate("/auth/login");
      }, 3000);
    } catch (err) {
      console.error(err);
      toast.error("حدث خطأ غير متوقع أثناء تحديث كلمة المرور.", {
        position: "bottom-center",
      });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-neutral-950 text-white font-sans px-4">
      {/* Ambient background decoration */}
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

          <div className="mb-6 text-center">
            <h2 className="text-xl font-bold font-heading text-white mb-2">تحديث كلمة المرور</h2>
            <p className="text-sm text-neutral-400">
              قم بإنشاء كلمة مرور جديدة قوية وآمنة لحماية حسابك واستعادة الوصول الكامل.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* New Password */}
            <div className="space-y-2 text-right">
              <Label htmlFor="password" className="text-xs text-neutral-300 font-medium">كلمة المرور الجديدة</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 rounded-xl bg-neutral-950/80 border-neutral-800 text-white placeholder:text-neutral-600 focus:border-primary/50 text-right pl-10 pr-10"
                  required
                  disabled={loading}
                />
                <Lock className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                <button
                  type="button"
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white transition-colors"
                  onClick={() => setShowPass(!showPass)}
                  disabled={loading}
                >
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2 text-right">
              <Label htmlFor="confirmPassword" className="text-xs text-neutral-300 font-medium">تأكيد كلمة المرور الجديدة</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-12 rounded-xl bg-neutral-950/80 border-neutral-800 text-white placeholder:text-neutral-600 focus:border-primary/50 text-right pr-10"
                  required
                  disabled={loading}
                />
                <Lock className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
              </div>
            </div>

            {/* Premium Dynamic Validation Checklist */}
            <div className="bg-neutral-950/50 p-4 rounded-xl border border-white/[0.04] space-y-2 text-xs">
              <span className="font-semibold text-neutral-400 block mb-2 text-right">متطلبات الأمان لضمان سلامة الحساب:</span>
              
              <div className="flex items-center gap-2 justify-end">
                <span className={hasMinLength ? 'text-emerald-400 font-medium' : 'text-neutral-500'}>8 أحرف أو أكثر</span>
                <span className={`w-1.5 h-1.5 rounded-full ${hasMinLength ? 'bg-emerald-400' : 'bg-neutral-700'}`} />
              </div>

              <div className="flex items-center gap-2 justify-end">
                <span className={hasNumber ? 'text-emerald-400 font-medium' : 'text-neutral-500'}>يحتوي على أرقام (0-9)</span>
                <span className={`w-1.5 h-1.5 rounded-full ${hasNumber ? 'bg-emerald-400' : 'bg-neutral-700'}`} />
              </div>

              <div className="flex items-center gap-2 justify-end">
                <span className={hasSpecial ? 'text-emerald-400 font-medium' : 'text-neutral-500'}>يحتوي على رمز خاص (مثل @, #, $)</span>
                <span className={`w-1.5 h-1.5 rounded-full ${hasSpecial ? 'bg-emerald-400' : 'bg-neutral-700'}`} />
              </div>

              <div className="flex items-center gap-2 justify-end">
                <span className={matchesConfirm ? 'text-emerald-400 font-medium' : 'text-neutral-500'}>كلمتا المرور متطابقتان تماماً</span>
                <span className={`w-1.5 h-1.5 rounded-full ${matchesConfirm ? 'bg-emerald-400' : 'bg-neutral-700'}`} />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 rounded-xl bg-primary hover:bg-primary-hover border-0 shadow-primary shadow-sm hover:shadow-md transition-all duration-280 font-bold text-white mt-4 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              disabled={loading || !isFormValid}
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <span>تحديث كلمة المرور وإتمام الحماية</span>
              )}
            </Button>
          </form>

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
