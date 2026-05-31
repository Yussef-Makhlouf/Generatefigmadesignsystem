// ============================================================
// Supabase Edge Function: send-notification
// Implements secure notification dispatch with Zod validation
// ============================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.42.0"
import { z } from "https://deno.land/x/zod@v3.22.4/index.ts"

// CORS headers for browser compatibility
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
}

// Zod schema matching database.types.ts Notification fields
const NotificationSchema = z.object({
  user_id: z.string().uuid({ message: "Invalid user_id: must be a valid UUID" }),
  type: z.enum(
    ["like", "answer", "comment", "follow", "review", "system", "achievement"],
    { errorMap: () => ({ message: "Invalid notification type" }) }
  ),
  title: z.string().min(1, { message: "Title is required and cannot be empty" }),
  content: z.string().min(1, { message: "Content is required and cannot be empty" }),
  notification_data: z.record(z.any()).optional().default({}),
  action_url: z.string().nullable().optional(),
  priority: z.enum(["low", "normal", "high", "urgent"]).optional().default("normal")
});

serve(async (req) => {
  // 1. Handle CORS Preflight OPTIONS requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  // 2. Enforce POST method only
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: `Method ${req.method} not allowed` }),
      {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    )
  }

  try {
    // 3. Security Check — Enforce Authentication
    const authHeader = req.headers.get("Authorization")
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing Authorization header" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      )
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? ""
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? ""

    if (!supabaseUrl) {
      throw new Error("SUPABASE_URL env variable is not set")
    }

    // Verify caller is either an admin/service account OR a valid authenticated user
    let isAuthorized = false
    const token = authHeader.replace("Bearer ", "").trim()

    if (supabaseServiceKey && token === supabaseServiceKey) {
      isAuthorized = true
    } else {
      // Validate the user's JWT token
      const userClient = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: authHeader } },
        auth: { persistSession: false }
      })
      
      const { data: { user }, error: authError } = await userClient.auth.getUser()
      if (!authError && user) {
        isAuthorized = true
      }
    }

    if (!isAuthorized) {
      return new Response(
        JSON.stringify({ error: "Unauthorized access: invalid token or key" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      )
    }

    // 4. Parse & Validate Body using Zod
    const body = await req.json().catch(() => ({}))
    const parsed = NotificationSchema.safeParse(body)

    if (!parsed.success) {
      return new Response(
        JSON.stringify({
          error: "Validation failed",
          details: parsed.error.flatten().fieldErrors,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      )
    }

    const payload = parsed.data

    // 5. Insert notification record using the high-privilege service client
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false }
    })

    const { data: notification, error: dbError } = await supabaseAdmin
      .from("notifications")
      .insert({
        user_id: payload.user_id,
        type: payload.type,
        title: payload.title,
        content: payload.content,
        notification_data: payload.notification_data,
        action_url: payload.action_url ?? null,
        priority: payload.priority,
        is_read: false
      })
      .select()
      .single()

    if (dbError) {
      console.error("Database Insert Error:", dbError)
      return new Response(
        JSON.stringify({ error: "Failed to save notification to database", details: dbError.message }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      )
    }

    // 6. Return Success Response
    return new Response(
      JSON.stringify({
        success: true,
        message: "Notification created successfully",
        data: notification
      }),
      {
        status: 201,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    )

  } catch (err: any) {
    console.error("Unexpected Edge Function Error:", err)
    return new Response(
      JSON.stringify({ error: "Internal Server Error", details: err.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    )
  }
})
