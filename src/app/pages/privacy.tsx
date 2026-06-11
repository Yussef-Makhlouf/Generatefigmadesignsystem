import { useNavigate } from "react-router";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "../components/ui/accordion";
import { Button } from "../components/ui/button";
import { Shield, ArrowRight, Eye, Key, HeartHandshake, HelpCircle } from "lucide-react";
import { SEO } from "../components/seo";

export function PrivacyPage() {
  const navigate = useNavigate();

  return (
    <div className="w-full animate-fade-in pb-12 relative text-right" dir="rtl">
      <SEO title="سياسة الخصوصية" description="سياسة الخصوصية لمنصة خبير - تعرف على كيفية حماية بياناتك الشخصية." canonical="/privacy" />
      <div className="absolute top-12 left-1/3 w-96 h-96 rounded-full bg-primary/5 blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-12 right-1/3 w-80 h-80 rounded-full bg-secondary/5 blur-3xl pointer-events-none -z-10" />

      {/* Header Section */}
      <div className="mb-10 relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-md shadow-primary/10">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">سياسة الخصوصية وحماية البيانات</h1>
            <p className="text-sm text-text-secondary">كيف نحمي خصوصيتك وبياناتك الشخصية في منصة خبير</p>
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

      {/* Top Banner Glass Card */}
      <div className="mb-8 premium-glass-card rounded-2xl border-border/80 p-6 relative overflow-hidden z-10">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 opacity-40 pointer-events-none" />
        <div className="absolute top-0 right-0 w-1.5 h-full bg-secondary" />
        <div className="flex gap-4 items-start">
          <div className="p-3 bg-secondary/10 rounded-xl text-secondary shrink-0">
            <HeartHandshake className="h-6 w-6" />
          </div>
          <div>
            <h2 className="font-extrabold text-base mb-1 text-secondary">خصوصيتك هي أولويتنا الكبرى</h2>
            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
              نلتزم في منصة خبير بحماية بياناتك الشخصية وتأمينها وفق أعلى المعايير التقنية والقانونية العالمية. 
              توضح هذه السياسة كيف نقوم بجمع معلوماتك، وحفظها، واستخدامها، وحقك الكامل في التحكم بها.
            </p>
          </div>
        </div>
      </div>

      {/* Main Accordion Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start relative z-10">
        <div className="lg:col-span-2 space-y-6">
          <Card className="premium-glass-card border-border/60 shadow-md rounded-2xl overflow-hidden">
            <CardHeader className="border-b border-border/20 bg-card/20 pb-4">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Eye className="h-5 w-5 text-primary" />
                <span>تفاصيل بنود حماية الخصوصية</span>
              </CardTitle>
              <CardDescription className="text-xs">اضغط على أي بند لقراءة التفاصيل الكاملة لسياسة الخصوصية</CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <Accordion type="single" collapsible defaultValue="privacy-1" className="w-full">
                <AccordionItem value="privacy-1" className="border-border/30">
                  <AccordionTrigger className="font-bold text-sm sm:text-base text-text-primary hover:text-primary hover:no-underline">
                    1. المعلومات التي نقوم بجمعها
                  </AccordionTrigger>
                  <AccordionContent className="text-xs sm:text-sm text-text-secondary leading-relaxed space-y-3 pt-2">
                    <p>
                      نقوم بجمع المعلومات اللازمة فقط لتشغيل المنصة وتقديم خدمات عالية الجودة لك. ويشمل ذلك:
                    </p>
                    <ul className="list-disc pr-5 space-y-1.5 font-medium">
                      <li>بيانات الحساب: الاسم الكامل، البريد الإلكتروني، واسم المستخدم.</li>
                      <li>بيانات الملف الشخصي: النبذة التعريفية، الموقع الجغرافي، والصورة الشخصية.</li>
                      <li>الوثائق المرفقة: تراخيص الأعمال والهوية المهنية للكيانات التجارية (والتي يتم حفظها في Buckets خاصة مشفرة وآمنة).</li>
                      <li>بيانات الاستخدام: عناوين IP، نوع المتصفح، الصفحات التي زرتها، والتصويتات.</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="privacy-2" className="border-border/30">
                  <AccordionTrigger className="font-bold text-sm sm:text-base text-text-primary hover:text-primary hover:no-underline">
                    2. كيف نستخدم معلوماتك
                  </AccordionTrigger>
                  <AccordionContent className="text-xs sm:text-sm text-text-secondary leading-relaxed space-y-3 pt-2">
                    <p>
                      نستخدم المعلومات لتقديم تجربة معرفية مخصصة وآمنة، وتحديداً من أجل:
                    </p>
                    <ul className="list-disc pr-5 space-y-1.5">
                      <li>تمكينك من نشر الأسئلة، الإجابات، والتعليقات والتفاعل مع الخبراء.</li>
                      <li>إرسال الإشعارات الضرورية وتحديثات المنصة عن طريق Edge Functions مخصصة.</li>
                      <li>مراجعة والتحقق من التراخيص التجارية للخبراء المسجلين ككيانات معتمدة.</li>
                      <li>مراقبة ومنع الأنشطة الاحتيالية، مثل المحتوى الضار أو التلاعب بالسمعة.</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="privacy-3" className="border-border/30">
                  <AccordionTrigger className="font-bold text-sm sm:text-base text-text-primary hover:text-primary hover:no-underline">
                    3. حماية البيانات وأمن التخزين
                  </AccordionTrigger>
                  <AccordionContent className="text-xs sm:text-sm text-text-secondary leading-relaxed space-y-3 pt-2">
                    <p>
                      تخضع بياناتك للحماية عبر تقنيات تشفير متطورة في قواعد بيانات Supabase المؤمنة. 
                      نطبق سياسات RLS (Row Level Security) صارمة لضمان ألا يتمكن أي شخص غير مخول من الوصول إلى بياناتك الخاصة.
                    </p>
                    <p>
                      تراخيص الأعمال والمستندات الحساسة يتم رفعها وتخزينها في Bucket مشفرة وخاصة (Private Storage Bucket) 
                      حيث ينحصر حق الوصول إليها في صاحب الوثيقة الأصلي فقط ومراجعي المنصة من المدراء المعتمدين.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="privacy-4" className="border-border/30">
                  <AccordionTrigger className="font-bold text-sm sm:text-base text-text-primary hover:text-primary hover:no-underline">
                    4. ملفات تعريف الارتباط (Cookies)
                  </AccordionTrigger>
                  <AccordionContent className="text-xs sm:text-sm text-text-secondary leading-relaxed space-y-3 pt-2">
                    <p>
                      نستخدم ملفات تعريف الارتباط وتقنيات التتبع المماثلة لتحسين تجربتك على المنصة، 
                      وتذكر إعداداتك المفضلة (مثل الوضع الداكن/الفاتح)، وتوفير تسجيل دخول سريع وآمن.
                    </p>
                    <p>
                      يمكنك تعطيل ملفات تعريف الارتباط من خلال إعدادات متصفحك، ولكن قد يؤثر ذلك على عمل بعض ميزات المنصة بكفاءة.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="privacy-5" className="border-border/30">
                  <AccordionTrigger className="font-bold text-sm sm:text-base text-text-primary hover:text-primary hover:no-underline">
                    5. حقوقك في التحكم ببياناتك
                  </AccordionTrigger>
                  <AccordionContent className="text-xs sm:text-sm text-text-secondary leading-relaxed space-y-3 pt-2">
                    <p>
                      بموجب قوانين حماية البيانات، تتمتع بحقوق كاملة تشمل:
                    </p>
                    <ul className="list-disc pr-5 space-y-1.5">
                      <li>حق تعديل أو تحديث بياناتك مباشرة من صفحة الإعدادات الشخصية.</li>
                      <li>حق تنزيل نسخة من بياناتك المخزنة لدينا.</li>
                      <li>حق طلب حذف حسابك وبياناتك الشخصية بالكامل من خوادمنا بشكل نهائي.</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Info cards */}
        <div className="space-y-6">
          <Card className="premium-glass-card border-border/80 shadow-sm rounded-2xl p-5 text-right">
            <h3 className="font-bold text-sm text-primary mb-3 flex items-center gap-2 border-b border-border/20 pb-2">
              <Key className="h-4.5 w-4.5 text-secondary shrink-0" />
              <span>مبادئ الأمن السيبراني لدينا</span>
            </h3>
            <ul className="space-y-2.5 text-xs text-text-secondary leading-relaxed">
              <li className="flex gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary shrink-0 mt-1.5" />
                <span>تشفير كافة اتصالات المنصة عبر بروتوكول HTTPS المشفر.</span>
              </li>
              <li className="flex gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary shrink-0 mt-1.5" />
                <span>تطبيق مبدأ الحد الأدنى من الصلاحيات للوصول للبيانات.</span>
              </li>
              <li className="flex gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary shrink-0 mt-1.5" />
                <span>فحص وتدقيق مستمر للثغرات والبرمجيات الخبيثة.</span>
              </li>
            </ul>
          </Card>

          <Card className="premium-glass-card border-border/80 shadow-sm rounded-2xl p-5 text-right">
            <h3 className="font-bold text-sm text-primary mb-3 flex items-center gap-2 border-b border-border/20 pb-2">
              <HelpCircle className="h-4.5 w-4.5 text-secondary shrink-0" />
              <span>استفسار حول الخصوصية؟</span>
            </h3>
            <p className="text-xs text-text-secondary leading-relaxed mb-4">
              إذا كان لديك أي سؤال أو مخاوف بشأن خصوصية بياناتك أو ترغب في تقديم طلب لممارسة حقوقك، فلا تتردد في التواصل معنا.
            </p>
            <Button
              className="w-full rounded-xl bg-primary hover:bg-primary-hover text-white text-xs h-10 transition-transform duration-200 hover:scale-[1.02]"
              onClick={() => navigate("/help")}
            >
              مراسلة مسؤول حماية البيانات
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
