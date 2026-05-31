import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router";
import { useAppState } from "../context/AppStateContext";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  ArrowRight, ArrowLeft, Upload, MapPin, X, HelpCircle, Tags,
  Image as ImageIcon, Link2, Plus, Trash2, Globe, Check,
  Loader2, Crosshair, Search, AlertCircle, RotateCcw, Save,
  Sparkles, Layers, Star
} from "lucide-react";
import { QuestionCard } from "../components/question-card";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { supabase } from "../../lib/supabase";

// ─── Types ────────────────────────────────────────────────────────────────────
interface AttachmentLink { title: string; url: string; }
interface LocationDetail { name: string; address?: string; lat?: number; lng?: number; }
interface UploadingImage { file: File; preview: string; uploading: boolean; url?: string; error?: string; }

// ─── Constants ────────────────────────────────────────────────────────────────
const DRAFT_KEY = "khapeer_new_question_draft";

const CATEGORIES = [
  { id: "tech", label: "تقنية وبرمجيات", icon: "💻", color: "from-blue-500/15 to-cyan-500/10 border-blue-500/30 text-blue-400" },
  { id: "education", label: "تعليم وأكاديميا", icon: "🎓", color: "from-emerald-500/15 to-teal-500/10 border-emerald-500/30 text-emerald-400" },
  { id: "health", label: "صحة وطب وعيادات", icon: "🏥", color: "from-red-500/15 to-rose-500/10 border-red-500/30 text-red-400" },
  { id: "business", label: "ريادة وأعمال تجارية", icon: "💼", color: "from-amber-500/15 to-orange-500/10 border-amber-500/30 text-amber-400" },
  { id: "science", label: "علوم وبحوث", icon: "🔬", color: "from-violet-500/15 to-purple-500/10 border-violet-500/30 text-violet-400" },
  { id: "food", label: "مطاعم ومأكولات", icon: "🍽️", color: "from-orange-500/15 to-yellow-500/10 border-orange-500/30 text-orange-400" },
  { id: "activity", label: "نشاطات وترفيه", icon: "🎯", color: "from-pink-500/15 to-fuchsia-500/10 border-pink-500/30 text-pink-400" },
  { id: "travel", label: "سياحة وسفر", icon: "✈️", color: "from-sky-500/15 to-indigo-500/10 border-sky-500/30 text-sky-400" },
  { id: "legal", label: "قانون وأنظمة", icon: "⚖️", color: "from-gray-500/15 to-slate-500/10 border-gray-500/30 text-gray-400" },
  { id: "finance", label: "مالية واستثمار", icon: "💰", color: "from-lime-500/15 to-green-500/10 border-lime-500/30 text-lime-400" },
  { id: "sports", label: "رياضة ولياقة", icon: "⚽", color: "from-teal-500/15 to-cyan-500/10 border-teal-500/30 text-teal-400" },
  { id: "arts", label: "فنون وإبداع", icon: "🎨", color: "from-fuchsia-500/15 to-pink-500/10 border-fuchsia-500/30 text-fuchsia-400" },
];

const MAX_CATEGORIES = 3;
const MAX_IMAGES = 6;
const MAX_FILE_SIZE_MB = 10;

// ─── Leaflet Map Component ────────────────────────────────────────────────────
function LeafletMapPicker({
  locationDetail,
  onLocationChange,
}: {
  locationDetail: LocationDetail | undefined;
  onLocationChange: (loc: LocationDetail) => void;
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [isGeocodingReverse, setIsGeocodingReverse] = useState(false);

  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    setIsGeocodingReverse(true);
    try {
      const resp = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=ar`,
        { headers: { "Accept-Language": "ar" } }
      );
      const data = await resp.json();
      const addr = data.address || {};
      const name =
        addr.amenity ||
        addr.shop ||
        addr.building ||
        addr.road ||
        addr.neighbourhood ||
        addr.suburb ||
        addr.city ||
        addr.town ||
        addr.village ||
        "موقع محدد";
      const fullAddress = [addr.road, addr.suburb || addr.neighbourhood, addr.city || addr.town, addr.country]
        .filter(Boolean)
        .join("، ");
      onLocationChange({ name, address: fullAddress, lat, lng });
      toast.success(`تم تحديد الموقع: ${name}`);
    } catch {
      onLocationChange({ name: "موقع محدد", lat, lng });
    } finally {
      setIsGeocodingReverse(false);
    }
  }, [onLocationChange]);

  const loadLeaflet = useCallback(() => {
    return new Promise<void>((resolve, reject) => {
      if ((window as any).L) { resolve(); return; }
      const existingLink = document.querySelector('link[href*="leaflet"]');
      if (!existingLink) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
      }
      const existingScript = document.querySelector('script[src*="leaflet"]');
      if (existingScript) { resolve(); return; }
      const script = document.createElement("script");
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.onload = () => resolve();
      script.onerror = () => reject();
      document.head.appendChild(script);
    });
  }, []);

  const initMap = useCallback(async () => {
    if (!mapRef.current || mapInstanceRef.current) return;
    try {
      await loadLeaflet();
      const L = (window as any).L;
      const initialLat = locationDetail?.lat ?? 24.7136;
      const initialLng = locationDetail?.lng ?? 46.6753;

      const map = L.map(mapRef.current, {
        center: [initialLat, initialLng],
        zoom: locationDetail?.lat ? 15 : 6,
        zoomControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      const customIcon = L.divIcon({
        html: `<div style="
          width:36px;height:36px;background:hsl(var(--primary));
          border:3px solid white;border-radius:50% 50% 50% 0;
          transform:rotate(-45deg);box-shadow:0 4px 16px rgba(0,0,0,0.35);
          display:flex;align-items:center;justify-content:center;
        "></div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 36],
        className: "",
      });

      let marker: any;
      if (locationDetail?.lat) {
        marker = L.marker([locationDetail.lat, locationDetail.lng], {
          icon: customIcon, draggable: true,
        }).addTo(map);
      }

      map.on("click", async (e: any) => {
        const { lat, lng } = e.latlng;
        if (marker) { marker.setLatLng([lat, lng]); }
        else {
          marker = L.marker([lat, lng], { icon: customIcon, draggable: true }).addTo(map);
          marker.on("dragend", async (de: any) => {
            const { lat: dlat, lng: dlng } = de.target.getLatLng();
            await reverseGeocode(dlat, dlng);
          });
          markerRef.current = marker;
        }
        await reverseGeocode(lat, lng);
      });

      if (marker) {
        marker.on("dragend", async (de: any) => {
          const { lat, lng } = de.target.getLatLng();
          await reverseGeocode(lat, lng);
        });
        markerRef.current = marker;
      }

      mapInstanceRef.current = map;
      setMapLoaded(true);
    } catch {
      setMapError(true);
    }
  }, [loadLeaflet, reverseGeocode, locationDetail?.lat, locationDetail?.lng]);

  useEffect(() => {
    initMap();
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const resp = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=1&accept-language=ar`
      );
      const data = await resp.json();
      if (data.length === 0) { toast.error("لم يتم العثور على الموقع، حاول بعبارة أخرى"); return; }
      const { lat, lon, display_name } = data[0];
      const L = (window as any).L;
      const map = mapInstanceRef.current;
      const latNum = parseFloat(lat);
      const lonNum = parseFloat(lon);
      map.flyTo([latNum, lonNum], 15, { duration: 1.5 });
      await reverseGeocode(latNum, lonNum);
    } catch {
      toast.error("خطأ في البحث، يرجى المحاولة مرة أخرى");
    } finally {
      setIsSearching(false);
    }
  };

  const handleLocateMe = () => {
    if (!navigator.geolocation) { toast.error("المتصفح لا يدعم تحديد الموقع"); return; }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const map = mapInstanceRef.current;
        map?.flyTo([coords.latitude, coords.longitude], 15, { duration: 1.5 });
        await reverseGeocode(coords.latitude, coords.longitude);
        setIsLocating(false);
      },
      () => { toast.error("فشل تحديد موقعك، تحقق من صلاحيات الموقع"); setIsLocating(false); },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  if (mapError) {
    return (
      <div className="h-64 rounded-2xl border border-border/30 flex flex-col items-center justify-center gap-3 bg-muted/20">
        <AlertCircle className="h-8 w-8 text-destructive/60" />
        <p className="text-sm text-muted-foreground">تعذر تحميل الخريطة، تحقق من اتصال الإنترنت</p>
        <Button size="sm" variant="outline" onClick={() => { setMapError(false); initMap(); }}>إعادة المحاولة</Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Search + Locate Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="ابحث عن مكان، شارع، أو مدينة..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="pr-10 h-10 text-sm rounded-xl bg-input/50 border-border/40"
          />
        </div>
        <Button
          type="button"
          onClick={handleSearch}
          disabled={isSearching || !searchQuery.trim()}
          className="h-10 px-4 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-bold shrink-0"
        >
          {isSearching ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Search className="h-3.5 w-3.5" />}
        </Button>
        <Button
          type="button"
          onClick={handleLocateMe}
          disabled={isLocating}
          variant="outline"
          className="h-10 px-3 rounded-xl border-border/40 hover:bg-primary/5 hover:border-primary/40 shrink-0"
          title="تحديد موقعي"
        >
          {isLocating ? <Loader2 className="h-4 w-4 animate-spin text-primary" /> : <Crosshair className="h-4 w-4 text-primary" />}
        </Button>
      </div>

      {/* Map Container */}
      <div className="relative rounded-2xl overflow-hidden border border-border/30 shadow-lg">
        {!mapLoaded && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-muted/20 backdrop-blur-sm gap-3">
            <Loader2 className="h-7 w-7 animate-spin text-primary" />
            <p className="text-xs text-muted-foreground font-medium">جارٍ تحميل الخريطة التفاعلية...</p>
          </div>
        )}
        <div ref={mapRef} style={{ height: "360px", width: "100%" }} />
      </div>

      {/* Reverse geocoding indicator */}
      {isGeocodingReverse && (
        <div className="flex items-center gap-2 text-xs text-primary">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          <span>جارٍ تحديد اسم الموقع بالعربية...</span>
        </div>
      )}

      {/* Location Result Card */}
      {locationDetail && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-card border border-primary/25 rounded-xl flex items-center gap-3"
        >
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <MapPin className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-sm font-bold text-foreground block truncate">{locationDetail.name}</span>
            {locationDetail.address && (
              <span className="text-[11px] text-muted-foreground block truncate">{locationDetail.address}</span>
            )}
            {locationDetail.lat && (
              <span className="text-[10px] text-muted-foreground/70 font-mono block">
                {locationDetail.lat.toFixed(5)}, {locationDetail.lng?.toFixed(5)}
              </span>
            )}
          </div>
          <Badge className="bg-primary/15 text-primary border border-primary/30 text-[10px] shrink-0">مُثبَّت ✓</Badge>
        </motion.div>
      )}

      <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
        <MapPin className="h-3 w-3 text-primary/60" />
        انقر على الخريطة أو اسحب الدبوس لتحديد الموقع المطلوب بدقة
      </p>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export function NewQuestionPage() {
  const navigate = useNavigate();
  const { addQuestion, currentUser } = useAppState();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState(1);
  const [isPublishing, setIsPublishing] = useState(false);

  // Step 1
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  // Step 2
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [location, setLocation] = useState("");
  // Step 3 — Attachments
  const [attachmentTab, setAttachmentTab] = useState<"images" | "location" | "links">("images");
  const [uploadingImages, setUploadingImages] = useState<UploadingImage[]>([]);
  const [links, setLinks] = useState<AttachmentLink[]>([]);
  const [locationDetail, setLocationDetail] = useState<LocationDetail | undefined>();
  const [linkTitle, setLinkTitle] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  // Draft
  const [hasDraft, setHasDraft] = useState(false);
  const [draftRestored, setDraftRestored] = useState(false);

  // ── Validation ──
  const titleError = title.length > 0 && title.length < 15 ? `يحتاج ${15 - title.length} حرف إضافي` : "";
  const descriptionError = description.length > 0 && description.length < 20 ? `يحتاج ${20 - description.length} حرف إضافي` : "";
  const canProceedStep1 = title.length >= 15 && description.length >= 20;
  const canProceedStep2 = selectedCategories.length >= 1 && tags.length >= 2;

  const successfulImages = uploadingImages.filter((u) => u.url);

  // ── Draft Auto-save ──
  useEffect(() => {
    const saved = localStorage.getItem(DRAFT_KEY);
    if (saved && !draftRestored) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.title || parsed.description) setHasDraft(true);
      } catch { /* */ }
    }
  }, [draftRestored]);

  useEffect(() => {
    if (!draftRestored) return;
    const draft = {
      title, description, selectedCategories, tags, location,
      links, locationDetail,
    };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  }, [title, description, selectedCategories, tags, location, links, locationDetail, draftRestored]);

  const restoreDraft = () => {
    const saved = localStorage.getItem(DRAFT_KEY);
    if (!saved) return;
    try {
      const p = JSON.parse(saved);
      if (p.title) setTitle(p.title);
      if (p.description) setDescription(p.description);
      if (p.selectedCategories) setSelectedCategories(p.selectedCategories);
      if (p.tags) setTags(p.tags);
      if (p.location) setLocation(p.location);
      if (p.links) setLinks(p.links);
      if (p.locationDetail) setLocationDetail(p.locationDetail);
      setHasDraft(false);
      setDraftRestored(true);
      toast.success("تم استعادة المسودة السابقة بنجاح!");
    } catch { /* */ }
  };

  const discardDraft = () => {
    localStorage.removeItem(DRAFT_KEY);
    setHasDraft(false);
    setDraftRestored(true);
  };

  // ── Categories ──
  const toggleCategory = (id: string) => {
    setSelectedCategories((prev) => {
      if (prev.includes(id)) return prev.filter((c) => c !== id);
      if (prev.length >= MAX_CATEGORIES) {
        toast.error(`يمكنك اختيار ${MAX_CATEGORIES} تخصصات كحد أقصى`);
        return prev;
      }
      return [...prev, id];
    });
  };

  // ── Tags ──
  const handleAddTag = () => {
    const val = tagInput.trim();
    if (!val) return;
    if (tags.length >= 5) { toast.error("الحد الأقصى 5 وسوم"); return; }
    if (tags.includes(val)) { toast.error("هذا الوسم مضاف بالفعل"); return; }
    setTags([...tags, val]);
    setTagInput("");
  };

  // ── Image Upload ──
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    e.target.value = "";

    const remaining = MAX_IMAGES - uploadingImages.length;
    if (remaining <= 0) { toast.error(`يمكنك إرفاق ${MAX_IMAGES} صور كحد أقصى`); return; }

    const toProcess = files.slice(0, remaining);

    for (const file of toProcess) {
      if (!file.type.startsWith("image/")) { toast.error(`الملف "${file.name}" ليس صورة`); continue; }
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) { toast.error(`حجم "${file.name}" يتجاوز ${MAX_FILE_SIZE_MB}MB`); continue; }

      const preview = URL.createObjectURL(file);
      const uid = Date.now() + Math.random();

      setUploadingImages((prev) => [...prev, { file, preview, uploading: true }]);

      try {
        const { data: { user } } = await supabase.auth.getUser();
        const userId = user?.id ?? "guest";
        const ext = file.name.split(".").pop();
        const path = `questions/temp-${userId}/${uid}.${ext}`;
        const { error: upErr } = await supabase.storage.from("question-images").upload(path, file);
        if (upErr) throw upErr;
        const { data } = supabase.storage.from("question-images").getPublicUrl(path);
        const publicUrl = data.publicUrl;

        setUploadingImages((prev) =>
          prev.map((u) =>
            u.preview === preview ? { ...u, uploading: false, url: publicUrl } : u
          )
        );
        toast.success(`تم رفع الصورة بنجاح`);
      } catch (err: any) {
        setUploadingImages((prev) =>
          prev.map((u) =>
            u.preview === preview ? { ...u, uploading: false, error: err?.message ?? "خطأ في الرفع" } : u
          )
        );
        toast.error(`فشل رفع الصورة: ${err?.message ?? "خطأ غير معروف"}`);
      }
    }
  };

  const handleRemoveImage = (preview: string) => {
    setUploadingImages((prev) => {
      const img = prev.find((u) => u.preview === preview);
      if (img?.preview) URL.revokeObjectURL(img.preview);
      return prev.filter((u) => u.preview !== preview);
    });
  };

  // ── Links ──
  const handleAddLink = () => {
    if (!linkTitle.trim() || !linkUrl.trim()) { toast.error("يرجى ملء عنوان الرابط وعنوانه"); return; }
    if (!linkUrl.startsWith("http://") && !linkUrl.startsWith("https://")) {
      toast.error("يجب أن يبدأ الرابط بـ https://"); return;
    }
    setLinks([...links, { title: linkTitle.trim(), url: linkUrl.trim() }]);
    setLinkTitle(""); setLinkUrl("");
    toast.success("تم إضافة الرابط المرجعي");
  };

  // ── Publish ──
  const handlePublish = async () => {
    if (isPublishing) return;
    if (!canProceedStep1 || !canProceedStep2) {
      toast.error("يرجى إكمال جميع الحقول المطلوبة");
      return;
    }
    setIsPublishing(true);
    try {
      const imageUrls = successfulImages.map((u) => u.url!);
      // Pass the first selected category as the primary category (stored in the `category` DB column)
      // All selected categories are joined and stored as a comma-separated string to preserve multi-selection
      const primaryCategory = selectedCategories.join(",");
      const finalLocationDetail = locationDetail || (location ? { name: location } : undefined);
      const newId = await addQuestion(
        title,
        description,
        tags,
        primaryCategory,   // → stored in questions.category column
        imageUrls,
        links,
        finalLocationDetail
      );
      localStorage.removeItem(DRAFT_KEY);
      toast.success("تم نشر سؤالك بنجاح! 🎉", { duration: 3000 });
      if (newId) navigate(`/questions/${newId}`);
      else navigate("/");
    } catch (err: any) {
      toast.error(err?.message ?? "حدث خطأ أثناء النشر، يرجى المحاولة مجدداً");
    } finally {
      setIsPublishing(false);
    }
  };

  // ── Step transition animation variants ──
  const slideVariants = {
    enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 40 : -40 }),
    center: { opacity: 1, x: 0 },
    exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -40 : 40 }),
  };
  const [slideDir, setSlideDir] = useState(1);

  const goNext = (nextStep: number) => { setSlideDir(1); setStep(nextStep); };
  const goPrev = (prevStep: number) => { setSlideDir(-1); setStep(prevStep); };

  const stepLabels = ["السؤال", "التصنيف", "المرفقات", "المعاينة"];

  return (
    <div className="max-w-3xl w-full mx-auto pb-8" dir="rtl">
      {/* Draft Recovery Banner */}
      <AnimatePresence>
        {hasDraft && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-5 p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl backdrop-blur-sm flex items-center gap-3 flex-wrap"
          >
            <div className="h-9 w-9 rounded-xl bg-amber-500/15 flex items-center justify-center shrink-0">
              <Save className="h-4 w-4 text-amber-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-amber-300">مسودة محفوظة سابقاً</p>
              <p className="text-xs text-amber-400/70">تم العثور على مسودة سؤال لم تكتمل. هل تريد استعادتها؟</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <Button size="sm" onClick={restoreDraft} className="h-8 text-xs bg-amber-500 hover:bg-amber-400 text-white rounded-lg px-3">
                <RotateCcw className="h-3.5 w-3.5 ml-1" /> استعادة المسودة
              </Button>
              <Button size="sm" variant="ghost" onClick={discardDraft} className="h-8 text-xs text-amber-400/70 hover:bg-amber-500/10 rounded-lg px-3">
                تجاهل
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          className="mb-3 -mr-2 rounded-xl h-9 text-sm font-semibold hover:bg-primary/10 hover:text-primary"
          onClick={() => navigate("/")}
        >
          <ArrowRight className="h-4 w-4 ml-2" />
          العودة للرئيسية
        </Button>
        <div className="flex items-center gap-3 mb-1">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-heading font-extrabold text-foreground">اطرح سؤالاً جديداً</h1>
            <p className="text-muted-foreground text-xs">شارك استفسارك مع نخبة الخبراء واحصل على إجابات موثوقة</p>
          </div>
        </div>
      </div>

      {/* Wizard Steps */}
      <div className="flex items-center gap-2 mb-8 px-1">
        {stepLabels.map((label, idx) => {
          const s = idx + 1;
          const isActive = s === step;
          const isDone = s < step;
          return (
            <div key={s} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-extrabold text-sm border transition-all duration-300 shadow-sm
                    ${isActive ? "bg-primary text-primary-foreground border-primary shadow-primary/25" : ""}
                    ${isDone ? "bg-primary/15 text-primary border-primary/30" : ""}
                    ${!isActive && !isDone ? "bg-muted/40 text-muted-foreground border-border/40" : ""}
                  `}
                >
                  {isDone ? <Check className="h-4 w-4" /> : s}
                </div>
                <span className={`text-[10px] font-semibold hidden sm:block ${isActive ? "text-primary" : "text-muted-foreground/60"}`}>
                  {label}
                </span>
              </div>
              {idx < 3 && (
                <div className={`h-0.5 flex-1 mx-2 rounded-full transition-all duration-500 ${isDone ? "bg-primary" : "bg-border/30"}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Step Content with slide transitions */}
      <AnimatePresence custom={slideDir} mode="wait">
        {/* ── STEP 1: Title & Description ── */}
        {step === 1 && (
          <motion.div
            key="step1"
            custom={slideDir}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.28, ease: "easeInOut" }}
            className="premium-glass-card p-5 sm:p-7 rounded-3xl border border-border/20 shadow-xl relative overflow-hidden"
          >
            <div className="absolute inset-0 opacity-5 arabic-geometric-mesh-fine pointer-events-none" />
            <div className="space-y-5 relative">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-bold text-foreground flex items-center gap-2">
                  عنوان السؤال <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  placeholder="اكتب سؤالك بشكل واضح ومباشر..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={`h-11 text-sm rounded-xl border bg-input/50 focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary
                    ${titleError ? "border-destructive/60 focus-visible:ring-destructive/50" : "border-border/40"}`}
                  maxLength={150}
                />
                <div className="flex items-center justify-between">
                  {titleError
                    ? <p className="text-[11px] text-destructive flex items-center gap-1"><AlertCircle className="h-3 w-3" />{titleError}</p>
                    : <p className="text-[11px] text-muted-foreground">الحد الأدنى 15 حرفاً</p>
                  }
                  <p className="text-[11px] text-muted-foreground">{title.length}/150</p>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-bold text-foreground flex items-center gap-2">
                  التفاصيل والشرح <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="description"
                  placeholder="قدم تفاصيل أكثر حول سؤالك... أضف السياق والمعلومات التقنية أو العلمية أو المكانية."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={`min-h-[220px] rounded-xl bg-input/50 border focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary p-3 text-sm leading-relaxed resize-none
                    ${descriptionError ? "border-destructive/60" : "border-border/40"}`}
                  maxLength={3000}
                />
                <div className="flex items-center justify-between">
                  {descriptionError
                    ? <p className="text-[11px] text-destructive flex items-center gap-1"><AlertCircle className="h-3 w-3" />{descriptionError}</p>
                    : <p className="text-[11px] text-muted-foreground">الحد الأدنى 20 حرفاً</p>
                  }
                  <p className="text-[11px] text-muted-foreground">{description.length}/3000</p>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  onClick={() => goNext(2)}
                  disabled={!canProceedStep1}
                  className="rounded-xl h-10 px-6 text-sm font-bold text-white bg-primary hover:bg-primary/90 disabled:opacity-40 gap-2"
                >
                  التالي
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── STEP 2: Multi-select Categories + Tags + Location ── */}
        {step === 2 && (
          <motion.div
            key="step2"
            custom={slideDir}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.28, ease: "easeInOut" }}
            className="premium-glass-card p-5 sm:p-7 rounded-3xl border border-border/20 shadow-xl relative overflow-hidden"
          >
            <div className="absolute inset-0 opacity-5 arabic-geometric-mesh-fine pointer-events-none" />
            <div className="space-y-6 relative">

              {/* Multi-select Categories */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-bold text-foreground flex items-center gap-2">
                    <Layers className="h-4 w-4 text-primary" />
                    التخصصات والتصنيفات <span className="text-destructive">*</span>
                  </Label>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${selectedCategories.length > 0 ? "bg-primary/15 text-primary" : "text-muted-foreground"}`}>
                    {selectedCategories.length}/{MAX_CATEGORIES} مختار
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">اختر تخصصاً واحداً أو أكثر يصف سؤالك (حتى {MAX_CATEGORIES} تخصصات)</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {CATEGORIES.map((cat) => {
                    const isSelected = selectedCategories.includes(cat.id);
                    return (
                      <motion.button
                        key={cat.id}
                        type="button"
                        onClick={() => toggleCategory(cat.id)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        className={`relative p-3 rounded-xl border text-right flex items-center gap-2.5 transition-all duration-200 group
                          ${isSelected
                            ? `bg-gradient-to-br ${cat.color} shadow-sm`
                            : "border-border/30 hover:border-border/60 bg-muted/20 hover:bg-muted/35"
                          }`}
                      >
                        <span className="text-xl leading-none shrink-0">{cat.icon}</span>
                        <span className={`text-xs font-bold leading-tight flex-1 ${isSelected ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"}`}>
                          {cat.label}
                        </span>
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute top-2 left-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center shrink-0"
                          >
                            <Check className="h-3 w-3 text-white" />
                          </motion.div>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
                {selectedCategories.length === 0 && (
                  <p className="text-[11px] text-destructive/70 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> يجب اختيار تخصص واحد على الأقل
                  </p>
                )}
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <Label htmlFor="tags" className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Tags className="h-4 w-4 text-primary" />
                  الوسوم <span className="text-destructive">*</span>
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="tags"
                    placeholder="مثال: مطاعم، عيادات، رياضة..."
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddTag(); } }}
                    className="h-10 rounded-xl border-border/40 bg-input/50 focus-visible:ring-primary text-sm flex-1"
                  />
                  <Button
                    type="button"
                    onClick={handleAddTag}
                    disabled={tags.length >= 5 || !tagInput.trim()}
                    className="h-10 px-4 rounded-xl bg-primary hover:bg-primary/90 text-white text-sm font-bold disabled:opacity-40"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 min-h-[40px] p-2.5 bg-muted/15 border border-border/15 rounded-xl">
                  {tags.length === 0 ? (
                    <span className="text-xs text-muted-foreground/50 flex items-center gap-1.5">
                      <Tags className="h-3.5 w-3.5" /> الوسوم ستظهر هنا
                    </span>
                  ) : (
                    tags.map((tag) => (
                      <Badge key={tag} className="rounded-full px-3 py-1 bg-primary/10 border border-primary/20 text-primary hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 group transition-colors">
                        #{tag}
                        <button onClick={() => setTags(tags.filter((t) => t !== tag))} className="mr-1.5 transition-colors">
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))
                  )}
                </div>
                <p className={`text-[11px] font-medium ${tags.length < 2 && tags.length > 0 ? "text-destructive/70" : "text-muted-foreground"}`}>
                  {tags.length < 2 ? `يجب إضافة وسمين على الأقل (${tags.length}/5)` : `${tags.length}/5 وسوم ✓`}
                </p>
              </div>

              {/* Optional Location Text */}
              <div className="space-y-2">
                <Label htmlFor="location" className="text-sm font-bold text-foreground flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  المدينة أو الدولة (اختياري)
                </Label>
                <Input
                  id="location"
                  placeholder="مثال: الرياض، جدة، القاهرة..."
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="h-10 rounded-xl border-border/40 bg-input/50 focus-visible:ring-primary text-sm"
                />
              </div>

              <div className="flex justify-between pt-2">
                <Button variant="outline" onClick={() => goPrev(1)} className="rounded-xl h-10 px-4 text-sm font-bold hover:bg-muted/40 gap-2">
                  <ArrowRight className="h-4 w-4" /> السابق
                </Button>
                <Button
                  onClick={() => goNext(3)}
                  disabled={!canProceedStep2}
                  className="rounded-xl h-10 px-6 text-sm font-bold text-white bg-primary hover:bg-primary/90 disabled:opacity-40 gap-2"
                >
                  التالي (المرفقات) <ArrowLeft className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── STEP 3: Attachments – Images / Leaflet Map / Links ── */}
        {step === 3 && (
          <motion.div
            key="step3"
            custom={slideDir}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.28, ease: "easeInOut" }}
            className="premium-glass-card p-5 sm:p-7 rounded-3xl border border-border/20 shadow-xl relative overflow-hidden"
          >
            <div className="absolute inset-0 opacity-5 arabic-geometric-mesh-fine pointer-events-none" />
            <div className="space-y-5 relative">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-foreground mb-1">لوحة المرفقات المتقدمة</h3>
                <p className="text-xs text-muted-foreground">أضف صوراً ميدانية، موقعاً تفاعلياً على الخريطة، أو روابط مرجعية</p>
              </div>

              {/* Tab switcher */}
              <div className="grid grid-cols-3 gap-2 bg-muted/30 p-1 rounded-xl border border-border/25">
                {[
                  { key: "images", icon: <ImageIcon className="h-3.5 w-3.5" />, label: `صور (${uploadingImages.length})` },
                  { key: "location", icon: <MapPin className="h-3.5 w-3.5" />, label: "خريطة تفاعلية" },
                  { key: "links", icon: <Link2 className="h-3.5 w-3.5" />, label: `روابط (${links.length})` },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setAttachmentTab(tab.key as any)}
                    className={`py-2 px-1 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all
                      ${attachmentTab === tab.key ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-muted/50"}`}
                  >
                    {tab.icon} {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="bg-background/30 p-4 rounded-2xl border border-border/15 min-h-[280px]">
                {/* IMAGES TAB */}
                {attachmentTab === "images" && (
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <Label className="text-xs font-bold">رفع صور ميدانية ودليل مرئي</Label>
                      <p className="text-[11px] text-muted-foreground">حتى {MAX_IMAGES} صور · حجم أقصى {MAX_FILE_SIZE_MB}MB للصورة · JPG، PNG، WebP، GIF</p>
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      multiple
                      className="hidden"
                      onChange={handleFileSelect}
                    />

                    {uploadingImages.length < MAX_IMAGES && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        className="h-10 rounded-xl border-dashed border-2 border-primary/30 hover:border-primary/60 text-primary hover:bg-primary/5 text-xs font-bold w-full gap-2"
                      >
                        <Upload className="h-4 w-4" /> اختيار صور من جهازك ({uploadingImages.length}/{MAX_IMAGES})
                      </Button>
                    )}

                    {/* Image Grid */}
                    {uploadingImages.length > 0 && (
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {uploadingImages.map((img) => (
                          <div key={img.preview} className="group relative h-20 rounded-xl overflow-hidden border border-border/30">
                            <img src={img.preview} className="w-full h-full object-cover" alt="preview" />
                            {/* Loading overlay */}
                            {img.uploading && (
                              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center gap-1">
                                <Loader2 className="h-5 w-5 animate-spin text-white" />
                                <span className="text-[9px] text-white font-bold">جارٍ الرفع...</span>
                              </div>
                            )}
                            {/* Error overlay */}
                            {img.error && (
                              <div className="absolute inset-0 bg-destructive/60 backdrop-blur-sm flex items-center justify-center">
                                <AlertCircle className="h-5 w-5 text-white" />
                              </div>
                            )}
                            {/* Success badge */}
                            {img.url && !img.uploading && (
                              <div className="absolute top-1 left-1 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                                <Check className="h-3 w-3 text-white" />
                              </div>
                            )}
                            {/* Remove button */}
                            {!img.uploading && (
                              <button
                                type="button"
                                onClick={() => handleRemoveImage(img.preview)}
                                className="absolute top-1 right-1 bg-destructive/90 text-white rounded-md p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* LEAFLET MAP TAB */}
                {attachmentTab === "location" && (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <Label className="text-xs font-bold">حدد الموقع الجغرافي على الخريطة</Label>
                      <p className="text-[11px] text-muted-foreground">خريطة تفاعلية حقيقية — انقر أو ابحث لتحديد المكان بدقة</p>
                    </div>
                    <LeafletMapPicker
                      locationDetail={locationDetail}
                      onLocationChange={(loc) => {
                        setLocationDetail(loc);
                        if (!location) setLocation(loc.name);
                      }}
                    />
                    {locationDetail && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setLocationDetail(undefined)}
                        className="text-destructive hover:bg-destructive/5 text-xs h-8 rounded-lg"
                      >
                        <Trash2 className="h-3.5 w-3.5 ml-1" /> إزالة الموقع المثبت
                      </Button>
                    )}
                  </div>
                )}

                {/* LINKS TAB */}
                {attachmentTab === "links" && (
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <Label className="text-xs font-bold">روابط مرجعية ومصادر موثوقة</Label>
                      <p className="text-[11px] text-muted-foreground">أضف روابط لتقارير، بحوث، أو مواقع رسمية لتعزيز سؤالك</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="linkTitle" className="text-[11px] font-bold text-muted-foreground">عنوان المصدر</Label>
                        <Input
                          id="linkTitle"
                          placeholder="مثال: الدراسة الطبية الكاملة"
                          value={linkTitle}
                          onChange={(e) => setLinkTitle(e.target.value)}
                          className="h-9 text-xs rounded-lg border-border/40 bg-input/50"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="linkUrl" className="text-[11px] font-bold text-muted-foreground">الرابط الإلكتروني</Label>
                        <Input
                          id="linkUrl"
                          placeholder="https://example.com"
                          value={linkUrl}
                          onChange={(e) => setLinkUrl(e.target.value)}
                          className="h-9 text-xs rounded-lg border-border/40 bg-input/50 text-left"
                          dir="ltr"
                        />
                      </div>
                    </div>
                    <Button
                      type="button"
                      onClick={handleAddLink}
                      className="h-9 text-xs font-bold bg-primary hover:bg-primary/90 text-white rounded-lg gap-2"
                    >
                      <Plus className="h-3.5 w-3.5" /> إضافة الرابط
                    </Button>

                    {links.length > 0 && (
                      <div className="space-y-2 pt-1">
                        <span className="text-[11px] font-bold text-foreground block">الروابط المضافة ({links.length}):</span>
                        {links.map((link, idx) => (
                          <div key={idx} className="flex items-center justify-between p-2.5 bg-card border border-border/25 rounded-xl">
                            <div className="flex items-center gap-2 min-w-0">
                              <Globe className="h-3.5 w-3.5 text-primary shrink-0" />
                              <span className="text-xs font-semibold text-foreground truncate">{link.title}</span>
                              <span className="text-[10px] text-muted-foreground truncate hidden sm:inline">({link.url})</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setLinks(links.filter((_, i) => i !== idx))}
                              className="text-destructive hover:bg-destructive/5 rounded p-1"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex justify-between pt-2">
                <Button variant="outline" onClick={() => goPrev(2)} className="rounded-xl h-10 px-4 text-sm font-bold hover:bg-muted/40 gap-2">
                  <ArrowRight className="h-4 w-4" /> السابق
                </Button>
                <Button
                  onClick={() => goNext(4)}
                  className="rounded-xl h-10 px-6 text-sm font-bold text-white bg-primary hover:bg-primary/90 gap-2"
                >
                  التالي (المعاينة) <ArrowLeft className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── STEP 4: Preview & Publish ── */}
        {step === 4 && (
          <motion.div
            key="step4"
            custom={slideDir}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.28, ease: "easeInOut" }}
            className="space-y-5"
          >
            <div className="premium-glass-card p-5 sm:p-6 rounded-3xl border border-border/20 shadow-xl relative overflow-hidden">
              <div className="absolute inset-0 opacity-5 arabic-geometric-mesh-fine pointer-events-none" />
              <div className="relative">
                <h2 className="font-heading font-bold text-base sm:text-lg mb-4 text-foreground flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-primary" />
                  معاينة سؤالك قبل النشر
                </h2>

                {/* Categories Preview */}
                {selectedCategories.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {selectedCategories.map((catId) => {
                      const cat = CATEGORIES.find((c) => c.id === catId);
                      return cat ? (
                        <Badge key={catId} className={`rounded-full px-3 py-1 bg-gradient-to-r ${cat.color} border text-xs font-semibold gap-1`}>
                          <span>{cat.icon}</span> {cat.label}
                        </Badge>
                      ) : null;
                    })}
                  </div>
                )}

                <div className="border border-border/10 rounded-2xl overflow-hidden bg-background/20">
                  <QuestionCard
                    id="preview"
                    title={title}
                    description={description}
                    author={{ name: currentUser?.name ?? "أنت", avatar: currentUser?.avatar ?? "", reputation: currentUser?.reputation ?? 0 }}
                    votes={0}
                    answers={0}
                    tags={tags}
                    location={location}
                    timestamp="الآن"
                  />
                </div>

                {/* Attachments Preview */}
                {(successfulImages.length > 0 || locationDetail || links.length > 0) && (
                  <div className="mt-4 p-4 border border-border/20 bg-muted/10 rounded-2xl space-y-3">
                    <span className="text-xs font-bold text-foreground block">مرفقات السؤال:</span>

                    {successfulImages.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-[11px] text-muted-foreground font-bold flex items-center gap-1">
                          <ImageIcon className="h-3.5 w-3.5 text-primary" /> الصور ({successfulImages.length}):
                        </span>
                        <div className="flex gap-1.5 flex-wrap">
                          {successfulImages.map((img, i) => (
                            <img key={i} src={img.url} className="w-14 h-14 object-cover rounded-lg border border-border" alt="attached" />
                          ))}
                        </div>
                      </div>
                    )}

                    {locationDetail && (
                      <div className="space-y-1.5">
                        <span className="text-[11px] text-muted-foreground font-bold flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-primary" /> الموقع الجغرافي:
                        </span>
                        <p className="text-xs text-primary font-semibold flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {locationDetail.name}
                          {locationDetail.address ? ` — ${locationDetail.address}` : ""}
                        </p>
                      </div>
                    )}

                    {links.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-[11px] text-muted-foreground font-bold flex items-center gap-1">
                          <Globe className="h-3.5 w-3.5 text-primary" /> المراجع ({links.length}):
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {links.map((lnk, i) => (
                            <div key={i} className="text-xs bg-card border border-border/30 px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                              <Globe className="h-3 w-3 text-primary" />
                              <span className="font-medium text-foreground">{lnk.title}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Uploading warning */}
                {uploadingImages.some((u) => u.uploading) && (
                  <div className="mt-4 flex items-center gap-2 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl">
                    <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" />
                    بعض الصور لا تزال تُرفع... سيتم تضمينها عند اكتمال الرفع.
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-between items-center gap-3 flex-wrap">
              <Button variant="outline" onClick={() => goPrev(3)} className="rounded-xl h-10 px-4 text-sm font-bold hover:bg-muted/40 gap-2">
                <ArrowRight className="h-4 w-4" /> تعديل المرفقات
              </Button>
              <div className="flex gap-2.5">
                <Button
                  variant="outline"
                  onClick={() => {
                    const draft = { title, description, selectedCategories, tags, location, links, locationDetail };
                    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
                    toast.success("تم حفظ المسودة");
                  }}
                  className="rounded-xl h-10 px-4 text-sm font-bold hover:bg-muted/30 gap-2"
                >
                  <Save className="h-4 w-4" /> حفظ كمسودة
                </Button>
                <Button
                  onClick={handlePublish}
                  disabled={isPublishing || uploadingImages.some((u) => u.uploading)}
                  className="rounded-xl h-10 px-6 text-sm font-bold text-white bg-secondary hover:bg-secondary/90 shadow-[0_4px_20px_rgba(245,158,11,0.3)] disabled:opacity-50 gap-2"
                >
                  {isPublishing ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> جارٍ النشر...</>
                  ) : (
                    <><Star className="h-4 w-4" /> تأكيد ونشر السؤال</>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
