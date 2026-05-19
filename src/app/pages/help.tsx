import { useState } from "react";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
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
  Award,
  ChevronLeft,
  ExternalLink
} from "lucide-react";

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
    icon: MessageSquare,
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
        question: "ما هي الشارات والإنجازات؟",
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
    icon: MessageSquare
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
    icon: BookOpen
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
    icon: Trophy
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

  return (
    <div className="container mx-auto px-4 py-6 max-w-5xl animate-fade-in">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary mb-4 shadow-lg">
          <HelpCircle className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold mb-2">مركز المساعدة</h1>
        <p className="text-muted-foreground">كل ما تحتاج معرفته عن Khapeer</p>
      </div>

      {/* Search */}
      <div className="max-w-2xl mx-auto mb-8">
        <div className="relative">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="ابحث عن إجابة..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-12 h-14 text-base rounded-2xl bg-card shadow-sm"
          />
        </div>
      </div>

      {/* Quick Guides */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {quickGuides.map((guide, index) => {
          const Icon = guide.icon;
          return (
            <Card key={index} className="p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-sm">{guide.title}</h3>
              </div>
              <ol className="space-y-2">
                {guide.steps.map((step, i) => (
                  <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-semibold">
                      {i + 1}
                    </span>
                    <span className="leading-relaxed">{step}</span>
                  </li>
                ))}
              </ol>
            </Card>
          );
        })}
      </div>

      {/* FAQ Section */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Category Navigation */}
        {!searchQuery && (
          <div className="lg:col-span-1">
            <Card className="p-3 sticky top-20">
              <h3 className="font-semibold mb-2 px-2">الفئات</h3>
              <nav className="space-y-1">
                {faqCategories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <button
                      key={category.id}
                      onClick={() => setActiveCategory(category.id)}
                      className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg transition-colors text-right ${
                        activeCategory === category.id
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-accent"
                      }`}
                    >
                      <Icon className="h-4 w-4 flex-shrink-0" />
                      <span className="text-sm">{category.title}</span>
                      <Badge variant="secondary" className="mr-auto text-xs h-5">
                        {category.faqs.length}
                      </Badge>
                    </button>
                  );
                })}
              </nav>
            </Card>
          </div>
        )}

        {/* FAQ Content */}
        <div className={searchQuery ? "lg:col-span-4" : "lg:col-span-3"}>
          {searchQuery && filteredFaqs.length === 0 ? (
            <Card className="p-12 text-center">
              <HelpCircle className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-30" />
              <p className="text-muted-foreground mb-4">لم نجد نتائج لبحثك</p>
              <Button variant="outline" onClick={() => setSearchQuery("")}>
                عرض جميع الأسئلة
              </Button>
            </Card>
          ) : (
            <div className="space-y-4">
              {(searchQuery ? filteredFaqs : [currentCategory!]).map((category) => (
                <Card key={category.id} className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <category.icon className="h-5 w-5 text-primary" />
                    <h2 className="text-xl font-bold">{category.title}</h2>
                  </div>

                  <Accordion type="single" collapsible className="space-y-2">
                    {category.faqs.map((faq, index) => (
                      <AccordionItem
                        key={index}
                        value={`item-${index}`}
                        className="border border-border rounded-xl overflow-hidden"
                      >
                        <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-accent/50 transition-colors">
                          <span className="text-right font-semibold text-sm">
                            {faq.question}
                          </span>
                        </AccordionTrigger>
                        <AccordionContent className="px-4 pb-4">
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {faq.answer}
                          </p>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Contact Support */}
      <Card className="p-6 mt-8 bg-gradient-to-l from-primary/5 to-secondary/5 border-primary/20">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <MessageSquare className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">لم تجد إجابة لسؤالك؟</h3>
              <p className="text-sm text-muted-foreground">
                فريق الدعم جاهز لمساعدتك
              </p>
            </div>
          </div>
          <Button className="rounded-xl">
            <ExternalLink className="h-4 w-4 ml-2" />
            تواصل مع الدعم
          </Button>
        </div>
      </Card>
    </div>
  );
}
