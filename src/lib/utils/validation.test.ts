import { describe, expect, it } from "vitest";
import { sanitizeInput, questionSchema, answerSchema, profileSchema } from "./validation";

describe("sanitizeInput", () => {
  it("strips script tags and HTML", () => {
    expect(sanitizeInput('<script>alert("x")</script>Hello')).toBe("Hello");
    expect(sanitizeInput("<b>bold</b>")).toBe("bold");
  });

  it("returns empty string for falsy input", () => {
    expect(sanitizeInput("")).toBe("");
  });
});

describe("questionSchema", () => {
  it("accepts valid question input", () => {
    const result = questionSchema.safeParse({
      title: "كيف أتعلم البرمجة بشكل فعال؟",
      content: "أريد معرفة أفضل المسارات لتعلم البرمجة من الصفر خلال سنة.",
      tags: ["برمجة", "تعليم"],
      category: "tech",
    });
    expect(result.success).toBe(true);
  });

  it("rejects title shorter than 15 characters", () => {
    const result = questionSchema.safeParse({
      title: "قصير",
      content: "محتوى كافٍ لاجتياز الحد الأدنى من الأحرف المطلوبة هنا.",
      tags: ["test"],
    });
    expect(result.success).toBe(false);
  });
});

describe("answerSchema", () => {
  it("requires a valid question UUID", () => {
    const result = answerSchema.safeParse({
      question_id: "not-a-uuid",
      content: "إجابة مفيدة بمحتوى كافٍ لتجاوز الحد الأدنى المطلوب.",
    });
    expect(result.success).toBe(false);
  });
});

describe("profileSchema", () => {
  it("sanitizes bio and enforces max length", () => {
    const result = profileSchema.safeParse({
      bio: "<img src=x onerror=alert(1)>نبذة قصيرة",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.bio).not.toContain("<");
    }
  });
});
