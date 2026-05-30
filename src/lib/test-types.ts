import { createClient } from "@supabase/supabase-js";

export type Answer = {
  id: string;
  content: string;
  is_accepted: boolean;
};

export type TestDatabase = {
  public: {
    Tables: {
      answers: {
        Row: Answer;
        Insert: Partial<Answer>;
        Update: Partial<Answer>;
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

const supabase = createClient<TestDatabase>("https://test.supabase.co", "test-key");

async function test() {
  const { error } = await supabase
    .from("answers")
    .update({ is_accepted: true })
    .eq("id", "123");
}
