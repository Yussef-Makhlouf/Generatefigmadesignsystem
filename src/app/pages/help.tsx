import { useState } from "react";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../components/ui/accordion";
import {
  HelpCircle,
  Search,
  MessageSquare,
  Trophy,
  Heart,
  Shield,
  Users,
  BookOpen,
  Zap,
  ExternalLink,
  Sparkles,
  HelpCircle as QuestionIcon
} from "lucide-react";
import { motion } from "motion/react";
import { SEO, breadcrumbSchema, SITE_URL } from "../components/seo";

const faqCategories = [
  {
    id: "getting-started",
    title: "البدء",
    icon: Zap,
    faqs: [
      {
        question: "ما هو Khapeer؟",
        answer: "Khapeer هي منصة عربية للأسئلة والأجوبة حيث يمكنك طرح أسئلتك والحصول على إجابات من خبراء ومتخصصين في مختلف المجالات. نهدف إلى بناء مجتمع معرفي عربي قوي."
      },
      {
        question: "كيف أبدأ في استخدام Khapeer؟",
        answer: "قم بإنشاء حساب مجاني، اختر اهتماماتك، ثم ابدأ بطرح أسئلتك أو الإجابة على أسئلة الآخرين. كلما شاركت أكثر، زادت نقاطك وسمعتك في المجتمع."
      },
      {
        question: "هل الاشتراك في Khapeer مجاني؟",
        answer: "نعم، Khapeer مجاني تماماً. يمكنك إنشاء حساب وطرح الأسئلة والإجابة عليها دون أي رسوم."
      },
      {
        question: "كيف أختار اهتماماتي؟",
        answer: "عند التسجيل لأول مرة، ستُطلب منك اختيار 3-5 مواضيع تهمك. يمكنك تغيير اهتماماتك لاحقاً من صفحة الإعدادات."
      }
    ]
  },
  {
    id: "questions",
    title: "الأسئلة",
    icon: MessageSquare,
    faqs: [
      {
        question: "كيف أطرح سؤالاً جيداً؟",
        answer: "اختر عنواناً واضحاً ومحدداً، اشرح السؤال بالتفصيل، أضف الوسوم المناسبة، وتأكد من البحث أولاً لتجنب التكرار. الأسئلة الواضحة تحصل على إجابات أفضل وأسرع."
      },
      {
        question: "كم سؤالاً يمكنني طرحه؟",
        answer: "يمكنك طرح عدد غير محدود من الأسئلة، لكن ننصح بالتركيز على جودة الأسئلة بدلاً من الكمية."
      },
      {
        question: "هل يمكنني تعديل سؤالي بعد نشره؟",
        answer: "نعم، يمكنك تعديل سؤالك في أي وقت من خلال الضغط على زر 'تعديل' في صفحة السؤال."
      },
      {
        question: "كيف أحذف سؤالاً؟",
        answer: "يمكنك حذف أسئلتك من خلال قائمة الخيارات في صفحة السؤال، لكن لاحظ أنه لا يمكن حذف سؤال حصل على إجابات."
      },
      {
        question: "ما هي الوسوم (Tags) وكيف أستخدمها؟",
        answer: "الوسوم هي كلمات مفتاحية تساعد في تصنيف سؤالك. اختر وسوماً دقيقة وذات صلة (مثل 'برمجة'، 'Python'، 'تعليم'). يمكنك إضافة حتى 5 وسوم لكل سؤال."
      }
    ]
  },
  {
    id: "answers",
    title: "الإجابات",
    icon: BookOpen,
    faqs: [
      {
        question: "كيف أكتب إجابة مفيدة؟",
        answer: "قدم إجابة شاملة مع أمثلة عملية، استخدم مصادر موثوقة، اشرح بوضوح، وتجنب الإجابات القصيرة جداً أو غير المفيدة."
      },
      {
        question: "هل يمكنني تعديل إجابتي؟",
        answer: "نعم، يمكنك تعديل إجاباتك في أي وقت لتحسينها أو تحديثها بمعلومات جديدة."
      },
      {
        question: "ماذا أفعل إذا رأيت إجابة خاطئة؟",
        answer: "يمكنك التصويت بـ'غير مفيد' على الإجابة، أو كتابة إجابة بديلة أفضل، أو الإبلاغ عنها إذا كانت مخالفة."
      },
      {
        question: "كيف أحصل على إجابة لسؤالي بسرعة؟",
        answer: "اجعل سؤالك واضحاً ومفصلاً، استخدم وسوماً مناسبة، واختر الوقت المناسب للنشر عندما يكون المجتمع نشطاً."
      }
    ]
  },
  {
    id: "reputation",
    title: "النقاط والسمعة",
    icon: Trophy,
    faqs: [
      {
        question: "ما هي نقاط السمعة؟",
        answer: "نقاط السمعة هي مقياس لمساهماتك في المجتمع. تكسب نقاطاً عند طرح أسئلة جيدة، تقديم إجابات مفيدة، والحصول على تصويتات إيجابية."
      },
      {
        question: "كيف أكسب نقاط السمعة؟",
        answer: "+10 نقاط لكل تصويت على إجابتك، +5 نقاط لكل تصويت على سؤالك، +15 نقطة عند اختيار إجابتك كأفضل إجابة، +2 نقطة عند تصويتك على سؤال أو إجابة مفيدة."
      },
      {
        question: "ما فائدة نقاط السمعة؟",
        answer: "كلما زادت نقاطك، حصلت على صلاحيات أكثر مثل التعديل على منشورات الآخرين، الإشراف على المحتوى، والوصول لميزات حصرية."
      },
      {
        question: "ما هي الشارات والإنجازات？",
        answer: "الشارات هي جوائز تحصل عليها عند تحقيق إنجازات معينة، مثل 'مجيب سريع' عند الإجابة على سؤال خلال 15 دقيقة من نشره."
      },
      {
        question: "ما هي السلسلة (Streak)؟",
        answer: "السلسلة هي عدد الأيام المتتالية التي ساهمت فيها في المنصة. حافظ على نشاطك اليومي لبناء سلسلة قوية!"
      }
    ]
  },
  {
    id: "voting",
    title: "التصويت",
    icon: Heart,
    faqs: [
      {
        question: "كيف يعمل نظام التصويت؟",
        answer: "يمكنك التصويت بـ'مفيد' أو 'غير مفيد' على الأسئلة والإجابات. التصويتات تساعد في رفع المحتوى الجيد وإخفاء المحتوى الضعيف."
      },
      {
        question: "متى يجب أن أصوت بـ'مفيد'؟",
        answer: "صوّت بـ'مفيد' عندما يكون السؤال واضحاً ومفيداً، أو عندما تكون الإجابة دقيقة ومفصّلة وتحل المشكلة."
      },
      {
        question: "هل يمكنني تغيير تصويتي؟",
        answer: "نعم، يمكنك تغيير تصويتك في أي وقت بالضغط على السهم المعاكس."
      },
      {
        question: "لماذا لا يمكنني التصويت؟",
        answer: "يلزمك الحصول على 15 نقطة على الأقل للتصويت. هذا يضمن أن المصوتين لديهم فهم أساسي للمنصة."
      }
    ]
  },
  {
    id: "community",
    title: "المجتمع",
    icon: Users,
    faqs: [
      {
        question: "ما هي المساحات (Spaces)؟",
        answer: "المساحات هي مجتمعات متخصصة حول مواضيع معينة مثل 'البرمجة'، 'الذكاء الاصطناعي'، 'التصميم'. انضم للمساحات التي تهمك لمتابعة الأسئلة ذات الصلة."
      },
      {
        question: "كيف أصبح خبيراً معتمداً؟",
        answer: "الخبراء المعتمدون هم مستخدمون أثبتوا خبرتهم من خلال تقديم إجابات عالية الجودة بانتظام. تواصل مع فريق Khapeer للتقديم."
      },
      {
        question: "كيف أتابع مستخدماً آخر؟",
        answer: "يمكنك متابعة أي مستخدم من خلال الضغط على زر 'متابعة' في ملفه الشخصي. ستظهر لك تحديثات نشاطه في صفحتك الرئيسية."
      },
      {
        question: "كيف أبلغ عن محتوى مخالف؟",
        answer: "استخدم زر 'الإبلاغ' الموجود في كل منشور. سيتم مراجعة البلاغ من قبل فريق الإشراف في أسرع وقت."
      }
    ]
  },
  {
    id: "privacy",
    title: "الخصوصية والأمان",
    icon: Shield,
    faqs: [
      {
        question: "هل معلوماتي الشخصية آمنة؟",
        answer: "نعم، نحن نأخذ خصوصيتك على محمل الجد. لا نشارك معلوماتك الشخصية مع جهات خارجية، ويمكنك التحكم في ظهور معلوماتك من الإعدادات."
      },
      {
        question: "كيف أتحكم في خصوصيتي؟",
        answer: "من صفحة الإعدادات > الخصوصية، يمكنك التحكم في من يمكنه رؤية ملفك الشخصي، بريدك الإلكتروني، وموقعك."
      },
      {
        question: "كيف أحذف حسابي؟",
        answer: "يمكنك حذف حسابك من الإعدادات > الأمان > منطقة الخطر. لاحظ أن هذا الإجراء نهائي ولا يمكن التراجع عنه."
      },
      {
        question: "كيف أغير كلمة المرور؟",
        answer: "من الإعدادات > الأمان، يمكنك تغيير كلمة مرورك بإدخال كلمة المرور الحالية والجديدة."
      }
    ]
  }
];

const quickGuides = [
  {
    title: "كيفية طرح سؤال",
    steps: [
      "اضغط على زر '+' في الأسفل أو 'اطرح سؤالاً' في الأعلى",
      "اكتب عنواناً واضحاً ومحدداً لسؤالك",
      "أضف وصفاً مفصلاً مع الأمثلة إن أمكن",
      "اختر الوسوم المناسبة (حتى 5 وسوم)",
      "راجع سؤالك ثم اضغط 'نشر السؤال'"
    ],
    icon: MessageSquare,
    theme: "emerald"
  },
  {
    title: "كيفية الإجابة على سؤال",
    steps: [
      "ابحث عن الأسئلة في مجال خبرتك",
      "اقرأ السؤال بعناية وتأكد من فهمك له",
      "اكتب إجابة شاملة ومفيدة مع أمثلة",
      "أضف مصادر أو روابط لمعلومات إضافية",
      "راجع إجابتك واضغط 'نشر الإجابة'"
    ],
    icon: BookOpen,
    theme: "emerald"
  },
  {
    title: "كيفية بناء سمعتك",
    steps: [
      "قدم إجابات عالية الجودة ومفصّلة",
      "كن نشطاً بانتظام وحافظ على سلسلتك",
      "صوّت على المحتوى المفيد وساعد الآخرين",
      "انضم للمساحات في مجالات خبرتك",
      "احصل على الشارات والإنجازات"
    ],
    icon: Trophy,
    theme: "gold"
  }
];

export function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("getting-started");

  // Filter FAQs based on search
  const filteredFaqs = faqCategories.map(category => ({
    ...category,
    faqs: category.faqs.filter(faq =>
      faq.question.includes(searchQuery) || faq.answer.includes(searchQuery)
    )
  })).filter(category => category.faqs.length > 0);

  const currentCategory = searchQuery
    ? filteredFaqs[0]
    : faqCategories.find(c => c.id === activeCategory);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 100, damping: 15 } }
  };

  return (
    <div className="max-w-5xl w-full mx-auto relative z-10">
      <SEO
        title="مركز المساعدة"
        description="احصل على المساعدة والإجابات حول استخدام منصة خبير. دليل شامل للأسئلة الشائعة."
        canonical="/help"
        structuredData={breadcrumbSchema([
          { name: "الرئيسية", url: `${SITE_URL}/` },
          { name: "مركز المساعدة", url: `${SITE_URL}/help` },
        ])}
      />
      <div className="absolute top-12 left-1/4 w-72 h-72 rounded-full bg-primary/5 blur-[80px] pointer-events-none -z-10" />
      <div className="absolute bottom-20 right-1/4 w-80 h-80 rounded-full bg-secondary/4 blur-[100px] pointer-events-none -z-10" />

      {/* Header */}
      <div className="text-center mb-10 relative">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary via-primary to-secondary p-[1px] mb-5 shadow-primary/10 shadow-lg animate-float">
          <div className="w-full h-full bg-background rounded-[15px] flex items-center justify-center backdrop-blur-md">
            <HelpCircle className="h-9 w-9 text-primary" />
          </div>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold mb-3 tracking-tight">
          <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent filter drop-shadow-sm">
            مركز المعرفة والدعم
          </span>
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground max-w-lg mx-auto leading-relaxed">
          اكتشف الإرشادات، واقرأ الأسئلة الشائعة، أو تواصل مع الخبراء لتحقيق أقصى استفادة من منصتك المعرفية.
        </p>
      </div>

      {/* Search Bar Container */}
      <div className="max-w-2xl mx-auto mb-12 animate-fade-in">
        <div className="relative group premium-glass-card rounded-2xl p-1 border-border/60 hover:border-primary/30 input-glow transition-all duration-300">
          <Search className="absolute right-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            placeholder="ابحث عن سؤال، موضوع، أو إجابة تفصيلية..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-12 pl-4 h-14 text-base border-none bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 text-foreground placeholder:text-text-placeholder"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 bg-muted/40 hover:bg-muted/80 rounded-md numeral"
            >
              مسح
            </button>
          )}
        </div>
      </div>

      {/* Quick Guides Header */}
      <div className="flex items-center gap-2 mb-5">
        <Sparkles className="h-5 w-5 text-secondary animate-pulse-gold" />
        <h2 className="text-lg sm:text-xl font-bold">إرشادات الوصول السريع</h2>
      </div>

      {/* Quick Guides Grid */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12"
      >
        {quickGuides.map((guide, index) => {
          const Icon = guide.icon;
          const isGold = guide.theme === "gold";
          return (
            <motion.div
              key={index}
              variants={itemVariants}
              className={`rounded-2xl p-6 transition-all duration-300 ${
                isGold ? "premium-gold-card" : "premium-glass-card"
              }`}
            >
              <div className="flex items-center gap-3 mb-5">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 shadow-inner ${
                  isGold 
                    ? "bg-secondary/10 text-secondary border border-secondary/20" 
                    : "bg-primary/10 text-primary border border-primary/20"
                }`}>
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-sm sm:text-base text-foreground leading-tight">{guide.title}</h3>
              </div>
              
              <ol className="space-y-3.5">
                {guide.steps.map((step, i) => (
                  <li key={i} className="flex gap-3 text-xs sm:text-sm text-text-secondary leading-relaxed">
                    <span className={`flex-shrink-0 w-6 h-6 rounded-full text-[11px] sm:text-xs flex items-center justify-center font-bold numeral ${
                      isGold 
                        ? "bg-secondary/15 text-secondary shadow-sm shadow-secondary/5 border border-secondary/10" 
                        : "bg-primary/15 text-primary shadow-sm shadow-primary/5 border border-primary/10"
                    }`}>
                      {i + 1}
                    </span>
                    <span className="flex-1 pt-0.5">{step}</span>
                  </li>
                ))}
              </ol>
            </motion.div>
          );
        })}
      </motion.div>

      {/* FAQ Section Title */}
      <div className="flex items-center gap-2 mb-6">
        <QuestionIcon className="h-5 w-5 text-primary" />
        <h2 className="text-lg sm:text-xl font-bold">الأسئلة الشائعة وتفاصيل النظام</h2>
      </div>

      {/* FAQ Section */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Category Navigation (Shown only if not searching) */}
        {!searchQuery && (
          <div className="lg:col-span-1 lg:sticky lg:top-24">
            <Card className="p-3 premium-glass-card border-border/60 shadow-lg rounded-2xl">
              <h3 className="font-bold text-xs text-text-muted tracking-wider uppercase mb-3 px-3">تصنيفات الأسئلة</h3>
              <nav className="space-y-1">
                {faqCategories.map((category) => {
                  const Icon = category.icon;
                  const isActive = activeCategory === category.id;
                  return (
                    <button
                      key={category.id}
                      onClick={() => setActiveCategory(category.id)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all duration-300 text-right group touch-target ${
                        isActive
                          ? "bg-gradient-to-l from-primary/15 to-primary/5 text-primary border-r-2 border-primary font-bold shadow-sm shadow-primary/5"
                          : "hover:bg-muted/40 hover:pr-4 text-text-secondary hover:text-foreground"
                      }`}
                    >
                      <Icon className={`h-4.5 w-4.5 flex-shrink-0 transition-transform duration-300 ${
                        isActive ? "text-primary scale-110" : "text-muted-foreground group-hover:text-foreground"
                      }`} />
                      <span className="text-xs sm:text-sm font-medium flex-1 truncate">{category.title}</span>
                      <Badge 
                        variant="secondary" 
                        className={`mr-auto text-[10px] sm:text-xs h-5 px-2 rounded-md numeral font-bold ${
                          isActive 
                            ? "bg-primary/20 text-primary border border-primary/20" 
                            : "bg-muted/60 text-muted-foreground"
                        }`}
                      >
                        {category.faqs.length}
                      </Badge>
                    </button>
                  );
                })}
              </nav>
            </Card>
          </div>
        )}

        {/* FAQ Content Area */}
        <div className={searchQuery ? "lg:col-span-4 animate-fade-in" : "lg:col-span-3 animate-fade-in"}>
          {searchQuery && filteredFaqs.length === 0 ? (
            <Card className="p-14 text-center premium-glass-card rounded-2xl border-dashed border-border/60">
              <HelpCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-20 animate-pulse" />
              <h3 className="text-lg font-bold mb-1.5">لم نجد نتائج مطابقة لبحثك</h3>
              <p className="text-xs sm:text-sm text-text-muted mb-6 max-w-sm mx-auto leading-relaxed">
                تأكد من كتابة الكلمات بشكل صحيح، أو ابحث عن كلمة واحدة عامة، أو تصفح الأقسام الجانبية.
              </p>
              <Button variant="outline" onClick={() => setSearchQuery("")} className="rounded-xl touch-target hover:bg-muted border-border/80">
                عرض جميع تصنيفات المساعدة
              </Button>
            </Card>
          ) : (
            <div className="space-y-5">
              {(searchQuery ? filteredFaqs : [currentCategory!]).map((category) => (
                <div key={category.id} className="premium-glass-card p-5 sm:p-7 rounded-2xl border-border/50 shadow-md">
                  <div className="flex items-center gap-3 mb-5 border-b border-border/30 pb-4">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      <category.icon className="h-4.5 w-4.5" />
                    </div>
                    <h2 className="text-lg sm:text-xl font-extrabold text-foreground">{category.title}</h2>
                  </div>

                  <Accordion type="single" collapsible className="space-y-3">
                    {category.faqs.map((faq, index) => (
                      <AccordionItem
                        key={index}
                        value={`item-${index}`}
                        className="border border-border/40 rounded-xl overflow-hidden bg-card/20 hover:bg-card/40 hover:border-primary/10 transition-all duration-300"
                      >
                        <AccordionTrigger className="px-4.5 py-4 hover:no-underline hover:text-primary transition-all duration-200 text-right">
                          <span className="text-xs sm:text-sm font-bold text-text-primary leading-snug">
                            {faq.question}
                          </span>
                        </AccordionTrigger>
                        <AccordionContent className="px-4.5 pb-4 pt-1 text-xs sm:text-sm text-text-secondary leading-relaxed border-t border-border/20 bg-muted/10">
                          <p className="prose-arabic whitespace-pre-line">
                            {faq.answer}
                          </p>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Breathtaking Contact Support Callout */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="relative overflow-hidden p-6 sm:p-8 mt-12 rounded-2xl bg-gradient-to-l from-primary/15 via-background/40 to-secondary/10 border border-primary/20 shadow-lg"
      >
        {/* Shimmer sweep effect */}
        <div className="absolute inset-0 gold-shimmer-effect opacity-[0.06] pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-right flex-1 min-w-0">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-secondary p-[1px] shadow-md shadow-primary/5 flex-shrink-0 animate-pulse-ring">
              <div className="w-full h-full bg-background rounded-[15px] flex items-center justify-center">
                <MessageSquare className="h-6.5 w-6.5 text-primary" />
              </div>
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg mb-1 text-foreground leading-tight">ألم تجد إجابة وافية لاستفسارك؟</h3>
              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                لا تقلق! فريق دعم خبير جاهز على مدار الساعة لمساعدتك وحل جميع المشاكل التقنية أو التنظيمية.
              </p>
            </div>
          </div>
          <Button className="rounded-xl px-6 h-12 bg-primary hover:bg-primary-hover text-white shadow-md shadow-primary/20 touch-target w-full md:w-auto font-bold flex items-center gap-2 group transition-all duration-300 hover:scale-[1.03]">
            <ExternalLink className="h-4.5 w-4.5 group-hover:rotate-12 transition-transform" />
            <span>تواصل مباشر مع الدعم</span>
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
