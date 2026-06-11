import { useNavigate } from "react-router";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Info, ArrowRight, Award, Compass, MessageSquare, Shield, Sparkles, Check } from "lucide-react";
import { SEO, breadcrumbSchema, SITE_URL } from "../components/seo";

export function AboutPage() {
  const navigate = useNavigate();

  const values = [
    {
      icon: Compass,
      title: "التوجيه المعرفي",
      description: "نحن هنا لمساعدة الباحثين عن المعرفة في الوصول إلى إجابات دقيقة وموثوقة من خبراء حقيقيين في مجالاتهم."
    },
    {
      icon: Award,
      title: "نظام السمعة العادل",
      description: "نقدر المساهمات المعرفية من خلال نظام نقاط السمعة والأوسمة التي تعكس مدى مصداقية وفائدة إجابات الخبراء."
    },
    {
      icon: Shield,
      title: "التحقق الموثوق",
      description: "ندقق في هويات وتراخيص الكيانات والمؤسسات التجارية والمهنية للتأكد من موثوقية وجودة الخدمة الطبية أو القانونية وغيرها."
    }
  ];

  const milestones = [
    { value: "+١٠ آلاف", label: "مستخدم نشط" },
    { value: "+٥ آلاف", label: "سؤال مجاب عنه" },
    { value: "+٥٠٠", label: "خبير معتمد" },
    { value: "+١٥", label: "مساحة مجتمعية" }
  ];

  return (
    <div className="w-full animate-fade-in pb-12 relative text-right" dir="rtl">
      <SEO
        title="من نحن"
        description="تعرف على منصة خبير - مجتمع المعرفة العربي الأول للأسئلة والأجوبة والخبراء المعتمدين."
        canonical="/about"
        structuredData={breadcrumbSchema([
          { name: "الرئيسية", url: `${SITE_URL}/` },
          { name: "من نحن", url: `${SITE_URL}/about` },
        ])}
      />
      {/* Background ambient auroras */}
      <div className="absolute top-12 left-1/3 w-96 h-96 rounded-full bg-primary/5 blur-3xl pointer-events-none -z-10 animate-pulse" />
      <div className="absolute bottom-12 right-1/3 w-80 h-80 rounded-full bg-secondary/5 blur-3xl pointer-events-none -z-10 animate-pulse" />

      {/* Header Section */}
      <div className="mb-10 relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-md shadow-primary/10">
            <Info className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">عن منصة خبير</h1>
            <p className="text-sm text-text-secondary">واحتكم المعرفية للحصول على إجابات موثوقة من خبراء معتمدين</p>
          </div>
        </div>

        <Button
          variant="outline"
          onClick={() => navigate(-1)}
          className="rounded-xl border-border/80 hover:border-primary/30 text-foreground w-fit flex items-center gap-2 self-end md:self-auto transition-transform hover:scale-[1.02]"
        >
          <span>العودة</span>
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Intro Section - Premium Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-12 relative z-10">
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold w-fit animate-pulse">
            <Sparkles className="h-3.5 w-3.5" />
            <span>نثري المحتوى المعرفي العربي</span>
          </div>
          <h2 className="text-3xl font-black leading-tight text-text-primary">
            نسد الفجوة بين الباحثين عن المعرفة والخبراء المعتمدين في الوطن العربي
          </h2>
          <p className="text-sm sm:text-base text-text-secondary leading-relaxed">
            منصة <strong>خبير</strong> هي منصة أسئلة وأجوبة مجتمعية رائدة تم تصميمها خصيصاً للمستخدم العربي. 
            نسعى لخلق بيئة رقمية هادفة وموثوقة تجمع المستهلكين بالخبراء الفرديين، والشركات، والأطباء، والمحامين، والعيادات، والأنشطة التجارية المختلفة. 
            نحن نوفر مكاناً آمناً لطرح التساؤلات والحصول على إجابات دقيقة خاضعة لنظام تقييم ومراجعة دقيق.
          </p>
          <div className="flex flex-wrap gap-4 pt-2">
            <Button
              className="rounded-xl bg-primary hover:bg-primary-hover text-white px-6 h-11 font-bold shadow-md shadow-primary/10 transition-transform duration-200 hover:scale-[1.02]"
              onClick={() => navigate("/questions/new")}
            >
              اطرح سؤالاً الآن
            </Button>
            <Button
              variant="outline"
              className="rounded-xl premium-glass-card border-border/80 hover:border-primary/20 text-foreground px-6 h-11 font-bold transition-transform duration-200 hover:scale-[1.02]"
              onClick={() => navigate("/spaces")}
            >
              استكشف المساحات
            </Button>
          </div>
        </div>

        {/* Abstract Isometric Brand Shape Graphic */}
        <div className="lg:col-span-5 flex justify-center">
          <div className="relative w-72 h-72 sm:w-80 sm:h-80 select-none">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-primary/20 to-secondary/10 blur-xl animate-pulse" />
            <div className="absolute inset-4 rounded-3xl border border-primary/10 rotate-6 transition-transform duration-500 hover:rotate-12" />
            <div className="absolute inset-8 rounded-2xl border border-secondary/15 -rotate-6 transition-transform duration-500 hover:-rotate-12" />
            
            {/* Front floating glassmorphism card */}
            <div className="absolute inset-12 premium-glass-card border-border/80 rounded-2xl flex flex-col items-center justify-center p-6 shadow-xl animate-float">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg mb-4">
                <Sparkles className="h-8 w-8 text-white animate-pulse" />
              </div>
              <span className="font-black text-lg text-primary tracking-wide">مـنـصـة خـبـيـر</span>
              <span className="text-[10px] text-text-muted mt-1 uppercase tracking-widest font-semibold">Knowledge Ecosystem</span>
            </div>
          </div>
        </div>
      </div>

      {/* Platform Statistics Milestones */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-12 relative z-10">
        {milestones.map((m, idx) => (
          <Card key={idx} className="premium-glass-card border-border/70 rounded-2xl p-5 text-center shadow-sm hover:scale-[1.02] transition-transform">
            <CardContent className="p-0">
              <div className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-l from-primary to-secondary bg-clip-text text-transparent mb-1 numeral">
                {m.value}
              </div>
              <div className="text-xs text-text-secondary font-bold">{m.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Core Values Section */}
      <div className="mb-12 relative z-10">
        <div className="text-center max-w-xl mx-auto mb-10">
          <h3 className="text-xl sm:text-2xl font-extrabold text-text-primary mb-2">رؤيتنا وقيمنا الأساسية</h3>
          <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
            تأسست خبير على ثلاثة مبادئ راسخة لضمان تداول معرفي آمن، موضوعي، وموثق للجميع.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {values.map((v, idx) => {
            const Icon = v.icon;
            return (
              <Card key={idx} className="premium-glass-card border-border/60 rounded-2xl p-6 shadow-sm flex flex-col gap-4 text-right">
                <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0">
                  <Icon className="h-5.5 w-5.5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-base mb-2 text-text-primary">{v.title}</h4>
                  <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">{v.description}</p>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Features Checklist Grid */}
      <div className="p-6 sm:p-8 premium-glass-card rounded-2xl border-border/80 relative overflow-hidden z-10">
        <div className="absolute inset-0 bg-gradient-to-l from-primary/5 to-transparent pointer-events-none" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <h3 className="text-lg sm:text-xl font-extrabold text-text-primary mb-4 flex items-center gap-2">
              <Check className="h-5 w-5 text-emerald-500 shrink-0" />
              <span>ما الذي يميز منصة خبير؟</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex gap-2 items-start">
                <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <span className="text-xs sm:text-sm text-text-secondary">مساحات تفاعل مخصصة وتصنيف للمجالات.</span>
              </div>
              <div className="flex gap-2 items-start">
                <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <span className="text-xs sm:text-sm text-text-secondary">رفع آمن للوثائق والتراخيص الرسمية.</span>
              </div>
              <div className="flex gap-2 items-start">
                <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <span className="text-xs sm:text-sm text-text-secondary">نظام ذكي للسمعة لمنع التلاعب والتزوير.</span>
              </div>
              <div className="flex gap-2 items-start">
                <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <span className="text-xs sm:text-sm text-text-secondary">واجهة مستخدم عربية غنية وسلسة التصفح.</span>
              </div>
            </div>
          </div>
          
          <div className="text-center md:text-left space-y-4">
            <h4 className="font-bold text-sm text-text-secondary">جاهز لتجربة تفاعلية متكاملة؟</h4>
            <p className="text-xs text-text-muted leading-relaxed">
              انضم إلينا اليوم كخبير أو كباحث عن المعرفة، وساهم في بناء أضخم مجتمع معرفي عربي موثق.
            </p>
            <Button
              className="rounded-xl bg-secondary hover:bg-secondary-hover text-white font-bold h-10 px-5 text-xs shadow-sm transition-transform duration-200 hover:scale-[1.02]"
              onClick={() => navigate("/auth/register")}
            >
              تسجيل حساب جديد مجاناً
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
