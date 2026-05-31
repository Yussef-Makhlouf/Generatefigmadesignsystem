import { z } from "zod";

// ============================================================
// Input Sanitization Utilities
// ============================================================

/**
 * Strips HTML tags and script elements from user inputs to prevent XSS injection.
 */
export function sanitizeInput(text: string): string {
  if (!text) return "";
  return text
    .replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, "") // Strip <script>...</script>
    .replace(/<[^>]*>/g, "")                            // Strip basic HTML brackets
    .replace(/&nbsp;/g, " ")                            // Replace non-breaking spaces
    .trim();
}

/**
 * Trims and sanitizes standard strings.
 */
const sanitizedString = (min: number, max: number, minMsg: string, maxMsg: string) =>
  z.string()
    .transform((val) => sanitizeInput(val))
    .refine((val) => val.length >= min, { message: minMsg })
    .refine((val) => val.length <= max, { message: maxMsg });

// ============================================================
// 1. Question Input Validation Schema
// ============================================================

export const questionSchema = z.object({
  title: sanitizedString(
    5,
    100,
    "العنوان يجب أن لا يقل عن 5 أحرف ليكون واضحاً",
    "العنوان طويل جداً، يرجى اختصاره إلى 100 حرف كحد أقصى"
  ),
  content: sanitizedString(
    15,
    5000,
    "تفاصيل السؤال يجب أن لا تقل عن 15 حرفاً لتوضيح استفسارك",
    "السؤال طويل جداً، يرجى اختصاره إلى 5000 حرف كحد أقصى"
  ),
  category: z.string().transform((val) => sanitizeInput(val)).optional(),
  location: z.string().transform((val) => sanitizeInput(val)).optional(),
  tags: z
    .array(z.string().transform((val) => sanitizeInput(val)))
    .min(1, "يجب إضافة وسم (Tag) واحد على الأقل للمساعدة في تصنيف سؤالك")
    .max(5, "يمكنك إضافة 5 وسوم كحد أقصى"),
  images: z.array(z.string().url("رابط الصورة المرفقة غير صالح")).optional(),
  links: z
    .array(
      z.object({
        title: z.string().transform((val) => sanitizeInput(val)),
        url: z.string().url("رابط المرجع المرفق غير صالح"),
      })
    )
    .optional(),
  locationDetail: z
    .object({
      name: z.string().transform((val) => sanitizeInput(val)),
      address: z.string().transform((val) => sanitizeInput(val)).optional(),
      lat: z.number().optional(),
      lng: z.number().optional(),
    })
    .optional(),
});

// ============================================================
// 2. Answer Input Validation Schema
// ============================================================

export const answerSchema = z.object({
  question_id: z.string().uuid("معرف السؤال الملحق غير صالح"),
  content: sanitizedString(
    10,
    8000,
    "محتوى الإجابة يجب أن لا يقل عن 10 أحرف لتقديم قيمة حقيقية للكاتب",
    "الإجابة طويلة جداً، يرجى اختصارها إلى 8000 حرف كحد أقصى"
  ),
  verified_type: z.enum(["photo", "location"]).nullable().optional(),
  images: z.array(z.string().url("رابط الصورة المرفقة غير صالح")).optional(),
  links: z
    .array(
      z.object({
        title: z.string().transform((val) => sanitizeInput(val)),
        url: z.string().url("رابط المرجع المرفق غير صالح"),
      })
    )
    .optional(),
  locationDetail: z
    .object({
      name: z.string().transform((val) => sanitizeInput(val)),
      address: z.string().transform((val) => sanitizeInput(val)).optional(),
      lat: z.number().optional(),
      lng: z.number().optional(),
    })
    .optional(),
});

// ============================================================
// 3. Profile Input Validation Schema
// ============================================================

export const profileSchema = z.object({
  name: sanitizedString(
    2,
    50,
    "الاسم الكامل يجب أن لا يقل عن حرفين",
    "الاسم الكامل يجب أن لا يتجاوز 50 حرفاً"
  ).optional(),
  bio: z
    .string()
    .transform((val) => sanitizeInput(val))
    .refine((val) => val.length <= 250, { message: "الوصف الشخصي يجب أن لا يتجاوز 250 حرفاً" })
    .optional(),
  location: z
    .string()
    .transform((val) => sanitizeInput(val))
    .refine((val) => val.length <= 100, { message: "العنوان يجب أن لا يتجاوز 100 حرف" })
    .optional()
    .nullable(),
  avatar_url: z
    .string()
    .url("رابط الصورة الشخصية غير صالح")
    .or(z.literal(""))
    .or(z.null())
    .optional(),
  business_category: z
    .string()
    .transform((val) => sanitizeInput(val))
    .optional()
    .nullable(),
  business_license: z
    .string()
    .transform((val) => sanitizeInput(val))
    .optional()
    .nullable(),
  business_address: z
    .string()
    .transform((val) => sanitizeInput(val))
    .optional()
    .nullable(),
  operating_hours: z
    .string()
    .transform((val) => sanitizeInput(val))
    .optional()
    .nullable(),
  lat: z.number().optional().nullable(),
  lng: z.number().optional().nullable(),
  settings: z.record(z.string(), z.unknown()).optional(),
});
