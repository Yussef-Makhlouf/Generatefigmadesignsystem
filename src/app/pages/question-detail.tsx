import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate, Link, useParams } from "react-router";
import { useQuestionInteractions } from "../../lib/hooks/use-question-interactions";
import { useAppActions } from "../../lib/hooks/use-app-actions";
import { useQuestionDetail } from "../../lib/hooks/use-question-detail";
import { useSession } from "../../lib/hooks/use-auth";
import { acceptAnswer, unacceptAnswer, addComment, uploadAnswerImage } from "../../lib/services/answers.service";
import { useQueryClient } from "@tanstack/react-query";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Separator } from "../components/ui/separator";
import { Skeleton } from "../components/ui/skeleton";
import { VoteButtons } from "../components/vote-buttons";
import {
  ArrowRight, Bookmark, Share2, MapPin, MessageSquare,
  Camera, Check, Eye, Flag, ThumbsUp, PenSquare,
  Plus, Trash2, Image as ImageIcon, Link2, Globe, Send,
  MessageCircle, Map, ExternalLink, X, LogIn, Loader2,
  SortAsc, Upload, AlertCircle, Crosshair, Search
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import type { AttachmentLink, AttachmentLocation } from "../../lib/database.types";
import type { Answer } from "../../lib/database.types";
import { supabase } from "../../lib/supabase";

// ─── Compact Leaflet Map Component for Answers ────────────────────────────────
function LeafletMapPicker({
  locationDetail,
  onLocationChange,
}: {
  locationDetail: AttachmentLocation | undefined;
  onLocationChange: (loc: AttachmentLocation) => void;
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
      toast.success(`تم تحديد الموقع الجغرافي: ${name}`);
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
          width:28px;height:28px;background:hsl(var(--primary));
          border:2px solid white;border-radius:50% 50% 50% 0;
          transform:rotate(-45deg);box-shadow:0 3px 10px rgba(0,0,0,0.3);
          display:flex;align-items:center;justify-content:center;
        "></div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 28],
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
      const { lat, lon } = data[0];
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
      <div className="h-44 rounded-xl border border-border/30 flex flex-col items-center justify-center gap-2 bg-muted/20">
        <AlertCircle className="h-6 w-6 text-destructive/60" />
        <p className="text-xs text-muted-foreground">تعذر تحميل الخريطة، تحقق من اتصالك بالإنترنت</p>
        <Button size="sm" variant="outline" className="h-7 text-[10px]" onClick={() => { setMapError(false); initMap(); }}>إعادة المحاولة</Button>
      </div>
    );
  }

  return (
    <div className="space-y-2 mt-2">
      {/* Search + Locate Bar */}
      <div className="flex gap-1.5">
        <div className="relative flex-1">
          <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="ابحث عن مكان أو شارع..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="pr-8 h-8 text-[11px] rounded-lg bg-input/50 border-border/40"
          />
        </div>
        <Button
          type="button"
          onClick={handleSearch}
          disabled={isSearching || !searchQuery.trim()}
          className="h-8 px-3 rounded-lg bg-primary hover:bg-primary/90 text-white text-[10px] font-bold shrink-0"
        >
          {isSearching ? <Loader2 className="h-3 w-3 animate-spin" /> : <Search className="h-3 w-3" />}
        </Button>
        <Button
          type="button"
          onClick={handleLocateMe}
          disabled={isLocating}
          variant="outline"
          className="h-8 px-2.5 rounded-lg border-border/40 hover:bg-primary/5 hover:border-primary/40 shrink-0"
          title="تحديد موقعي"
        >
          {isLocating ? <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" /> : <Crosshair className="h-3.5 w-3.5 text-primary" />}
        </Button>
      </div>

      {/* Map Container */}
      <div className="relative rounded-xl overflow-hidden border border-border/30 shadow-md">
        {!mapLoaded && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-muted/20 backdrop-blur-[2px] gap-2">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <span className="text-[10px] text-muted-foreground">جارٍ تحميل الخريطة...</span>
          </div>
        )}
        <div ref={mapRef} style={{ height: "200px", width: "100%" }} />
      </div>

      {isGeocodingReverse && (
        <div className="flex items-center gap-1.5 text-[10px] text-primary">
          <Loader2 className="h-3 w-3 animate-spin" />
          <span>تحديد اسم الموقع...</span>
        </div>
      )}
    </div>
  );
}

type SortMode = "newest" | "votes";

export function QuestionDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  // ── Auth ─────────────────────────────────────────────────────
  const { data: session } = useSession();
  const currentUserId = session?.user?.id ?? null;

  // ── Context (needed for voteQuestion, voteAnswer, addAnswer, toggleBookmark) ──
  const {
    bookmarkedIds,
    voteQuestion,
    voteAnswer,
    toggleBookmark,
    userVotes,
  } = useQuestionInteractions();
  const { addAnswer } = useAppActions();

  // ── Per-question data (hook fetches directly from Supabase) ──
  const { question, answers: rawAnswers, isLoading, isAnswersLoading } = useQuestionDetail(id ?? "");

  // ── Sorting ───────────────────────────────────────────────────
  const [sortMode, setSortMode] = useState<SortMode>("newest");

  const answers: Answer[] = [...rawAnswers].sort((a, b) => {
    if (sortMode === "votes") return (b.votes_count ?? 0) - (a.votes_count ?? 0);
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  // ── Answer compose state ──────────────────────────────────────
  const [newAnswer, setNewAnswer] = useState("");
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);

  // Answer attachment state
  const [showAnswerAttachPanel, setShowAnswerAttachPanel] = useState<"none" | "images" | "location" | "links">("none");
  const [answerImageFiles, setAnswerImageFiles] = useState<File[]>([]);        // staged File objects
  const [answerImagePreviews, setAnswerImagePreviews] = useState<string[]>([]); // local preview URLs
  const [answerLinks, setAnswerLinks] = useState<AttachmentLink[]>([]);
  const [answerLocation, setAnswerLocation] = useState<AttachmentLocation | undefined>(undefined);
  const [ansLinkTitle, setAnsLinkTitle] = useState("");
  const [ansLinkUrl, setAnsLinkUrl] = useState("");
  const [ansLocName, setAnsLocName] = useState("");
  const [ansLocAddress, setAnsLocAddress] = useState("");
  const answerFileInputRef = useRef<HTMLInputElement>(null);

  // ── Best answer ───────────────────────────────────────────────
  // Initialise from DB: the first accepted answer is the best one
  const [bestAnswerId, setBestAnswerId] = useState<string | null>(
    () => answers.find(a => a.is_accepted)?.id ?? null
  );

  // ── Comment compose state ─────────────────────────────────────
  const [showComments, setShowComments] = useState<{ [key: string]: boolean }>({});
  const [commentContent, setCommentContent] = useState<{ [key: string]: string }>({});
  const [submittingComment, setSubmittingComment] = useState<{ [key: string]: boolean }>({});
  const [showCommentAttachPanel, setShowCommentAttachPanel] = useState<{ [key: string]: "none" | "links" }>({});
  const [commentLinks, setCommentLinks] = useState<{ [key: string]: AttachmentLink[] }>({});
  const [commLinkTitle, setCommLinkTitle] = useState("");
  const [commLinkUrl, setCommLinkUrl] = useState("");

  // ── Intersection Observer to hide sticky CTA when write card is visible ──
  const writeCardRef = useRef<HTMLDivElement>(null);
  const [isWriteCardVisible, setIsWriteCardVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsWriteCardVisible(entry.isIntersecting);
      },
      { threshold: 0.05, rootMargin: "0px 0px 50px 0px" }
    );

    const currentCard = writeCardRef.current;
    if (currentCard) {
      observer.observe(currentCard);
    }

    return () => {
      if (currentCard) {
        observer.unobserve(currentCard);
      }
    };
  }, []);

  const bookmarked = question ? bookmarkedIds.includes(question.id) : false;

  // ── Handlers ─────────────────────────────────────────────────

  const handleBookmark = () => {
    if (!currentUserId) { toast.error("يجب تسجيل الدخول أولاً"); return; }
    if (question) {
      toggleBookmark(question.id);
      toast.success(bookmarked ? "تم إزالة السؤال من المحفوظات" : "تم حفظ السؤال");
    }
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    toast.success("تم نسخ رابط السؤال");
  };

  // ── Answer image upload (real file picker) ────────────────────
  const handleAnswerFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (answerImageFiles.length + files.length > 4) {
      toast.error("يمكنك إرفاق 4 صور كحد أقصى بالإجابة");
      return;
    }
    const newFiles = [...answerImageFiles, ...files];
    const newPreviews = [...answerImagePreviews, ...files.map(f => URL.createObjectURL(f))];
    setAnswerImageFiles(newFiles);
    setAnswerImagePreviews(newPreviews);
    toast.success(`تم تحديد ${files.length} صورة`);
    // reset input so same file can be re-selected
    e.target.value = "";
  };

  const handleRemoveAnswerImage = (index: number) => {
    URL.revokeObjectURL(answerImagePreviews[index]);
    setAnswerImageFiles(answerImageFiles.filter((_, i) => i !== index));
    setAnswerImagePreviews(answerImagePreviews.filter((_, i) => i !== index));
  };

  const handleAddAnswerLink = () => {
    if (!ansLinkTitle.trim() || !ansLinkUrl.trim()) {
      toast.error("يرجى ملء تفاصيل الرابط");
      return;
    }
    setAnswerLinks([...answerLinks, { title: ansLinkTitle.trim(), url: ansLinkUrl.trim() }]);
    setAnsLinkTitle("");
    setAnsLinkUrl("");
    toast.success("تم إضافة الرابط المرجعي للإجابة");
  };

  const handleRemoveAnswerLink = (index: number) => {
    setAnswerLinks(answerLinks.filter((_, i) => i !== index));
  };

  const handleSetAnswerLocation = () => {
    if (!ansLocName.trim()) { toast.error("يرجى إدخال اسم المكان"); return; }
    setAnswerLocation({ name: ansLocName.trim(), address: ansLocAddress.trim() || undefined, lat: 24.7136, lng: 46.6753 });
    toast.success("تم تثبيت الموقع الجغرافي للإجابة");
  };

  const handleRemoveAnswerLocation = () => {
    setAnswerLocation(undefined);
    setAnsLocName("");
    setAnsLocAddress("");
    toast.success("تم إزالة الموقع الجغرافي");
  };

  // ── Submit Answer (real upload → attach) ─────────────────────
  const handleSubmitAnswer = useCallback(async () => {
    if (!currentUserId) { toast.error("يجب تسجيل الدخول لنشر إجابة"); return; }
    if (!question || newAnswer.length < 10) return;

    setIsSubmittingAnswer(true);
    try {
      // 1. Create the answer row, get answerId back
      const verifiedType = answerImageFiles.length > 0 ? "photo" : answerLocation ? "location" : undefined;

      // Call addAnswer via context (which uses createAnswerMutation)
      // We need the returned ID for image uploads, so we use the service directly here
      const { createAnswer } = await import("../../lib/services/answers.service");
      const created = await createAnswer(currentUserId, {
        question_id: question.id,
        content: newAnswer,
        verified_type: verifiedType,
        // links and locationDetail go directly into the service
        links: answerLinks,
        locationDetail: answerLocation,
      });

      if (!created) {
        toast.error("فشل نشر الإجابة. يرجى المحاولة مرة أخرى.");
        return;
      }

      // 2. Upload staged images and attach them
      if (answerImageFiles.length > 0) {
        const uploadToasts = toast.loading("جاري رفع الصور...");
        const uploadedUrls: string[] = [];
        for (const file of answerImageFiles) {
          const url = await uploadAnswerImage(created.id, file);
          if (url) uploadedUrls.push(url);
        }
        toast.dismiss(uploadToasts);

        if (uploadedUrls.length > 0) {
          const imageRows = uploadedUrls.map((url, i) => ({
            answer_id: created.id,
            type: "image" as const,
            url,
            sort_order: i,
          }));
          await supabase.from("answer_attachments").insert(imageRows as any);
        }

        if (uploadedUrls.length < answerImageFiles.length) {
          toast.warning("تعذّر رفع بعض الصور، لكن تم نشر الإجابة.");
        }
      }

      // 3. Invalidate caches
      queryClient.invalidateQueries({ queryKey: ["question-answers", question.id] });
      queryClient.invalidateQueries({ queryKey: ["question-detail", question.id] });
      queryClient.invalidateQueries({ queryKey: ["questions"] });

      toast.success("تم نشر إجابتك الموثقة بنجاح!", { duration: 3000 });

      // 4. Reset compose state
      setNewAnswer("");
      answerImagePreviews.forEach(p => URL.revokeObjectURL(p));
      setAnswerImageFiles([]);
      setAnswerImagePreviews([]);
      setAnswerLinks([]);
      setAnswerLocation(undefined);
      setShowAnswerAttachPanel("none");
    } catch (err) {
      console.error(err);
      toast.error("حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.");
    } finally {
      setIsSubmittingAnswer(false);
    }
  }, [currentUserId, question, newAnswer, answerImageFiles, answerImagePreviews, answerLinks, answerLocation, queryClient]);

  // ── Toggle best answer (persisted) ───────────────────────────
  const handleToggleBestAnswer = async (answerId: string) => {
    if (!currentUserId) { toast.error("يجب تسجيل الدخول أولاً"); return; }
    if (!question || question.author_id !== currentUserId) {
      toast.info("فقط صاحب السؤال يمكنه اختيار أفضل إجابة");
      return;
    }

    if (bestAnswerId === answerId) {
      // Toggle off
      await unacceptAnswer(answerId);
      setBestAnswerId(null);
      toast.success("تم إلغاء تعيين أفضل إجابة");
    } else {
      // Unaccept previous if exists
      if (bestAnswerId) await unacceptAnswer(bestAnswerId);
      await acceptAnswer(answerId);
      setBestAnswerId(answerId);
      toast.success("تم تعيين أفضل إجابة ✅");
    }
    queryClient.invalidateQueries({ queryKey: ["question-answers", question?.id] });
  };

  // ── Comment submit (persisted) ────────────────────────────────
  const handleSubmitComment = async (answerId: string) => {
    if (!currentUserId) { toast.error("يجب تسجيل الدخول للتعليق"); return; }
    const content = (commentContent[answerId] || "").trim();
    if (!content) return;

    setSubmittingComment(p => ({ ...p, [answerId]: true }));
    try {
      const ok = await addComment(answerId, currentUserId, content);
      if (ok) {
        toast.success("تم إضافة تعليقك بنجاح");
        setCommentContent(p => ({ ...p, [answerId]: "" }));
        setCommentLinks(p => ({ ...p, [answerId]: [] }));
        setShowCommentAttachPanel(p => ({ ...p, [answerId]: "none" }));
        // Realtime will handle the refresh, but also proactively invalidate
        queryClient.invalidateQueries({ queryKey: ["question-answers", question?.id] });
      } else {
        toast.error("فشل إضافة التعليق");
      }
    } finally {
      setSubmittingComment(p => ({ ...p, [answerId]: false }));
    }
  };

  const handleAddCommentLink = (ansId: string) => {
    if (!commLinkTitle.trim() || !commLinkUrl.trim()) { toast.error("يرجى إدخال عنوان ورابط صحيح"); return; }
    const current = commentLinks[ansId] || [];
    setCommentLinks({ ...commentLinks, [ansId]: [...current, { title: commLinkTitle.trim(), url: commLinkUrl.trim() }] });
    setCommLinkTitle("");
    setCommLinkUrl("");
    toast.success("تم إضافة الرابط للتعليق");
  };

  const handleRemoveCommentLink = (ansId: string, index: number) => {
    const current = commentLinks[ansId] || [];
    setCommentLinks({ ...commentLinks, [ansId]: current.filter((_, i) => i !== index) });
  };

  // ── Format timestamp helper ───────────────────────────────────
  const formatTimestamp = (ts: string) => {
    try {
      return new Date(ts).toLocaleDateString("ar-SA", {
        year: "numeric", month: "short", day: "numeric",
        hour: "2-digit", minute: "2-digit"
      });
    } catch {
      return ts;
    }
  };

  // ── Loading skeleton ──────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="max-w-5xl w-full mx-auto pb-4 animate-fade-in">
        <Button variant="ghost" className="mb-3 sm:mb-4 -mr-2 hover:bg-muted rounded-xl text-sm h-9" onClick={() => navigate(-1)}>
          <ArrowRight className="h-4 w-4 ml-2" />
          رجوع
        </Button>
        <div className="grid md:grid-cols-3 gap-4 sm:gap-6">
          <div className="md:col-span-2 space-y-4">
            {/* Question skeleton */}
            <Card className="p-6 premium-glass-card border border-border/30" style={{ borderRadius: "var(--radius-lg)" }}>
              <div className="flex gap-4">
                <div className="space-y-2 shrink-0">
                  <Skeleton className="h-8 w-8 rounded-lg" />
                  <Skeleton className="h-5 w-8 rounded" />
                  <Skeleton className="h-8 w-8 rounded-lg" />
                </div>
                <div className="flex-1 space-y-3">
                  <Skeleton className="h-6 w-3/4 rounded-lg" />
                  <Skeleton className="h-4 w-full rounded" />
                  <Skeleton className="h-4 w-5/6 rounded" />
                  <Skeleton className="h-4 w-4/5 rounded" />
                  <div className="flex gap-2 pt-2">
                    <Skeleton className="h-6 w-16 rounded-full" />
                    <Skeleton className="h-6 w-16 rounded-full" />
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="space-y-1">
                      <Skeleton className="h-3 w-24 rounded" />
                      <Skeleton className="h-3 w-16 rounded" />
                    </div>
                  </div>
                </div>
              </div>
            </Card>
            {/* Answer skeletons */}
            {[1, 2].map(i => (
              <Card key={i} className="p-5 premium-glass-card border border-border/30" style={{ borderRadius: "var(--radius-lg)" }}>
                <div className="flex gap-4">
                  <Skeleton className="h-20 w-8 rounded-lg shrink-0" />
                  <div className="flex-1 space-y-3">
                    <Skeleton className="h-4 w-full rounded" />
                    <Skeleton className="h-4 w-5/6 rounded" />
                    <Skeleton className="h-4 w-3/4 rounded" />
                    <div className="flex items-center gap-2 pt-2">
                      <Skeleton className="h-7 w-7 rounded-full" />
                      <div className="space-y-1">
                        <Skeleton className="h-3 w-20 rounded" />
                        <Skeleton className="h-3 w-14 rounded" />
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          <aside className="hidden md:flex flex-col gap-4">
            <Card className="p-5 premium-glass-card border border-border/30" style={{ borderRadius: "var(--radius-lg)" }}>
              <Skeleton className="h-4 w-24 rounded mb-4" />
              {[1,2,3].map(i => (
                <div key={i} className="flex justify-between py-2 border-b border-border/30 last:border-0">
                  <Skeleton className="h-4 w-20 rounded" />
                  <Skeleton className="h-4 w-8 rounded" />
                </div>
              ))}
            </Card>
          </aside>
        </div>
      </div>
    );
  }

  // ── Not found ─────────────────────────────────────────────────
  if (!question) {
    return (
      <div className="max-w-md w-full mx-auto py-16 text-center animate-fade-in">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-destructive/10 text-destructive mb-6 shadow-sm">
          <Flag className="h-10 w-10 animate-pulse" />
        </div>
        <h1 className="text-2xl font-bold mb-3">السؤال غير موجود</h1>
        <p className="text-muted-foreground mb-6 leading-relaxed">
          عذراً، قد يكون هذا السؤال قد تم حذفه بواسطة الكاتب أو المشرف، أو أن الرابط غير صحيح.
        </p>
        <div className="flex flex-col gap-3">
          <Button
            className="rounded-xl bg-primary hover:bg-primary-hover text-white shadow-sm text-sm py-5 font-bold"
            onClick={() => navigate("/")}
          >
            <ArrowRight className="h-4 w-4 ml-2" />
            العودة للرئيسية
          </Button>
          <Button
            variant="outline"
            className="rounded-xl border-border hover:bg-muted text-sm py-5 font-semibold"
            onClick={() => navigate("/questions/new")}
          >
            اطرح سؤالاً جديداً
          </Button>
        </div>
      </div>
    );
  }

  // ── is author of the question ─────────────────────────────────
  const isQuestionAuthor = currentUserId && question.author_id === currentUserId;

  return (
    <div className="max-w-5xl w-full mx-auto pb-4 animate-fade-in">
      {/* Back */}
      <Button variant="ghost" className="mb-3 sm:mb-4 -mr-2 hover:bg-muted rounded-xl text-sm h-9" onClick={() => navigate(-1)}>
        <ArrowRight className="h-4 w-4 ml-2" />
        رجوع
      </Button>

      <div className="grid md:grid-cols-3 gap-4 sm:gap-6">
        {/* Main Q&A Stream */}
        <div className="md:col-span-2 space-y-4 sm:space-y-6">

          {/* Question Card */}
          <Card className="overflow-hidden premium-glass-card border border-border/30" style={{ borderRadius: "var(--radius-lg)" }}>
            <div className="p-4 sm:p-6">
              <div className="flex gap-3 sm:gap-5">
                <div className="shrink-0">
                  <VoteButtons
                    votes={question.votes}
                    userVote={userVotes[question.id]}
                    onVote={(dir) => voteQuestion(question.id, dir)}
                    size="md"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <h1 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 leading-relaxed font-heading text-foreground">
                    {question.title}
                  </h1>

                  <p className="prose-arabic text-foreground mb-4 leading-[1.95] text-sm sm:text-base whitespace-pre-line">
                    {question.description}
                  </p>

                  {/* Question Attachments */}
                  {(question.images && question.images.length > 0 || question.locationDetail || question.links && question.links.length > 0) && (
                    <div className="mt-4 p-4 bg-muted/15 border border-border/40 rounded-2xl space-y-4">
                      <span className="text-xs font-bold text-foreground block border-b border-border/30 pb-1">المرفقات التوضيحية للسؤال:</span>

                      {/* Images Gallery */}
                      {question.images && question.images.length > 0 && (
                        <div className="space-y-1.5">
                          <span className="text-[11px] text-muted-foreground font-bold flex items-center gap-1">
                            <ImageIcon className="h-3.5 w-3.5 text-primary" />
                            الصور المرفقة:
                          </span>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {question.images.map((img, idx) => (
                              <div key={idx} className="group relative h-28 rounded-xl overflow-hidden border border-border/40 cursor-zoom-in">
                                <img src={img} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300" alt="Question attachment" />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Geographic Pin */}
                      {question.locationDetail && (
                        <div className="space-y-1.5">
                          <span className="text-[11px] text-muted-foreground font-bold flex items-center gap-1">
                            <Map className="h-3.5 w-3.5 text-secondary" />
                            الموقع الجغرافي المستهدف:
                          </span>
                          <div className="p-3 bg-card border border-primary/20 rounded-xl flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                              <MapPin className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="text-xs font-bold text-foreground block truncate">{question.locationDetail.name}</span>
                              {question.locationDetail.address && (
                                <span className="text-[10px] text-muted-foreground block truncate">{question.locationDetail.address}</span>
                              )}
                            </div>
                            <Button size="sm" variant="ghost" className="h-8 text-[10px] text-primary hover:bg-primary/5 shrink-0 gap-1"
                              onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(question.locationDetail?.name ?? "")}`, "_blank")}>
                              <ExternalLink className="h-3 w-3" />
                              خرائط جوجل
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Reference Links */}
                      {question.links && question.links.length > 0 && (
                        <div className="space-y-1.5">
                          <span className="text-[11px] text-muted-foreground font-bold flex items-center gap-1">
                            <Link2 className="h-3.5 w-3.5 text-primary" />
                            روابط مرجعية ومصادر:
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {question.links.map((link, idx) => (
                              <a
                                key={idx}
                                href={link.url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-card border border-border/30 hover:border-primary/45 rounded-xl text-xs font-medium text-foreground hover:text-primary transition-all shadow-sm"
                              >
                                <Globe className="h-3.5 w-3.5 text-primary shrink-0" />
                                <span>{link.title}</span>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-4 sm:mb-5 mt-4">
                    {question.tags.map((tag) => (
                      <Link key={typeof tag === "string" ? tag : (tag as any).name} to={`/tags/${encodeURIComponent(typeof tag === "string" ? tag : (tag as any).name)}`}>
                        <Badge
                          variant="secondary"
                          className="rounded-full text-[10px] sm:text-xs px-2.5 sm:px-3 py-0.5 sm:py-1 bg-muted/40 text-foreground/80 border border-border/30 hover:border-primary/30 hover:bg-primary/5 hover:text-primary transition-all duration-300 font-medium tag-pill"
                        >
                          #{typeof tag === "string" ? tag : (tag as any).name}
                        </Badge>
                      </Link>
                    ))}
                  </div>

                  <Separator className="mb-3 sm:mb-4" />

                  {/* Author & Actions */}
                  <div className="flex items-start sm:items-center justify-between flex-wrap gap-2 sm:gap-3">
                    <Link
                      to={`/profile/${(question.author as any).username || question.author_id}`}
                      className="flex items-center gap-2 sm:gap-2.5 hover:opacity-80 transition-opacity"
                    >
                      <Avatar className="h-7 w-7 sm:h-8 sm:w-8">
                        <AvatarImage src={(question.author as any).avatar_url ?? (question.author as any).avatar} />
                        <AvatarFallback className="bg-primary text-white text-[10px] sm:text-xs font-bold">
                          {question.author.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-xs sm:text-sm font-semibold text-foreground">{question.author.name}</p>
                        <p className="text-[10px] sm:text-xs text-muted-foreground font-numbers">
                          {formatTimestamp(question.created_at)} · {question.author.reputation.toLocaleString("ar-SA")} نقطة
                        </p>
                      </div>
                    </Link>

                    <div className="flex items-center gap-0.5 sm:gap-1 flex-wrap">
                      <div className="hidden xs:flex items-center gap-1 text-[10px] sm:text-xs text-muted-foreground px-1.5 sm:px-2">
                        <Eye className="h-3 sm:h-3.5 w-3 sm:w-3.5" />
                        <span>{question.views || 0}</span>
                      </div>
                      {question.location && (
                        <div className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground px-2">
                          <MapPin className="h-3.5 w-3.5 text-primary" />
                          <span>{question.location}</span>
                        </div>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`rounded-xl h-7 sm:h-8 text-xs ${bookmarked ? "text-primary bg-primary/10" : "hover:bg-muted"}`}
                        onClick={handleBookmark}
                      >
                        <Bookmark className={`h-3.5 sm:h-4 w-3.5 sm:w-4 ml-1 ${bookmarked ? "fill-current" : ""}`} />
                        <span className="hidden xs:inline">{bookmarked ? "محفوظ" : "حفظ"}</span>
                      </Button>
                      <Button variant="ghost" size="sm" className="rounded-xl h-7 sm:h-8 hover:bg-muted text-xs" onClick={handleShare}>
                        <Share2 className="h-3.5 sm:h-4 w-3.5 sm:w-4 ml-1" />
                        <span className="hidden xs:inline">مشاركة</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Answers Header */}
          <div className="flex items-center justify-between">
            <h2 className="font-bold flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base text-foreground">
              <MessageSquare className="h-4 sm:h-5 w-4 sm:w-5 text-secondary" />
              {answers.length} إجابات من الخبراء والأعضاء
              {isAnswersLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground ml-1" />}
            </h2>
            <div className="flex items-center gap-2">
              <SortAsc className="h-3.5 w-3.5 text-muted-foreground" />
              <select
                value={sortMode}
                onChange={(e) => setSortMode(e.target.value as SortMode)}
                className="text-[10px] sm:text-xs text-muted-foreground bg-muted rounded-lg px-2 py-1 sm:py-1.5 border-0 outline-none cursor-pointer"
              >
                <option value="newest">الأحدث</option>
                <option value="votes">الأعلى تصويتاً</option>
              </select>
            </div>
          </div>

          {/* Answer Cards Stream */}
          <div className="space-y-4">
            <AnimatePresence>
              {answers.map((answer, idx) => (
                <motion.div
                  key={answer.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ delay: idx * 0.06 }}
                >
                  <Card
                    className={`overflow-hidden premium-glass-card transition-all duration-300 border border-border/30 ${
                      bestAnswerId === answer.id ? "ring-2 ring-secondary/50 shadow-secondary/15" : ""
                    }`}
                    style={{ borderRadius: "var(--radius-lg)" }}
                  >
                    {bestAnswerId === answer.id && (
                      <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-1.5 sm:py-2 bg-secondary/10 text-secondary text-[10px] sm:text-xs font-semibold border-b border-secondary/20">
                        <Check className="h-3 sm:h-3.5 w-3 sm:w-3.5" />
                        أفضل إجابة نموذجية معتمدة
                      </div>
                    )}
                    <div className="p-3 sm:p-5">
                      <div className="flex gap-2 sm:gap-4">
                        <div className="shrink-0">
                          <VoteButtons
                            votes={answer.votes}
                            userVote={userVotes[answer.id]}
                            onVote={(dir) => voteAnswer(answer.id, dir)}
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="prose-arabic text-foreground mb-3 sm:mb-4 text-sm sm:text-base leading-relaxed whitespace-pre-line">
                            {answer.content}
                          </p>

                          {/* Answer Attachments */}
                          {(answer.images && answer.images.length > 0 || answer.locationDetail || answer.links && answer.links.length > 0) && (
                            <div className="mt-3 p-3.5 bg-muted/10 border border-border/20 rounded-xl space-y-3 mb-4">
                              <span className="text-[11px] font-bold text-foreground block">إثباتات ومرفقات مع الإجابة:</span>

                              {answer.images && answer.images.length > 0 && (
                                <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
                                  {answer.images.map((img, i) => (
                                    <div key={i} className="group relative h-16 rounded-lg overflow-hidden border border-border/40 cursor-zoom-in">
                                      <img src={img} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300" alt="Answer proof" />
                                    </div>
                                  ))}
                                </div>
                              )}

                              {answer.locationDetail && (
                                <div className="p-2.5 bg-card border border-primary/20 rounded-lg flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-2 min-w-0">
                                    <MapPin className="h-4 w-4 text-primary shrink-0" />
                                    <div className="min-w-0">
                                      <span className="text-xs font-semibold text-foreground block truncate">{answer.locationDetail.name}</span>
                                      {answer.locationDetail.address && (
                                        <span className="text-[9px] text-muted-foreground block truncate">{answer.locationDetail.address}</span>
                                      )}
                                    </div>
                                  </div>
                                  <Button size="sm" variant="ghost" className="h-7 text-[9px] text-primary shrink-0"
                                    onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(answer.locationDetail?.name ?? "")}`, "_blank")}>
                                    <ExternalLink className="h-3 w-3 ml-1" />
                                    خرائط جوجل
                                  </Button>
                                </div>
                              )}

                              {answer.links && answer.links.length > 0 && (
                                <div className="flex flex-wrap gap-1.5">
                                  {answer.links.map((link, i) => (
                                    <a
                                      key={i}
                                      href={link.url}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-card border border-border/30 rounded-lg text-xs font-semibold text-foreground hover:text-primary transition-colors"
                                    >
                                      <Globe className="h-3 w-3 text-primary shrink-0" />
                                      <span>{link.title}</span>
                                    </a>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}

                          {/* Verification Badge */}
                          {answer.verified && (
                            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 bg-secondary/10 text-secondary rounded-xl text-[10px] sm:text-xs font-medium mb-3 sm:mb-4 verified-glow">
                              <Camera className="h-3 sm:h-3.5 w-3 sm:w-3.5" />
                              <span className="hidden xs:inline">{answer.verified.label}</span>
                              <Check className="h-3 sm:h-3.5 w-3 sm:w-3.5" />
                            </div>
                          )}

                          <Separator className="mb-2 sm:mb-3" />

                          <div className="flex items-center justify-between flex-wrap gap-2">
                            {/* Answer Author */}
                            <Link
                              to={`/profile/${(answer.author as any).username || answer.author_id}`}
                              className="flex items-center gap-1.5 sm:gap-2 hover:opacity-80 transition-opacity"
                            >
                              <Avatar className="h-6 w-6 sm:h-7 sm:w-7">
                                <AvatarImage src={(answer.author as any).avatar_url ?? (answer.author as any).avatar} />
                                <AvatarFallback className="bg-primary text-white text-[9px] sm:text-[10px] font-bold">
                                  {answer.author.name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-[11px] sm:text-xs font-semibold text-foreground">{answer.author.name}</p>
                                <p className="text-[9px] sm:text-[10px] text-muted-foreground font-numbers">
                                  {formatTimestamp(answer.created_at)} · {answer.author.reputation.toLocaleString("ar-SA")} نقطة
                                </p>
                              </div>
                            </Link>

                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2 text-xs rounded-lg hover:bg-muted"
                                onClick={() => setShowComments(p => ({ ...p, [answer.id]: !p[answer.id] }))}
                              >
                                <MessageSquare className="h-3.5 w-3.5 ml-1" />
                                {answer.comments.length} تعليق
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2 text-xs rounded-lg hover:bg-muted"
                                onClick={() => toast.info("تم الإبلاغ عن الإجابة")}
                              >
                                <Flag className="h-3.5 w-3.5 text-muted-foreground" />
                              </Button>
                              {/* Only question author can accept */}
                              {isQuestionAuthor && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className={`h-7 px-2 text-xs rounded-lg ${bestAnswerId === answer.id ? "text-secondary bg-secondary/10" : "hover:bg-muted"}`}
                                  onClick={() => handleToggleBestAnswer(answer.id)}
                                >
                                  <ThumbsUp className="h-3.5 w-3.5 ml-1" />
                                  {bestAnswerId === answer.id ? "المفضلة ✓" : "تعيين أفضل إجابة"}
                                </Button>
                              )}
                            </div>
                          </div>

                          {/* Comments Panel */}
                          <AnimatePresence>
                            {showComments[answer.id] && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.2 }}
                                className="mt-4 pr-4 border-r-2 border-border/60 space-y-4 overflow-hidden"
                              >
                                {/* Comments List */}
                                {answer.comments.length > 0 ? (
                                  <div className="space-y-3">
                                    {answer.comments.map((c) => {
                                      const commentAuthor = typeof c.author === "object" ? c.author : null;
                                      return (
                                        <div key={c.id} className="text-sm bg-muted/20 p-2.5 rounded-xl border border-border/25">
                                          <p className="text-foreground leading-relaxed font-medium">{c.content}</p>

                                          {/* Comment Attachments */}
                                          {(c.images && c.images.length > 0 || c.links && c.links.length > 0) && (
                                            <div className="mt-2 flex flex-wrap gap-2 items-center">
                                              {c.images?.map((img, i) => (
                                                <img key={i} src={img} className="w-10 h-10 object-cover rounded-md border border-border/40" alt="comment attached" />
                                              ))}
                                              {c.links?.map((lnk, i) => (
                                                <a key={i} href={lnk.url} target="_blank" rel="noreferrer" className="text-[10px] text-primary bg-card border border-border/30 px-2 py-0.5 rounded flex items-center gap-1 font-semibold">
                                                  <Globe className="h-3 w-3" />
                                                  {lnk.title}
                                                </a>
                                              ))}
                                            </div>
                                          )}

                                          {/* Comment Author */}
                                          <div className="flex items-center gap-1.5 mt-2">
                                            {commentAuthor && (
                                              <Avatar className="h-5 w-5">
                                                <AvatarImage src={commentAuthor.avatar_url ?? undefined} />
                                                <AvatarFallback className="bg-muted text-foreground text-[8px] font-bold">
                                                  {commentAuthor.name.charAt(0)}
                                                </AvatarFallback>
                                              </Avatar>
                                            )}
                                            <p className="text-[10px] text-muted-foreground font-numbers">
                                              بواسطة:{" "}
                                              {commentAuthor ? (
                                                <Link
                                                  to={`/profile/${commentAuthor.username || commentAuthor.id}`}
                                                  className="font-bold text-foreground hover:text-primary transition-colors"
                                                >
                                                  {commentAuthor.name}
                                                </Link>
                                              ) : (
                                                <strong className="text-foreground">{String(c.author)}</strong>
                                              )}
                                              {" · "}{formatTimestamp(c.timestamp)}
                                            </p>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                ) : (
                                  <p className="text-xs text-muted-foreground pr-1">لا توجد تعليقات بعد، كن أول من يضيف تعليقاً!</p>
                                )}

                                {/* Comment Input */}
                                {currentUserId ? (
                                  <div className="bg-glass-bg/10 border border-border/30 rounded-xl p-2.5 mt-2 space-y-2">
                                    <div className="flex gap-2">
                                      <Input
                                        placeholder="اكتب تعليقك التوضيحي هنا..."
                                        value={commentContent[answer.id] || ""}
                                        onChange={(e) => setCommentContent({ ...commentContent, [answer.id]: e.target.value })}
                                        onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmitComment(answer.id); } }}
                                        className="h-9 text-xs rounded-lg border-border/50 bg-background/30 flex-1"
                                      />
                                      <Button
                                        size="sm"
                                        onClick={() => handleSubmitComment(answer.id)}
                                        disabled={!(commentContent[answer.id] || "").trim() || submittingComment[answer.id]}
                                        className="h-9 w-9 p-0 rounded-lg bg-primary hover:bg-primary-hover text-white shrink-0"
                                      >
                                        {submittingComment[answer.id]
                                          ? <Loader2 className="h-4 w-4 animate-spin" />
                                          : <Send className="h-4 w-4" />
                                        }
                                      </Button>
                                    </div>

                                    {/* Comment link attachment */}
                                    <div className="flex items-center gap-2 pt-1 border-t border-border/20 justify-between">
                                      <div className="flex items-center gap-2">
                                        <button
                                          type="button"
                                          onClick={() => setShowCommentAttachPanel({
                                            ...showCommentAttachPanel,
                                            [answer.id]: showCommentAttachPanel[answer.id] === "links" ? "none" : "links"
                                          })}
                                          className={`p-1 rounded transition-colors ${
                                            showCommentAttachPanel[answer.id] === "links" ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-primary hover:bg-muted/40"
                                          }`}
                                          title="إرفاق رابط بالتعليق"
                                        >
                                          <Link2 className="h-3.5 w-3.5" />
                                        </button>
                                      </div>
                                      <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground font-numbers">
                                        {(commentLinks[answer.id] || []).length > 0 && (
                                          <span className="inline-flex items-center gap-1">
                                            <Link2 className="h-3 w-3" aria-hidden />
                                            {(commentLinks[answer.id] || []).length} رابط
                                          </span>
                                        )}
                                      </div>
                                    </div>

                                    {/* Comment Links Form */}
                                    {showCommentAttachPanel[answer.id] === "links" && (
                                      <div className="bg-card border border-border/30 p-2 rounded-lg space-y-2 text-xs">
                                        <div className="grid grid-cols-2 gap-2">
                                          <Input placeholder="عنوان الرابط" value={commLinkTitle} onChange={(e) => setCommLinkTitle(e.target.value)} className="h-7 text-[10px] rounded" />
                                          <Input placeholder="https://" value={commLinkUrl} onChange={(e) => setCommLinkUrl(e.target.value)} className="h-7 text-[10px] rounded text-left" dir="ltr" />
                                        </div>
                                        <Button size="sm" className="h-7 text-[10px] bg-primary hover:bg-primary-hover text-white w-full" onClick={() => handleAddCommentLink(answer.id)}>
                                          إضافة الرابط للتعليق
                                        </Button>
                                      </div>
                                    )}

                                    {/* Comment Links Preview */}
                                    {(commentLinks[answer.id] || []).length > 0 && (
                                      <div className="flex gap-1 flex-wrap pt-1">
                                        {(commentLinks[answer.id] || []).map((link, i) => (
                                          <Badge key={i} variant="outline" className="text-[9px] rounded-lg px-2 py-0.5 bg-muted/40 pr-1 gap-1">
                                            {link.title}
                                            <button type="button" onClick={() => handleRemoveCommentLink(answer.id, i)} className="text-destructive font-bold">×</button>
                                          </Badge>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2 py-2 text-xs text-muted-foreground">
                                    <LogIn className="h-3.5 w-3.5" />
                                    <Link to="/login" className="text-primary hover:underline font-medium">سجّل دخولك</Link>
                                    <span>للمشاركة في النقاش</span>
                                  </div>
                                )}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Empty state */}
            {!isAnswersLoading && answers.length === 0 && (
              <div className="text-center py-10 text-muted-foreground">
                <MessageCircle className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm font-medium">لم يتم الإجابة على هذا السؤال بعد</p>
                <p className="text-xs mt-1">كن أول من يشارك معرفته!</p>
              </div>
            )}
          </div>

          {/* Write Answer Card */}
          <div ref={writeCardRef}>
            <Card className="p-5 sm:p-6 premium-glass-card relative overflow-hidden border border-border/30" style={{ borderRadius: "var(--radius-lg)" }}>
              <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-primary/5 blur-xl pointer-events-none" />
              <h3 className="font-bold mb-3.5 flex items-center gap-2 relative z-10 font-heading text-foreground">
                <PenSquare className="h-5 w-5 text-primary" />
                صغ إجابتك النموذجية الموثقة
              </h3>

            {!currentUserId ? (
              /* Auth gate */
              <div className="flex flex-col items-center py-8 gap-4 text-center">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                  <LogIn className="h-7 w-7 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground mb-1">يجب تسجيل الدخول للإجابة</p>
                  <p className="text-xs text-muted-foreground">انضم للمجتمع وشارك معرفتك</p>
                </div>
                <div className="flex gap-3">
                  <Button onClick={() => navigate("/login")} className="bg-primary hover:bg-primary-hover text-white rounded-xl">
                    تسجيل الدخول
                  </Button>
                  <Button variant="outline" onClick={() => navigate("/register")} className="rounded-xl">
                    إنشاء حساب
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="input-glow rounded-xl mb-3">
                  <Textarea
                    id="answer-box"
                    placeholder="شارك معرفتك وساعد الآخرين... كن واضحاً ومفصلاً ومستنداً لصور أو روابط إثبات أو موقع جغرافي."
                    value={newAnswer}
                    onChange={(e) => setNewAnswer(e.target.value)}
                    className="min-h-[140px] rounded-xl bg-muted/40 border border-border/40 focus:ring-1 focus:ring-primary resize-none p-3 text-sm leading-relaxed"
                    maxLength={5000}
                  />
                </div>

                {/* Attachment Bar */}
                <div className="border border-border/30 bg-muted/15 rounded-xl p-3 mb-4 space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-xs font-bold text-foreground">إرفاق مستندات أو إثباتات مع الإجابة (اختياري):</span>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => setShowAnswerAttachPanel(showAnswerAttachPanel === "images" ? "none" : "images")}
                        className={`p-1.5 rounded-lg border flex items-center gap-1 text-[10px] font-semibold transition-colors ${
                          showAnswerAttachPanel === "images" ? "bg-primary text-white border-primary" : "border-border/60 hover:bg-muted/40 text-muted-foreground"
                        }`}
                      >
                        <ImageIcon className="h-3.5 w-3.5" />
                        صور ({answerImageFiles.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAnswerAttachPanel(showAnswerAttachPanel === "location" ? "none" : "location")}
                        className={`p-1.5 rounded-lg border flex items-center gap-1 text-[10px] font-semibold transition-colors ${
                          showAnswerAttachPanel === "location" ? "bg-primary text-white border-primary" : "border-border/60 hover:bg-muted/40 text-muted-foreground"
                        }`}
                      >
                        <MapPin className="h-3.5 w-3.5" />
                        موقع جغرافي
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAnswerAttachPanel(showAnswerAttachPanel === "links" ? "none" : "links")}
                        className={`p-1.5 rounded-lg border flex items-center gap-1 text-[10px] font-semibold transition-colors ${
                          showAnswerAttachPanel === "links" ? "bg-primary text-white border-primary" : "border-border/60 hover:bg-muted/40 text-muted-foreground"
                        }`}
                      >
                        <Link2 className="h-3.5 w-3.5" />
                        رابط مرجعي ({answerLinks.length})
                      </button>
                    </div>
                  </div>

                  {/* Image panel */}
                  {showAnswerAttachPanel === "images" && (
                    <div className="pt-2 border-t border-border/20 space-y-3">
                      <input
                        ref={answerFileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleAnswerFileChange}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-8 text-[10px] border-primary/20 text-primary gap-1.5"
                        onClick={() => answerFileInputRef.current?.click()}
                        disabled={answerImageFiles.length >= 4}
                      >
                        <Upload className="h-3.5 w-3.5" />
                        {answerImageFiles.length >= 4 ? "وصلت للحد الأقصى (4 صور)" : "رفع صورة من جهازك"}
                      </Button>
                      {answerImagePreviews.length > 0 && (
                        <div className="flex gap-1.5 flex-wrap">
                          {answerImagePreviews.map((preview, i) => (
                            <div key={i} className="relative group/img h-14 w-14 rounded border overflow-hidden">
                              <img src={preview} className="w-full h-full object-cover" alt="attached preview" />
                              <button type="button" onClick={() => handleRemoveAnswerImage(i)} className="absolute top-0.5 right-0.5 bg-destructive text-white rounded-full p-0.5 opacity-0 group-hover/img:opacity-100 transition-opacity">
                                <X className="h-2.5 w-2.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Location panel */}
                  {showAnswerAttachPanel === "location" && (
                    <div className="pt-2 border-t border-border/20 space-y-3 text-xs">
                      <p className="text-[10px] text-muted-foreground">
                        ابحث عن المكان أو انقر على الخريطة لتثبيت الموقع الجغرافي الدقيق لإثبات الإجابة ميدانياً:
                      </p>

                      <LeafletMapPicker
                        locationDetail={answerLocation}
                        onLocationChange={(loc) => {
                          setAnswerLocation(loc);
                          setAnsLocName(loc.name);
                          setAnsLocAddress(loc.address ?? "");
                        }}
                      />

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                        <div className="space-y-1">
                          <Label className="text-[10px]">اسم المعلم أو المكان</Label>
                          <Input
                            placeholder="مثال: مستشفى التخصصي"
                            value={ansLocName}
                            onChange={(e) => {
                              setAnsLocName(e.target.value);
                              setAnswerLocation(prev => prev ? { ...prev, name: e.target.value } : { name: e.target.value });
                            }}
                            className="h-8 text-xs bg-background/30"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[10px]">العنوان</Label>
                          <Input
                            placeholder="حي الياسمين، الرياض"
                            value={ansLocAddress}
                            onChange={(e) => {
                              setAnsLocAddress(e.target.value);
                              setAnswerLocation(prev => prev ? { ...prev, address: e.target.value } : { name: ansLocName, address: e.target.value });
                            }}
                            className="h-8 text-xs bg-background/30"
                          />
                        </div>
                      </div>

                      {answerLocation && (
                        <div className="flex gap-2 justify-between items-center mt-2 p-2 bg-primary/5 border border-primary/20 rounded-xl">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <MapPin className="h-4 w-4 text-primary shrink-0" />
                            <div className="min-w-0">
                              <span className="font-bold text-xs text-foreground block truncate">{answerLocation.name}</span>
                              {answerLocation.address && <span className="text-[10px] text-muted-foreground block truncate">{answerLocation.address}</span>}
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-[10px] text-destructive hover:bg-destructive/5 shrink-0"
                            onClick={handleRemoveAnswerLocation}
                          >
                            إزالة الموقع
                          </Button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Links panel */}
                  {showAnswerAttachPanel === "links" && (
                    <div className="pt-2 border-t border-border/20 space-y-2 text-xs">
                      <div className="grid grid-cols-2 gap-2">
                        <Input placeholder="عنوان الرابط (مثال: الموقع الرسمي)" value={ansLinkTitle} onChange={(e) => setAnsLinkTitle(e.target.value)} className="h-8 text-xs bg-background/30" />
                        <Input placeholder="رابط URL (https://...)" value={ansLinkUrl} onChange={(e) => setAnsLinkUrl(e.target.value)} className="h-8 text-xs bg-background/30 text-left" dir="ltr" />
                      </div>
                      <Button type="button" size="sm" className="h-8 text-[10px] bg-primary hover:bg-primary-hover text-white" onClick={handleAddAnswerLink}>
                        إضافة الرابط
                      </Button>
                      {answerLinks.length > 0 && (
                        <div className="space-y-1 mt-1.5">
                          {answerLinks.map((lnk, i) => (
                            <div key={i} className="flex justify-between items-center bg-card p-1.5 rounded border border-border/30">
                              <span className="font-semibold truncate text-[10px]">{lnk.title} — <span className="text-muted-foreground">{lnk.url}</span></span>
                              <button type="button" onClick={() => handleRemoveAnswerLink(i)} className="text-destructive font-bold ml-2">×</button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Submit Row */}
                <div className="flex items-center justify-between relative z-10">
                  <p className="text-xs text-muted-foreground font-numbers">
                    <span className={newAnswer.length > 4500 ? "text-destructive font-medium" : ""}>{newAnswer.length}</span>/5000 حرف
                  </p>
                  <Button
                    className="rounded-xl bg-primary hover:bg-primary-hover text-white shadow-sm font-bold gap-2"
                    disabled={newAnswer.length < 10 || isSubmittingAnswer}
                    onClick={handleSubmitAnswer}
                  >
                    {isSubmittingAnswer ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        جاري النشر...
                      </>
                    ) : (
                      "نشر الإجابة الموثقة"
                    )}
                  </Button>
                </div>
              </>
            )}
          </Card>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="hidden md:flex flex-col gap-4">
          {/* Question Stats */}
          <Card className="p-5 premium-glass-card border border-border/30" style={{ borderRadius: "var(--radius-lg)" }}>
            <h3 className="font-semibold mb-4 text-sm font-heading text-foreground">إحصائيات السؤال</h3>
            {[
              { label: "المشاهدات", value: question.views || 0 },
              { label: "الإجابات", value: answers.length },
              { label: "التصويتات", value: question.votes },
            ].map((s) => (
              <div key={s.label} className="flex justify-between items-center py-2 border-b border-border/30 last:border-0">
                <span className="text-sm text-muted-foreground">{s.label}</span>
                <span className="font-bold font-numbers text-foreground">{s.value}</span>
              </div>
            ))}
          </Card>

          {/* Question Author card */}
          <Card className="p-5 premium-glass-card border border-border/30" style={{ borderRadius: "var(--radius-lg)" }}>
            <h3 className="font-semibold mb-3 text-sm font-heading text-foreground">صاحب السؤال</h3>
            <Link
              to={`/profile/${(question.author as any).username || question.author_id}`}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <Avatar className="h-10 w-10">
                <AvatarImage src={(question.author as any).avatar_url ?? (question.author as any).avatar} />
                <AvatarFallback className="bg-primary text-white font-bold">{question.author.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-semibold text-foreground">{question.author.name}</p>
                <p className="text-xs text-muted-foreground font-numbers">{question.author.reputation.toLocaleString("ar-SA")} نقطة</p>
              </div>
            </Link>
          </Card>

          {/* Tags */}
          <Card className="p-5 premium-glass-card border border-border/30" style={{ borderRadius: "var(--radius-lg)" }}>
            <h3 className="font-semibold mb-3 text-sm font-heading text-foreground">الوسوم</h3>
            <div className="flex flex-wrap gap-2">
              {question.tags.map((tag) => {
                const tagStr = typeof tag === "string" ? tag : (tag as any).name;
                return (
                  <Link key={tagStr} to={`/tags/${encodeURIComponent(tagStr)}`}>
                    <Badge variant="secondary" className="rounded-full text-primary text-xs px-3 py-1 bg-muted/40 border border-border/20 hover:border-primary/30 hover:bg-primary/5 hover:text-primary transition-all duration-300 font-medium tag-pill cursor-pointer">
                      #{tagStr}
                    </Badge>
                  </Link>
                );
              })}
            </div>
          </Card>
        </aside>
      </div>

      {/* Mobile sticky CTA */}
      {!isWriteCardVisible && (
        <div className="fixed bottom-16 inset-x-0 bg-card/95 backdrop-blur-sm border-t border-border p-3 md:hidden z-30">
          {currentUserId ? (
            <Button
              className="w-full rounded-xl h-11 bg-primary hover:bg-primary-hover text-white"
              onClick={() => document.getElementById("answer-box")?.focus()}
            >
              <PenSquare className="h-4 w-4 ml-2" />
              اكتب إجابة موثقة
            </Button>
          ) : (
            <Button
              className="w-full rounded-xl h-11 bg-primary hover:bg-primary-hover text-white"
              onClick={() => navigate("/login")}
            >
              <LogIn className="h-4 w-4 ml-2" />
              سجّل دخولك للإجابة
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
