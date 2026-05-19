import { useState } from "react";
import { useNavigate } from "react-router";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { ArrowRight, ArrowLeft, Upload, MapPin, X } from "lucide-react";
import { QuestionCard } from "../components/question-card";

export function NewQuestionPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [location, setLocation] = useState("");

  const handleAddTag = () => {
    if (tagInput.trim() && tags.length < 5 && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handlePublish = () => {
    // Mock publish - redirect to question detail
    navigate("/questions/1");
  };

  const canProceedStep1 = title.length >= 15 && description.length >= 20;
  const canProceedStep2 = category && tags.length >= 2;

  return (
    <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 max-w-4xl pb-20 sm:pb-8">
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <Button
          variant="ghost"
          className="mb-3 sm:mb-4 -mr-2 rounded-xl h-9 text-sm"
          onClick={() => navigate("/")}
        >
          <ArrowRight className="h-4 w-4 ml-2" />
          العودة
        </Button>
        <h1 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">اطرح سؤالاً جديداً</h1>
        <p className="text-muted-foreground text-sm">
          شارك معرفتك واحصل على إجابات من المجتمع
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-6 sm:mb-8">
        {[1, 2, 3, 4].map((s, index) => (
          <div key={s} className="flex items-center">
            <div
              className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-semibold transition-all text-sm sm:text-base ${
                s === step
                  ? "bg-primary text-primary-foreground"
                  : s < step
                  ? "bg-secondary text-secondary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {s}
            </div>
            {index < 3 && (
              <div
                className={`h-1 w-8 sm:w-16 transition-all ${
                  s < step ? "bg-secondary" : "bg-muted"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Title & Description */}
      {step === 1 && (
        <Card className="p-4 sm:p-6">
          <div className="space-y-4 sm:space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm">عنوان السؤال</Label>
              <Input
                id="title"
                placeholder="اكتب سؤالك بشكل واضح ومباشر..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-input-background h-11 text-sm sm:text-base"
                maxLength={150}
              />
              <p className="text-xs text-muted-foreground text-left">
                {title.length}/150 حرف (الحد الأدنى 15)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">التفاصيل</Label>
              <Textarea
                id="description"
                placeholder="قدم تفاصيل أكثر حول سؤالك... أضف السياق والمعلومات التي قد تساعد في الحصول على إجابة أفضل."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-input-background min-h-[200px]"
                maxLength={3000}
              />
              <p className="text-xs text-muted-foreground text-left">
                {description.length}/3000 حرف (الحد الأدنى 20)
              </p>
            </div>

            <div className="flex justify-end">
              <Button
                onClick={() => setStep(2)}
                disabled={!canProceedStep1}
                className="rounded-lg"
              >
                التالي
                <ArrowLeft className="h-4 w-4 mr-2" />
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Step 2: Category & Tags */}
      {step === 2 && (
        <Card className="p-6">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="category">التصنيف</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="bg-input-background">
                  <SelectValue placeholder="اختر التصنيف المناسب" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tech">تقنية</SelectItem>
                  <SelectItem value="education">تعليم</SelectItem>
                  <SelectItem value="health">صحة</SelectItem>
                  <SelectItem value="business">أعمال</SelectItem>
                  <SelectItem value="science">علوم</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">الوسوم</Label>
              <div className="flex gap-2">
                <Input
                  id="tags"
                  placeholder="أضف وسماً..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  className="bg-input-background"
                />
                <Button type="button" onClick={handleAddTag} disabled={tags.length >= 5}>
                  إضافة
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="rounded-full px-3 py-1.5"
                  >
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="mr-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                {tags.length}/5 وسوم (الحد الأدنى 2)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">الموقع (اختياري)</Label>
              <div className="flex gap-2">
                <Input
                  id="location"
                  placeholder="مثال: الرياض، جدة..."
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="bg-input-background"
                />
                <Button type="button" variant="outline">
                  <MapPin className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>
                <ArrowRight className="h-4 w-4 ml-2" />
                السابق
              </Button>
              <Button
                onClick={() => setStep(3)}
                disabled={!canProceedStep2}
                className="rounded-lg"
              >
                التالي
                <ArrowLeft className="h-4 w-4 mr-2" />
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Step 3: Image Upload */}
      {step === 3 && (
        <Card className="p-6">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>إضافة صور (اختياري)</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-12 text-center hover:bg-accent/50 transition-colors cursor-pointer">
                <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-sm font-medium mb-1">اسحب وأفلت الصور هنا</p>
                <p className="text-xs text-muted-foreground mb-4">
                  أو انقر للاختيار من جهازك
                </p>
                <p className="text-xs text-muted-foreground">
                  JPG, PNG, WebP (حتى 5 ميجابايت)
                </p>
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(2)}>
                <ArrowRight className="h-4 w-4 ml-2" />
                السابق
              </Button>
              <Button onClick={() => setStep(4)} className="rounded-lg">
                التالي
                <ArrowLeft className="h-4 w-4 mr-2" />
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Step 4: Preview */}
      {step === 4 && (
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">معاينة السؤال</h2>
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
          </Card>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(3)}>
              <ArrowRight className="h-4 w-4 ml-2" />
              السابق
            </Button>
            <div className="flex gap-3">
              <Button variant="outline" onClick={handlePublish}>
                حفظ كمسودة
              </Button>
              <Button onClick={handlePublish} className="rounded-lg">
                نشر السؤال
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
