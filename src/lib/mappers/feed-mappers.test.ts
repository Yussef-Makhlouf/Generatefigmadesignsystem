import { describe, expect, it } from "vitest";
import { mapQuestionRow, mapProfileRow } from "./feed-mappers";

describe("mapQuestionRow", () => {
  it("maps database row to UI question shape", () => {
    const row = {
      id: "q1",
      author_id: "u1",
      title: "سؤال تجريبي طويل بما يكفي",
      content: "وصف السؤال التجريبي هنا بمحتوى كافٍ.",
      category: "tech",
      location: "الرياض",
      votes_count: 5,
      answers_count: 2,
      views_count: 10,
      is_deleted: false,
      created_at: "2026-01-01T00:00:00Z",
      updated_at: "2026-01-01T00:00:00Z",
      author: { name: "أحمد", username: "ahmad", avatar_url: null, reputation: 100 },
      question_tags: [{ tags: { name: "برمجة" } }],
      question_attachments: [],
    };

    const mapped = mapQuestionRow(row);
    expect(mapped.title).toBe(row.title);
    expect(mapped.tags).toEqual(["برمجة"]);
    expect(mapped.author.name).toBe("أحمد");
    expect(mapped.votes_count).toBe(5);
  });
});

describe("mapProfileRow", () => {
  it("maps snake_case profile fields to camelCase UI fields", () => {
    const mapped = mapProfileRow({
      id: "u1",
      username: "ahmad",
      name: "أحمد",
      avatar_url: "https://example.com/a.png",
      account_type: "individual",
      created_at: "2026-01-01T00:00:00Z",
      is_verified_entity: false,
    });

    expect(mapped.accountType).toBe("individual");
    expect(mapped.avatar).toBe("https://example.com/a.png");
    expect(mapped.isVerifiedEntity).toBe(false);
  });
});
