import { useState } from "react";
import { useNavigate } from "react-router";
import { useAppState } from "../context/AppStateContext";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import {
  ArrowRight, ArrowLeft, Upload, MapPin, X, HelpCircle, Tags,
  Image as ImageIcon, Link2, Plus, Trash2, Map, Globe
} from "lucide-react";
import { QuestionCard } from "../components/question-card";
import { toast } from "sonner";
import { AttachmentLink, AttachmentLocation } from "../data/mock-data";

export function NewQuestionPage() {
  const navigate = useNavigate();
  const { addQuestion } = useAppState();
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [location, setLocation] = useState("");

  // Advanced attachments states
  const [attachmentTab, setAttachmentTab] = useState<"images" | "location" | "links">("images");
  const [images, setImages] = useState<string[]>([]);
  const [links, setLinks] = useState<AttachmentLink[]>([]);
  const [locationDetail, setLocationDetail] = useState<AttachmentLocation | undefined>(undefined);

  // Attachment inputs
  const [linkTitle, setLinkTitle] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [locName, setLocName] = useState("");
  const [locAddress, setLocAddress] = useState("");
  const [locLat, setLocLat] = useState("");
  const [locLng, setLocLng] = useState("");

  const handleAddTag = () => {
    if (tagInput.trim() && tags.length < 5 && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleAddPresetImage = (url: string) => {
    if (images.length >= 6) {
      toast.error("يمكنك إرفاق 6 صور كحد أقصى");
      return;
    }
    if (images.includes(url)) {
      toast.error("هذه الصورة مضافة بالفعل");
      return;
    }
    setImages([...images, url]);
    toast.success("تم إرفاق الصورة بنجاح");
  };

  const handleAddCustomImage = () => {
    if (images.length >= 6) {
      toast.error("يمكنك إرفاق 6 صور كحد أقصى");
      return;
    }
    const randomId = Math.floor(Math.random() * 1000);
    const mockImageUrl = `https://images.unsplash.com/photo-${randomId % 2 === 0 ? "1517248135467-4c7edcad34c4" : "1498050108023-c5249f4df085"}?w=600&auto=format&fit=crop&q=80`;
    setImages([...images, mockImageUrl]);
    toast.success("تمت محاكاة رفع الصورة بنجاح");
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleAddLink = () => {
    if (!linkTitle.trim() || !linkUrl.trim()) {
      toast.error("يرجى ملء جميع حقول الرابط");
      return;
    }
    if (!linkUrl.startsWith("http://") && !linkUrl.startsWith("https://")) {
      toast.error("يجب أن يبدأ الرابط بـ http:// أو https://");
      return;
    }
    const newLink: AttachmentLink = { title: linkTitle.trim(), url: linkUrl.trim() };
    setLinks([...links, newLink]);
    setLinkTitle("");
    setLinkUrl("");
    toast.success("تم إضافة الرابط المرجعي");
  };

  const handleRemoveLink = (index: number) => {
    setLinks(links.filter((_, i) => i !== index));
  };

  const handleSaveLocationDetail = () => {
    if (!locName.trim()) {
      toast.error("يرجى إدخال اسم الموقع");
      return;
    }
    const newLoc: AttachmentLocation = {
      name: locName.trim(),
      address: locAddress.trim() || undefined,
      lat: locLat ? parseFloat(locLat) : undefined,
      lng: locLng ? parseFloat(locLng) : undefined
    };
    setLocationDetail(newLoc);
    // Auto sync simple location string
    if (!location) {
      setLocation(locName.trim());
    }
    toast.success("تم تثبيت الموقع الجغرافي بنجاح");
  };

  const handleClearLocationDetail = () => {
    setLocationDetail(undefined);
    setLocName("");
    setLocAddress("");
    setLocLat("");
    setLocLng("");
    toast.success("تم إزالة الموقع الجغرافي المخصص");
  };

  const handlePresetLocation = (name: string, address: string, lat: number, lng: number) => {
    const preset: AttachmentLocation = { name, address, lat, lng };
    setLocationDetail(preset);
    setLocation(name);
    setLocName(name);
    setLocAddress(address);
    setLocLat(lat.toString());
    setLocLng(lng.toString());
    toast.success(`تم اختيار موقع مسبق: ${name}`);
  };

  const handlePublish = () => {
    const newId = addQuestion(title, description, tags, location, images, links, locationDetail);
    toast.success("تم نشر سؤالك بنجاح!");
    navigate(`/questions/${newId}`);
  };

  const canProceedStep1 = title.length >= 15 && description.length >= 20;
  const canProceedStep2 = category && tags.length >= 2;

  // Preset elegant images list for mock use
  const presetImages = [
    { label: "موقع عمل أو شركة", url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&auto=format&fit=crop&q=60" },
    { label: "مطعم أو مقهى متميز", url: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&auto=format&fit=crop&q=60" },
    { label: "عيادة طبية أو مشفى", url: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400&auto=format&fit=crop&q=60" },
    { label: "نشاط ترفيهي أو رحلة", url: "https://images.unsplash.com/photo-1530521954074-e64f6810b32d?w=400&auto=format&fit=crop&q=60" }
  ];

  return (
    <div className="max-w-3xl w-full mx-auto pb-4 animate-fade-in">
      {/* Header */}
      <div className="mb-6 relative">
        <Button
          variant="ghost"
          className="mb-3 -mr-2 rounded-xl h-9 text-sm font-semibold hover:bg-primary/10 hover:text-primary transition-colors"
          onClick={() => navigate("/")}
        >
          <ArrowRight className="h-4 w-4 ml-2" />
          العودة للرئيسية
        </Button>
        <h1 className="text-xl sm:text-2xl font-heading font-extrabold mb-1.5 text-foreground">اطرح سؤالاً جديداً</h1>
        <p className="text-muted-foreground text-xs sm:text-sm">
          شارك استفسارك مع نخبة الخبراء واحصل على إجابات علمية موثوقة وعملية
        </p>
      </div>

      {/* Wizard Steps - Clean Solid Colors Only */}
      <div className="flex items-center justify-between mb-8 bg-glass-bg/15 backdrop-blur-md border border-border/30 rounded-2xl p-4 sm:p-5 relative overflow-hidden max-w-md mx-auto shadow-md">
        <div className="absolute inset-0 opacity-[0.02] bg-[radial-gradient(var(--primary)_1px,transparent_1px)] [background-size:12px_12px] pointer-events-none" />
        {[1, 2, 3, 4].map((s, index) => (
          <div key={s} className="flex items-center flex-1 last:flex-none">
            <div
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center font-heading font-extrabold transition-all duration-300 text-sm sm:text-base border cursor-default shadow-sm ${
                s === step
                  ? "bg-primary text-primary-foreground border-primary"
                  : s < step
                  ? "bg-secondary/15 text-secondary-hover border-secondary/35"
                  : "bg-muted/40 text-muted-foreground border-border/40"
              }`}
            >
              {s}
            </div>
            {index < 3 && (
              <div
                className={`h-0.5 flex-1 mx-2 sm:mx-4 rounded-full transition-all duration-300 ${
                  s < step ? "bg-primary" : "bg-border/35"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Title & Description */}
      {step === 1 && (
        <div className="premium-glass-card p-5 sm:p-7 rounded-3xl border border-border/20 shadow-xl relative overflow-hidden">
          <div className="absolute inset-0 opacity-5 arabic-geometric-mesh-fine pointer-events-none" />
          
          <div className="space-y-4 sm:space-y-6 relative">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-xs sm:text-sm font-bold text-foreground">عنوان السؤال</Label>
              <div className="relative input-glow rounded-xl">
                <Input
                  id="title"
                  placeholder="اكتب سؤالك بشكل واضح ومباشر..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-input-background h-11 text-sm sm:text-base rounded-xl border border-border/40 focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary px-3"
                  maxLength={150}
                />
              </div>
              <p className="text-[10px] text-muted-foreground text-left font-medium">
                {title.length}/150 حرف (الحد الأدنى 15 حرفاً)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-xs sm:text-sm font-bold text-foreground">التفاصيل والشرح</Label>
              <div className="relative input-glow rounded-xl">
                <Textarea
                  id="description"
                  placeholder="قدم تفاصيل أكثر حول سؤالك... أضف السياق والمعلومات التقنية أو العلمية أو المكانية التي تساعد الخبراء في صياغة إجابة دقيقة وموثوقة."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="bg-input-background min-h-[220px] rounded-xl border border-border/40 focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary p-3 text-sm sm:text-base leading-relaxed"
                  maxLength={3000}
                />
              </div>
              <p className="text-[10px] text-muted-foreground text-left font-medium">
                {description.length}/3000 حرف (الحد الأدنى 20 حرفاً)
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                onClick={() => setStep(2)}
                disabled={!canProceedStep1}
                className="rounded-xl h-10 px-5 text-sm font-semibold transition-all text-white bg-primary hover:bg-primary-hover disabled:opacity-50"
              >
                التالي
                <ArrowLeft className="h-4 w-4 mr-2" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Category & Tags */}
      {step === 2 && (
        <div className="premium-glass-card p-5 sm:p-7 rounded-3xl border border-border/20 shadow-xl relative overflow-hidden">
          <div className="absolute inset-0 opacity-5 arabic-geometric-mesh-fine pointer-events-none" />
          
          <div className="space-y-5 sm:space-y-6 relative">
            <div className="space-y-2">
              <Label htmlFor="category" className="text-xs sm:text-sm font-bold text-foreground">التصنيف الرئيسي</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="bg-input-background h-11 border border-border/40 rounded-xl focus:ring-primary">
                  <SelectValue placeholder="اختر التصنيف العلمي أو العملي المناسب" />
                </SelectTrigger>
                <SelectContent className="bg-popover border border-border/30 rounded-xl">
                  <SelectItem value="tech">تقنية وبرمجيات</SelectItem>
                  <SelectItem value="education">تعليم وأكاديميا</SelectItem>
                  <SelectItem value="health">صحة وطب وعيادات</SelectItem>
                  <SelectItem value="business">ريادة أعمال ومحلات تجارية</SelectItem>
                  <SelectItem value="science">علوم وبحوث ونشاطات</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags" className="text-xs sm:text-sm font-bold text-foreground">الوسوم (العلامات)</Label>
              <div className="flex gap-2">
                <div className="relative input-glow rounded-xl flex-1">
                  <Input
                    id="tags"
                    placeholder="مثال: مطاعم, عيادات, رياضة, طبيب..."
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    className="bg-input-background h-11 rounded-xl border border-border/40 focus-visible:ring-primary px-3"
                  />
                </div>
                <Button 
                  type="button" 
                  onClick={handleAddTag} 
                  disabled={tags.length >= 5 || !tagInput.trim()}
                  className="rounded-xl h-11 px-4 text-xs sm:text-sm font-semibold bg-primary hover:bg-primary-hover text-white transition-all disabled:opacity-50"
                >
                  إضافة
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-2 mt-3 min-h-[40px] p-2 bg-muted/20 border border-border/10 rounded-xl">
                {tags.length === 0 ? (
                  <span className="text-xs text-muted-foreground/60 pr-1 flex items-center gap-1.5 h-6">
                    <Tags className="h-3.5 w-3.5" />
                    الوسوم المضافة ستظهر هنا
                  </span>
                ) : (
                  tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="rounded-full px-3 py-1 bg-primary/10 border border-primary/20 text-primary hover:border-destructive/30 hover:bg-destructive/5 group transition-colors"
                    >
                      {tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="mr-2 text-primary group-hover:text-destructive transition-colors focus:outline-none"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))
                )}
              </div>
              <p className="text-[10px] text-muted-foreground font-medium">
                {tags.length}/5 وسوم مضافة (الحد الأدنى وسمين اثنين)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location" className="text-xs sm:text-sm font-bold text-foreground">المدينة أو الدولة العامة (اختياري)</Label>
              <div className="flex gap-2">
                <div className="relative input-glow rounded-xl flex-1">
                  <Input
                    id="location"
                    placeholder="مثال: الرياض، جدة، القاهرة..."
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="bg-input-background h-11 rounded-xl border border-border/40 focus-visible:ring-primary px-3"
                  />
                </div>
                <Button type="button" variant="outline" className="rounded-xl h-11 border border-border/40 hover:bg-muted/40">
                  <MapPin className="h-4 w-4 text-primary" />
                </Button>
              </div>
            </div>

            <div className="flex justify-between pt-3">
              <Button 
                variant="outline" 
                onClick={() => setStep(1)}
                className="rounded-xl h-10 px-4 text-xs sm:text-sm font-semibold hover:bg-muted/40"
              >
                <ArrowRight className="h-4 w-4 ml-2" />
                السابق
              </Button>
              <Button
                onClick={() => setStep(3)}
                disabled={!canProceedStep2}
                className="rounded-xl h-10 px-5 text-sm font-semibold text-white bg-primary hover:bg-primary-hover disabled:opacity-50"
              >
                التالي (المرفقات)
                <ArrowLeft className="h-4 w-4 mr-2" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Advanced Attachments Dashboard */}
      {step === 3 && (
        <div className="premium-glass-card p-5 sm:p-7 rounded-3xl border border-border/20 shadow-xl relative overflow-hidden">
          <div className="absolute inset-0 opacity-5 arabic-geometric-mesh-fine pointer-events-none" />
          
          <div className="space-y-5 sm:space-y-6 relative">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-foreground mb-1">لوحة المرفقات المتقدمة</h3>
              <p className="text-xs text-muted-foreground">
                يمكنك إرفاق صور توضيحية، مواقع جغرافية محددة على الخريطة، وروابط مرجعية لتوثيق سؤالك.
              </p>
            </div>

            {/* Dashboard Tabs - Pure Solid Styles */}
            <div className="grid grid-cols-3 gap-2 bg-muted/30 p-1 rounded-xl border border-border/30">
              <button
                type="button"
                onClick={() => setAttachmentTab("images")}
                className={`py-2 px-1 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                  attachmentTab === "images"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted/50"
                }`}
              >
                <ImageIcon className="h-3.5 w-3.5" />
                الصور ({images.length})
              </button>
              <button
                type="button"
                onClick={() => setAttachmentTab("location")}
                className={`py-2 px-1 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                  attachmentTab === "location"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted/50"
                }`}
              >
                <MapPin className="h-3.5 w-3.5" />
                موقع جغرافي
              </button>
              <button
                type="button"
                onClick={() => setAttachmentTab("links")}
                className={`py-2 px-1 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                  attachmentTab === "links"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted/50"
                }`}
              >
                <Link2 className="h-3.5 w-3.5" />
                روابط ({links.length})
              </button>
            </div>

            {/* Tab Contents */}
            <div className="bg-glass-bg/5 p-4 rounded-2xl border border-border/10 min-h-[220px]">
              
              {/* IMAGES TAB */}
              {attachmentTab === "images" && (
                <div className="space-y-4">
                  <div className="flex flex-col gap-2">
                    <Label className="text-xs font-bold">إرفاق صور توضيحية للمشكلة أو المكان</Label>
                    <p className="text-[11px] text-muted-foreground">
                      يمكنك محاكاة رفع صورة من جهازك، أو اختيار قوالب صور جاهزة تمثل جهات مختلفة.
                    </p>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAddCustomImage}
                      className="rounded-xl h-10 border border-primary/20 text-primary hover:bg-primary/5 text-xs font-bold"
                    >
                      <Upload className="h-4 w-4 ml-1.5" />
                      محاكاة رفع صورة مخصصة
                    </Button>
                  </div>

                  {/* Preset Images Grid */}
                  <div>
                    <span className="text-[10px] text-muted-foreground font-bold block mb-2">صور جاهزة للاستخدام:</span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {presetImages.map((p, i) => (
                        <div
                          key={i}
                          onClick={() => handleAddPresetImage(p.url)}
                          className="group relative h-20 rounded-xl overflow-hidden cursor-pointer border border-border/30 hover:border-primary/60 transition-all shadow-sm"
                        >
                          <img src={p.url} alt={p.label} className="w-full h-full object-cover group-hover:scale-105 transition-all" />
                          <div className="absolute inset-0 bg-black/60 flex items-end p-1.5">
                            <span className="text-[9px] font-bold text-white leading-tight">{p.label}</span>
                          </div>
                          <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-primary flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Plus className="h-3 w-3 text-white" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Uploaded Gallery Preview */}
                  {images.length > 0 && (
                    <div className="pt-2">
                      <span className="text-[11px] font-bold text-foreground block mb-2">الصور المرفقة حالياً ({images.length}/6):</span>
                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                        {images.map((img, idx) => (
                          <div key={idx} className="group relative h-16 rounded-lg overflow-hidden border border-primary/20">
                            <img src={img} className="w-full h-full object-cover" alt="Attached" />
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(idx)}
                              className="absolute top-1 right-1 bg-destructive/90 text-white rounded-md p-0.5 hover:bg-destructive transition-colors opacity-0 group-hover:opacity-100"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* LOCATION TAB */}
              {attachmentTab === "location" && (
                <div className="space-y-4">
                  <div className="flex flex-col gap-1">
                    <Label className="text-xs font-bold">تحديد موقع جغرافي دقيق</Label>
                    <p className="text-[11px] text-muted-foreground">
                      اربط هذا السؤال بموقع محدد (مطعم، مستشفى، جهة حكومية، إلخ) ليسهل على الخبراء تقديم المشورة المناسبة.
                    </p>
                  </div>

                  {/* Preset Locations */}
                  <div>
                    <span className="text-[10px] text-muted-foreground font-bold block mb-1.5">مواقع مقترحة سريعة:</span>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        onClick={() => handlePresetLocation("مطعم المذاق العربي", "شارع التحلية، الرياض", 24.7136, 46.6753)}
                        className="text-[10px] font-semibold bg-muted/40 hover:bg-muted border border-border/40 px-2 py-1 rounded-lg flex items-center gap-1"
                      >
                        <MapPin className="h-3 w-3 text-secondary" />
                        مطعم المذاق العربي (الرياض)
                      </button>
                      <button
                        type="button"
                        onClick={() => handlePresetLocation("عيادة د. فهد لطب الأسنان", "طريق الملك، جدة", 21.5433, 39.1728)}
                        className="text-[10px] font-semibold bg-muted/40 hover:bg-muted border border-border/40 px-2 py-1 rounded-lg flex items-center gap-1"
                      >
                        <MapPin className="h-3 w-3 text-primary" />
                        عيادة د. فهد (جدة)
                      </button>
                      <button
                        type="button"
                        onClick={() => handlePresetLocation("سينما ريل الرياض", "رياض بارك مول، الرياض", 24.7743, 46.6372)}
                        className="text-[10px] font-semibold bg-muted/40 hover:bg-muted border border-border/40 px-2 py-1 rounded-lg flex items-center gap-1"
                      >
                        <MapPin className="h-3 w-3 text-primary" />
                        سينما ريل الرياض
                      </button>
                    </div>
                  </div>

                  {/* Custom Location Inputs */}
                  <div className="border-t border-border/20 pt-3">
                    <span className="text-[10px] text-muted-foreground font-bold block mb-2">أو أدخل بيانات الموقع يدوياً:</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                      <div className="space-y-1">
                        <Label htmlFor="locName" className="text-[10px]">اسم المنشأة / المكان</Label>
                        <Input
                          id="locName"
                          placeholder="مثال: مطعم السرايا التركي"
                          value={locName}
                          onChange={(e) => setLocName(e.target.value)}
                          className="h-9 text-xs rounded-lg border-border/50 bg-background/20"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="locAddress" className="text-[10px]">العنوان بالتفصيل</Label>
                        <Input
                          id="locAddress"
                          placeholder="مثال: طريق الملك فهد، حي المروج"
                          value={locAddress}
                          onChange={(e) => setLocAddress(e.target.value)}
                          className="h-9 text-xs rounded-lg border-border/50 bg-background/20"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div className="space-y-1">
                        <Label htmlFor="locLat" className="text-[10px]">خط العرض (اختياري)</Label>
                        <Input
                          id="locLat"
                          placeholder="24.7136"
                          value={locLat}
                          onChange={(e) => setLocLat(e.target.value)}
                          className="h-9 text-xs rounded-lg border-border/50 bg-background/20 text-left"
                          dir="ltr"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="locLng" className="text-[10px]">خط الطول (اختياري)</Label>
                        <Input
                          id="locLng"
                          placeholder="46.6753"
                          value={locLng}
                          onChange={(e) => setLocLng(e.target.value)}
                          className="h-9 text-xs rounded-lg border-border/50 bg-background/20 text-left"
                          dir="ltr"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        type="button"
                        onClick={handleSaveLocationDetail}
                        className="bg-primary hover:bg-primary-hover text-white text-xs h-9 rounded-lg"
                      >
                        تثبيت الموقع الجغرافي
                      </Button>
                      {locationDetail && (
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={handleClearLocationDetail}
                          className="text-destructive hover:bg-destructive/5 text-xs h-9 rounded-lg"
                        >
                          حذف الموقع المثبت
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Render Mock Map Pin */}
                  {locationDetail && (
                    <div className="mt-3 p-3 bg-card border border-primary/20 rounded-xl flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Map className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[11px] font-bold text-foreground block truncate">{locationDetail.name}</span>
                        {locationDetail.address && (
                          <span className="text-[9px] text-muted-foreground block truncate">{locationDetail.address}</span>
                        )}
                        {locationDetail.lat && (
                          <span className="text-[8px] text-muted-foreground font-numbers block">
                            (خط عرض: {locationDetail.lat} · خط طول: {locationDetail.lng})
                          </span>
                        )}
                      </div>
                      <Badge className="bg-primary/20 text-primary border border-primary/30 text-[9px] rounded-lg">
                        مثبت بنجاح
                      </Badge>
                    </div>
                  )}
                </div>
              )}

              {/* LINKS TAB */}
              {attachmentTab === "links" && (
                <div className="space-y-4">
                  <div className="flex flex-col gap-1">
                    <Label className="text-xs font-bold">إضافة روابط مرجعية ومصادر</Label>
                    <p className="text-[11px] text-muted-foreground">
                      أضف روابط خارجية هامة مثل تقارير طبية، بحوث، مواقع الكترونية رسمية أو صفحات التواصل.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2">
                    <div className="space-y-1">
                      <Label htmlFor="linkTitle" className="text-[10px]">عنوان الرابط (الوصف)</Label>
                      <Input
                        id="linkTitle"
                        placeholder="مثال: الدراسة الطبية الكاملة"
                        value={linkTitle}
                        onChange={(e) => setLinkTitle(e.target.value)}
                        className="h-9 text-xs rounded-lg border-border/50 bg-background/20"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="linkUrl" className="text-[10px]">الرابط الإلكتروني الكامل (URL)</Label>
                      <Input
                        id="linkUrl"
                        placeholder="https://example.com/report"
                        value={linkUrl}
                        onChange={(e) => setLinkUrl(e.target.value)}
                        className="h-9 text-xs rounded-lg border-border/50 bg-background/20 text-left"
                        dir="ltr"
                      />
                    </div>
                  </div>

                  <Button
                    type="button"
                    onClick={handleAddLink}
                    className="bg-primary hover:bg-primary-hover text-white text-xs h-9 rounded-lg"
                  >
                    إضافة الرابط لقائمة المصادر
                  </Button>

                  {/* Added Links List */}
                  {links.length > 0 && (
                    <div className="pt-2 space-y-1.5">
                      <span className="text-[11px] font-bold text-foreground block">الروابط المرفقة ({links.length}):</span>
                      <div className="grid grid-cols-1 gap-1.5">
                        {links.map((link, idx) => (
                          <div key={idx} className="flex items-center justify-between p-2 bg-card border border-border/30 rounded-lg">
                            <div className="flex items-center gap-2 min-w-0">
                              <Globe className="h-3.5 w-3.5 text-primary shrink-0" />
                              <span className="text-xs font-semibold text-foreground truncate">{link.title}</span>
                              <span className="text-[10px] text-muted-foreground truncate hidden sm:inline">({link.url})</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveLink(idx)}
                              className="text-destructive hover:bg-destructive/5 rounded p-1 transition-colors"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-between pt-3">
              <Button 
                variant="outline" 
                onClick={() => setStep(2)}
                className="rounded-xl h-10 px-4 text-xs sm:text-sm font-semibold hover:bg-muted/40"
              >
                <ArrowRight className="h-4 w-4 ml-2" />
                السابق
              </Button>
              <Button 
                onClick={() => setStep(4)} 
                className="rounded-xl h-10 px-5 text-sm font-semibold text-white bg-primary hover:bg-primary-hover"
              >
                التالي (المعاينة والنشر)
                <ArrowLeft className="h-4 w-4 mr-2" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Preview */}
      {step === 4 && (
        <div className="space-y-6">
          <div className="premium-glass-card p-5 sm:p-6 rounded-3xl border border-border/20 shadow-xl relative overflow-hidden">
            <div className="absolute inset-0 opacity-5 arabic-geometric-mesh-fine pointer-events-none" />
            
            <h2 className="font-heading font-bold text-base sm:text-lg mb-4 text-foreground flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-primary animate-pulse" />
              معاينة سؤالك قبل النشر الرسمي
            </h2>
            
            <div className="border border-border/10 rounded-2xl overflow-hidden p-1 bg-glass-bg/5">
              <QuestionCard
                id="preview"
                title={title}
                description={description}
                author={{ name: "أنت", avatar: "", reputation: 0 }}
                votes={0}
                answers={0}
                tags={tags}
                location={location}
                timestamp="الآن"
              />
            </div>

            {/* Preview Attachments detail specifically */}
            {(images.length > 0 || locationDetail || links.length > 0) && (
              <div className="mt-4 p-4 border border-border/30 bg-muted/10 rounded-2xl space-y-3">
                <span className="text-xs font-bold text-foreground block">مرفقات هذا السؤال:</span>
                
                {images.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] text-muted-foreground font-bold block">الصور ({images.length}):</span>
                    <div className="flex gap-1.5 flex-wrap">
                      {images.map((img, i) => (
                        <img key={i} src={img} className="w-12 h-12 object-cover rounded-lg border border-border" alt="attached preview" />
                      ))}
                    </div>
                  </div>
                )}

                {locationDetail && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] text-muted-foreground font-bold block">الموقع الجغرافي:</span>
                    <div className="text-xs flex items-center gap-1.5 text-primary font-semibold">
                      <MapPin className="h-3.5 w-3.5" />
                      {locationDetail.name} {locationDetail.address ? `(${locationDetail.address})` : ""}
                    </div>
                  </div>
                )}

                {links.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] text-muted-foreground font-bold block">الروابط والمراجع ({links.length}):</span>
                    <div className="flex flex-wrap gap-1.5">
                      {links.map((lnk, i) => (
                        <div key={i} className="text-xs bg-card border border-border/40 px-2 py-0.5 rounded-lg flex items-center gap-1">
                          <Globe className="h-3 w-3 text-primary" />
                          <span className="font-medium text-foreground">{lnk.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-between items-center gap-3 flex-wrap">
            <Button 
              variant="outline" 
              onClick={() => setStep(3)}
              className="rounded-xl h-10 px-4 text-xs sm:text-sm font-semibold hover:bg-muted/40"
            >
              <ArrowRight className="h-4 w-4 ml-2" />
              تعديل المرفقات
            </Button>
            
            <div className="flex gap-2.5">
              <Button 
                variant="outline" 
                onClick={handlePublish}
                className="rounded-xl h-10 px-4 text-xs sm:text-sm font-semibold hover:bg-muted/30"
              >
                حفظ كمسودة
              </Button>
              <Button 
                onClick={handlePublish} 
                className="rounded-xl h-10 px-5 text-sm font-semibold text-white bg-secondary hover:bg-secondary-hover shadow-[0_4px_15px_rgba(245,158,11,0.25)]"
              >
                تأكيد ونشر السؤال
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
