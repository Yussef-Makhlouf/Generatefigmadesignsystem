import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Home, Search, Compass, MessageSquare, User, HelpCircle, AlertCircle } from "lucide-react";
import { motion } from "motion/react";

export function NotFoundPage() {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    show: {
      opacity: 1,
      scale: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 relative z-10">
      
      {/* Abstract Glowing Portal Backdrop */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-gradient-to-tr from-primary/10 to-secondary/5 blur-[120px] pointer-events-none -z-10 animate-pulse" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full border border-primary/5 pointer-events-none -z-10 animate-pulse-ring" />
      
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="text-center max-w-md w-full relative"
      >
        
        {/* Floating 404 Graphic */}
        <motion.div variants={itemVariants} className="mb-6 relative inline-block select-none">
          <div className="text-[10rem] sm:text-[12rem] font-extrabold leading-none bg-gradient-to-b from-primary via-secondary to-primary bg-clip-text text-transparent filter drop-shadow-[0_15px_40px_rgba(0,242,254,0.25)] numeral animate-float">
            404
          </div>
          {/* Absolute floating ornament */}
          <div className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-secondary/15 flex items-center justify-center border border-secondary/20 shadow-md animate-bounce-cta">
            <AlertCircle className="h-5 w-5 text-secondary" />
          </div>
        </motion.div>

        {/* Header Text */}
        <motion.div variants={itemVariants} className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold mb-3 tracking-tight">
            عذراً، تِهنا في صحراء المعرفة
          </h1>
          <p className="text-sm sm:text-base text-text-secondary leading-relaxed max-w-xs sm:max-w-sm mx-auto">
            الصفحة التي تحاول الوصول إليها غير موجودة، أو ربما تم نقلها إلى واحة معرفية أخرى.
          </p>
        </motion.div>

        {/* Navigation Action Buttons */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-3.5 justify-center mb-10">
          <Button
            onClick={() => navigate("/")}
            className="rounded-xl bg-primary hover:bg-primary-hover text-white shadow-md shadow-primary/20 touch-target h-12 px-6 font-bold flex items-center justify-center gap-2 hover:scale-[1.03] transition-all duration-300"
          >
            <Home className="h-5 w-5 ml-1" />
            <span>العودة للرئيسية</span>
          </Button>
          
          <Button
            variant="outline"
            onClick={() => navigate("/search")}
            className="rounded-xl premium-glass-card border-border/80 hover:border-primary/30 text-foreground touch-target h-12 px-6 font-bold flex items-center justify-center gap-2 hover:scale-[1.03] transition-all duration-300"
          >
            <Search className="h-5 w-5 ml-1" />
            <span>ابحث في المنصة</span>
          </Button>
        </motion.div>

        {/* Suggestion Navigation Links (Bento Glass Card) */}
        <motion.div 
          variants={itemVariants} 
          className="p-5 sm:p-6 premium-glass-card rounded-2xl border-border/60 shadow-lg text-right"
        >
          <h3 className="font-extrabold mb-4 text-xs text-text-muted tracking-wider uppercase flex items-center gap-2 border-b border-border/20 pb-2.5">
            <Compass className="h-4.5 w-4.5 text-secondary" />
            <span>روابط مفيدة مقترحة</span>
          </h3>
          
          <div className="grid grid-cols-1 gap-2.5">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs sm:text-sm text-text-secondary hover:text-primary hover:bg-primary/5 hover:pr-4 transition-all duration-300 text-right w-full group touch-target"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-primary/40 group-hover:bg-primary transition-colors" />
              <span className="font-medium flex-1">الصفحة الرئيسية للمنصة</span>
            </button>
            
            <button
              onClick={() => navigate("/questions/new")}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs sm:text-sm text-text-secondary hover:text-primary hover:bg-primary/5 hover:pr-4 transition-all duration-300 text-right w-full group touch-target"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-primary/40 group-hover:bg-primary transition-colors" />
              <span className="font-medium flex-1 flex items-center gap-1.5">
                <span>اطرح سؤالاً جديداً على الخبراء</span>
                <MessageSquare className="h-3.5 w-3.5 opacity-60 text-primary" />
              </span>
            </button>
            
            <button
              onClick={() => navigate("/profile/me")}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs sm:text-sm text-text-secondary hover:text-primary hover:bg-primary/5 hover:pr-4 transition-all duration-300 text-right w-full group touch-target"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-primary/40 group-hover:bg-primary transition-colors" />
              <span className="font-medium flex-1 flex items-center gap-1.5">
                <span>ملفي الشخصي ونقاط السمعة</span>
                <User className="h-3.5 w-3.5 opacity-60 text-secondary" />
              </span>
            </button>

            <button
              onClick={() => navigate("/help")}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs sm:text-sm text-text-secondary hover:text-primary hover:bg-primary/5 hover:pr-4 transition-all duration-300 text-right w-full group touch-target"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-primary/40 group-hover:bg-primary transition-colors" />
              <span className="font-medium flex-1 flex items-center gap-1.5">
                <span>زيارة مركز المساعدة والدعم</span>
                <HelpCircle className="h-3.5 w-3.5 opacity-60 text-primary" />
              </span>
            </button>
          </div>
        </motion.div>
        
      </motion.div>
    </div>
  );
}
