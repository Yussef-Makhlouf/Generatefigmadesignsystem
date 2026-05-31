import { useNavigate } from "react-router";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "../components/ui/accordion";
import { Button } from "../components/ui/button";
import { FileText, ArrowRight, ShieldCheck, Scale, AlertTriangle, Users } from "lucide-react";

export function TermsPage() {
  const navigate = useNavigate();

  return (
    <div className="w-full animate-fade-in pb-12 relative text-right" dir="rtl">
      {/* Background ambient light */}
      <div className="absolute top-12 left-1/4 w-96 h-96 rounded-full bg-primary/5 blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-12 right-1/4 w-80 h-80 rounded-full bg-secondary/5 blur-3xl pointer-events-none -z-10" />

      {/* Header Section */}
      <div className="mb-10 relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-md shadow-primary/10">
            <Scale className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">شروط الخدمة والأحكام</h1>
            <p className="text-sm text-text-secondary">اتفاقية الاستخدام القانونية لمنصة خبير المعرفية</p>
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

      {/* Hero Notice Glass Card */}
      <div className="mb-8 premium-glass-card rounded-2xl border-border/80 p-6 relative overflow-hidden z-10">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 opacity-40 pointer-events-none" />
        <div className="absolute top-0 right-0 w-1.5 h-full bg-primary" />
        <div className="flex gap-4 items-start">
          <div className="p-3 bg-primary/10 rounded-xl text-primary shrink-0">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h2 className="font-extrabold text-base mb-1 text-primary">يرجى قراءة هذه الشروط بعناية</h2>
            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
              باستخدامك لمنصة خبير أو وصولك إليها، فإنك توافق على الالتزام بكافة الشروط والأحكام المبينة أدناه. 
              إذا كنت لا توافق على هذه الشروط، يرجى التوقف عن استخدام المنصة فوراً. تم تحديث هذه الاتفاقية في 1 يونيو 2026.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Sections using Accordion for premium interactivity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start relative z-10">
        <div className="lg:col-span-2 space-y-6">
          <Card className="premium-glass-card border-border/60 shadow-md rounded-2xl overflow-hidden">
            <CardHeader className="border-b border-border/20 bg-card/20 pb-4">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <span>بنود اتفاقية الاستخدام</span>
              </CardTitle>
              <CardDescription className="text-xs">اضغط على أي بند لقراءة التفاصيل الكاملة</CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <Accordion type="single" collapsible defaultValue="item-1" className="w-full">
                <AccordionItem value="item-1" className="border-border/30">
                  <AccordionTrigger className="font-bold text-sm sm:text-base text-text-primary hover:text-primary hover:no-underline">
                    1. قبول الشروط والتسجيل
                  </AccordionTrigger>
                  <AccordionContent className="text-xs sm:text-sm text-text-secondary leading-relaxed space-y-3 pt-2">
                    <p>
                      للوصول إلى بعض ميزات المنصة، يتعين عليك إنشاء حساب بريد إلكتروني وكلمة مرور آمنة. 
                      أنت تقر وتضمن أن كافة المعلومات التي تقدمها أثناء التسجيل هي معلومات صحيحة، ودقيقة، ومحدثة.
                    </p>
                    <p>
                      أنت مسؤول مسؤولية كاملة عن الحفاظ على سرية بيانات اعتماد حسابك، وعن كافة الأنشطة التي تتم تحت اسم حسابك. 
                      يجب إخطارنا فوراً بأي استخدام غير مصرح به لحسابك.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2" className="border-border/30">
                  <AccordionTrigger className="font-bold text-sm sm:text-base text-text-primary hover:text-primary hover:no-underline">
                    2. سياسة المحتوى وحقوق الملكية الفكرية
                  </AccordionTrigger>
                  <AccordionContent className="text-xs sm:text-sm text-text-secondary leading-relaxed space-y-3 pt-2">
                    <p>
                      تتيح منصة خبير للمستخدمين طرح الأسئلة وتقديم الإجابات وكتابة المراجعات. 
                      بإضافة محتوى في المنصة، فإنك تمنح منصة خبير ترخيصاً عالمياً، غير حصري، ومجانياً، وقابلاً للترخيص الفرعي 
                      لاستخدام وتعديل ونشر وتوزيع هذا المحتوى على المنصة.
                    </p>
                    <p>
                      تتعهد بعدم نشر أي محتوى ينتهك حقوق الملكية الفكرية لطرف آخر، أو يحتوي على مواد مسيئة، أو تشهيرية، أو مضللة، 
                      أو تنتهك القوانين المعمول بها. تحتفظ المنصة بالحق الكامل في إزالة أي محتوى دون إشعار مسبق.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3" className="border-border/30">
                  <AccordionTrigger className="font-bold text-sm sm:text-base text-text-primary hover:text-primary hover:no-underline">
                    3. نظام السمعة واعتماد الخبراء
                  </AccordionTrigger>
                  <AccordionContent className="text-xs sm:text-sm text-text-secondary leading-relaxed space-y-3 pt-2">
                    <p>
                      تعتمد منصة خبير على نظام سمعة رقمي لتصنيف الخبراء. يتم احتساب النقاط بناءً على تفاعل مجتمع المستخدمين مع إجاباتك 
                      (مثل الإعجاب، واختيار إجابتك كإجابة معتمدة).
                    </p>
                    <p>
                      يحظر تماماً التلاعب بنظام السمعة، سواء عن طريق إنشاء حسابات وهمية للتصويت لصالح إجابات معينة أو القيام بصفقات تصويت متبادل. 
                      أي محاولة للتلاعب ستؤدي إلى تصفير نقاط السمعة أو تعليق الحساب نهائياً.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-4" className="border-border/30">
                  <AccordionTrigger className="font-bold text-sm sm:text-base text-text-primary hover:text-primary hover:no-underline">
                    4. تراخيص الهيئات والكيانات التجارية
                  </AccordionTrigger>
                  <AccordionContent className="text-xs sm:text-sm text-text-secondary leading-relaxed space-y-3 pt-2">
                    <p>
                      بالنسبة للحسابات التجارية والمستقلين الذين يقدمون خدمات معتمدة (مثل الأطباء، العيادات، المحامين)، 
                      يُطلب إرفاق رخصة تجارية صالحة أو مستند إثبات هوية مهنية.
                    </p>
                    <p>
                      تتم مراجعة هذه الوثائق يدوياً من قبل فريق إدارة خبير للتحقق من هوية الكيان. يلتزم مقدم الطلب بتقديم وثائق صحيحة وصالحة، 
                      وتتحمل الجهة المسؤولية القانونية الكاملة عن أي تزوير أو معلومات غير دقيقة.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-5" className="border-border/30">
                  <AccordionTrigger className="font-bold text-sm sm:text-base text-text-primary hover:text-primary hover:no-underline">
                    5. حدود المسؤولية والضمانات
                  </AccordionTrigger>
                  <AccordionContent className="text-xs sm:text-sm text-text-secondary leading-relaxed space-y-3 pt-2">
                    <p>
                      يتم تقديم المعلومات والاستشارات الواردة في منصة خبير "كما هي" دون أي ضمانات من أي نوع. 
                      إن الإجابات المقدمة من الخبراء تعبر عن آرائهم الشخصية وخبراتهم الفردية ولا تشكل استشارة رسمية ملزمة للمنصة.
                    </p>
                    <p>
                      لا تتحمل منصة خبير بأي حال من الأحوال المسؤولية عن أي أضرار مباشرة، أو غير مباشرة، أو تبعية تنشأ عن استخدامك 
                      للمعلومات أو اتخاذ قرارات بناءً عليها.
                    </p>
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
              <AlertTriangle className="h-4.5 w-4.5 text-secondary shrink-0" />
              <span>تنبيهات هامة للمستخدم</span>
            </h3>
            <ul className="space-y-2.5 text-xs text-text-secondary leading-relaxed">
              <li className="flex gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary shrink-0 mt-1.5" />
                <span>أنت مسؤول عن حماية سرية حسابك وكلمة مرورك بشكل كامل.</span>
              </li>
              <li className="flex gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary shrink-0 mt-1.5" />
                <span>يمنع منعاً باتاً نشر محتوى ترويجي عشوائي أو إعلانات غير مصرح بها.</span>
              </li>
              <li className="flex gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary shrink-0 mt-1.5" />
                <span>المنصة مبنية على الاحترام المتبادل وتبادل المعرفة الهادفة.</span>
              </li>
            </ul>
          </Card>

          <Card className="premium-glass-card border-border/80 shadow-sm rounded-2xl p-5 text-right">
            <h3 className="font-bold text-sm text-primary mb-3 flex items-center gap-2 border-b border-border/20 pb-2">
              <Users className="h-4.5 w-4.5 text-secondary shrink-0" />
              <span>تحتاج لمساعدة قانونية؟</span>
            </h3>
            <p className="text-xs text-text-secondary leading-relaxed mb-4">
              إذا كانت لديك أي استفسارات أو اعتراضات قانونية تتعلق بشروط الخدمة، يرجى التواصل مع فريق الشؤون القانونية للمنصة.
            </p>
            <Button
              className="w-full rounded-xl bg-primary hover:bg-primary-hover text-white text-xs h-10 transition-transform duration-200 hover:scale-[1.02]"
              onClick={() => navigate("/help")}
            >
              زيارة مركز المساعدة للدعم
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
