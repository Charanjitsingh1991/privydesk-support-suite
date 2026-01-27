import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-api-key",
  "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
};

interface ApiKeyInfo {
  api_key_id: string;
  organization_id: string;
  permissions: string[];
  rate_limit: number;
}

interface RateLimitInfo {
  allowed: boolean;
  remaining: number;
  reset_at: string;
}

interface WebhookConfigRow {
  id: string;
  url: string;
  secret: string;
  events: string[];
  failure_count: number;
}

// Parse API key from Authorization header
function extractApiKey(req: Request): string | null {
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }
  return req.headers.get("x-api-key");
}

// Create error response
function errorResponse(
  code: string,
  message: string,
  status: number,
  details?: Record<string, string>
): Response {
  return new Response(
    JSON.stringify({
      error: { code, message, details },
    }),
    {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    }
  );
}

// Create success response
function jsonResponse(data: unknown, status = 200, extraHeaders: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json", ...extraHeaders },
  });
}

// Parse route from URL
function parseRoute(url: URL): { resource: string; id?: string; subResource?: string } {
  const pathParts = url.pathname.replace("/api-v1", "").split("/").filter(Boolean);
  return {
    resource: pathParts[0] || "",
    id: pathParts[1],
    subResource: pathParts[2],
  };
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const startTime = Date.now();

  // Initialize Supabase client with service role for API operations
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Extract and validate API key
  const apiKey = extractApiKey(req);
  if (!apiKey) {
    return errorResponse("UNAUTHORIZED", "API key is required", 401);
  }

  // Validate API key
  const { data: keyData, error: keyError } = await supabase
    .rpc("validate_api_key", { p_api_key: apiKey });

  if (keyError || !keyData || keyData.length === 0) {
    return errorResponse("UNAUTHORIZED", "Invalid or expired API key", 401);
  }

  const apiKeyInfo: ApiKeyInfo = keyData[0];
  const { api_key_id, organization_id, permissions, rate_limit } = apiKeyInfo;

  // Check rate limit
  const { data: rateLimitData } = await supabase
    .rpc("check_api_rate_limit", { 
      p_api_key_id: api_key_id, 
      p_rate_limit: rate_limit 
    });

  const rateLimitInfo: RateLimitInfo = rateLimitData?.[0] || { allowed: true, remaining: rate_limit, reset_at: new Date().toISOString() };

  if (!rateLimitInfo.allowed) {
    return errorResponse("RATE_LIMIT_EXCEEDED", "Too many requests", 429, {
      retry_after: rateLimitInfo.reset_at,
    });
  }

  const rateLimitHeaders = {
    "X-RateLimit-Limit": rate_limit.toString(),
    "X-RateLimit-Remaining": rateLimitInfo.remaining.toString(),
    "X-RateLimit-Reset": rateLimitInfo.reset_at,
  };

  // Parse route
  const { resource, id, subResource } = parseRoute(url);

  // Permission check helper
  const hasPermission = (scope: string): boolean => {
    return permissions.includes(scope) || permissions.includes("*");
  };

  let response: Response;
  let statusCode = 200;

  try {
    switch (resource) {
      case "tickets": {
        if (subResource === "messages" && id) {
          // Messages endpoints
          if (req.method === "GET") {
            if (!hasPermission("read:tickets")) {
              return errorResponse("FORBIDDEN", "Insufficient permissions", 403);
            }
            const { data, error } = await supabase
              .from("messages")
              .select("*")
              .eq("ticket_id", id)
              .order("created_at", { ascending: true });
            
            if (error) throw error;
            response = jsonResponse(data, 200, rateLimitHeaders);
          } else if (req.method === "POST") {
            if (!hasPermission("write:tickets")) {
              return errorResponse("FORBIDDEN", "Insufficient permissions", 403);
            }
            const body = await req.json();
            const { data, error } = await supabase
              .from("messages")
              .insert({
                ticket_id: id,
                content: body.content,
                is_internal: body.is_internal || false,
                attachments: body.attachments || [],
                user_id: body.user_id,
              })
              .select()
              .single();
            
            if (error) throw error;
            statusCode = 201;
            response = jsonResponse(data, 201, rateLimitHeaders);
          } else {
            response = errorResponse("METHOD_NOT_ALLOWED", "Method not allowed", 405);
          }
        } else if (id) {
          // Single ticket operations
          if (req.method === "GET") {
            if (!hasPermission("read:tickets")) {
              return errorResponse("FORBIDDEN", "Insufficient permissions", 403);
            }
            const { data, error } = await supabase
              .from("tickets")
              .select(`
                *,
                created_by_profile:profiles!tickets_created_by_fkey(id, full_name, email, avatar_url),
                assigned_to_profile:profiles!tickets_assigned_to_fkey(id, full_name, email, avatar_url),
                messages(*)
              `)
              .eq("id", id)
              .eq("organization_id", organization_id)
              .single();
            
            if (error) throw error;
            if (!data) {
              response = errorResponse("NOT_FOUND", "Ticket not found", 404);
            } else {
              response = jsonResponse(data, 200, rateLimitHeaders);
            }
          } else if (req.method === "PATCH") {
            if (!hasPermission("write:tickets")) {
              return errorResponse("FORBIDDEN", "Insufficient permissions", 403);
            }
            const body = await req.json();
            const { data, error } = await supabase
              .from("tickets")
              .update({
                status: body.status,
                priority: body.priority,
                assigned_to: body.assigned_to,
                category: body.category,
                tags: body.tags,
                updated_at: new Date().toISOString(),
              })
              .eq("id", id)
              .eq("organization_id", organization_id)
              .select()
              .single();
            
            if (error) throw error;
            response = jsonResponse(data, 200, rateLimitHeaders);

            // Trigger webhook for ticket.updated
            await triggerWebhook(supabase, organization_id, "ticket.updated", data);
          } else if (req.method === "DELETE") {
            if (!hasPermission("delete:tickets")) {
              return errorResponse("FORBIDDEN", "Insufficient permissions", 403);
            }
            const { error } = await supabase
              .from("tickets")
              .delete()
              .eq("id", id)
              .eq("organization_id", organization_id);
            
            if (error) throw error;
            statusCode = 204;
            response = new Response(null, { status: 204, headers: { ...corsHeaders, ...rateLimitHeaders } });
          } else {
            response = errorResponse("METHOD_NOT_ALLOWED", "Method not allowed", 405);
          }
        } else {
          // Tickets collection
          if (req.method === "GET") {
            if (!hasPermission("read:tickets")) {
              return errorResponse("FORBIDDEN", "Insufficient permissions", 403);
            }
            const params = url.searchParams;
            let query = supabase
              .from("tickets")
              .select(`
                *,
                created_by_profile:profiles!tickets_created_by_fkey(id, full_name, email),
                assigned_to_profile:profiles!tickets_assigned_to_fkey(id, full_name, email)
              `)
              .eq("organization_id", organization_id);

            if (params.get("status")) {
              query = query.eq("status", params.get("status"));
            }
            if (params.get("priority")) {
              query = query.eq("priority", params.get("priority"));
            }
            if (params.get("assigned_to")) {
              query = query.eq("assigned_to", params.get("assigned_to"));
            }
            if (params.get("created_after")) {
              query = query.gte("created_at", params.get("created_after"));
            }

            const limit = Math.min(parseInt(params.get("limit") || "25"), 100);
            const page = parseInt(params.get("page") || "1");
            const offset = (page - 1) * limit;

            query = query.order("created_at", { ascending: false }).range(offset, offset + limit - 1);

            const { data, error, count } = await query;
            if (error) throw error;

            response = jsonResponse({
              data,
              pagination: {
                page,
                limit,
                total: count,
              },
            }, 200, rateLimitHeaders);
          } else if (req.method === "POST") {
            if (!hasPermission("write:tickets")) {
              return errorResponse("FORBIDDEN", "Insufficient permissions", 403);
            }
            const body = await req.json();
            const { data, error } = await supabase
              .from("tickets")
              .insert({
                organization_id,
                subject: body.subject,
                description: body.description,
                priority: body.priority || "medium",
                category: body.category,
                created_by: body.client_id,
                assigned_to: body.assigned_to,
                tags: body.tags || [],
              })
              .select()
              .single();
            
            if (error) throw error;
            statusCode = 201;
            response = jsonResponse(data, 201, rateLimitHeaders);

            // Trigger webhook for ticket.created
            await triggerWebhook(supabase, organization_id, "ticket.created", data);
          } else {
            response = errorResponse("METHOD_NOT_ALLOWED", "Method not allowed", 405);
          }
        }
        break;
      }

      case "users": {
        if (id) {
          if (req.method === "GET") {
            if (!hasPermission("read:users")) {
              return errorResponse("FORBIDDEN", "Insufficient permissions", 403);
            }
            const { data, error } = await supabase
              .from("profiles")
              .select("id, email, full_name, role, avatar_url, is_active, created_at")
              .eq("id", id)
              .eq("organization_id", organization_id)
              .single();
            
            if (error) throw error;
            response = jsonResponse(data, 200, rateLimitHeaders);
          } else if (req.method === "PATCH") {
            if (!hasPermission("write:users")) {
              return errorResponse("FORBIDDEN", "Insufficient permissions", 403);
            }
            const body = await req.json();
            const { data, error } = await supabase
              .from("profiles")
              .update({
                full_name: body.name,
                role: body.role,
                is_active: body.is_active,
              })
              .eq("id", id)
              .eq("organization_id", organization_id)
              .select()
              .single();
            
            if (error) throw error;
            response = jsonResponse(data, 200, rateLimitHeaders);
          } else {
            response = errorResponse("METHOD_NOT_ALLOWED", "Method not allowed", 405);
          }
        } else {
          if (req.method === "GET") {
            if (!hasPermission("read:users")) {
              return errorResponse("FORBIDDEN", "Insufficient permissions", 403);
            }
            const params = url.searchParams;
            let query = supabase
              .from("profiles")
              .select("id, email, full_name, role, avatar_url, is_active, created_at")
              .eq("organization_id", organization_id);

            if (params.get("role")) {
              query = query.eq("role", params.get("role"));
            }
            if (params.get("status") === "active") {
              query = query.eq("is_active", true);
            } else if (params.get("status") === "inactive") {
              query = query.eq("is_active", false);
            }

            const limit = Math.min(parseInt(params.get("limit") || "25"), 100);
            const page = parseInt(params.get("page") || "1");
            const offset = (page - 1) * limit;

            query = query.range(offset, offset + limit - 1);

            const { data, error } = await query;
            if (error) throw error;
            response = jsonResponse(data, 200, rateLimitHeaders);
          } else {
            response = errorResponse("METHOD_NOT_ALLOWED", "Method not allowed", 405);
          }
        }
        break;
      }

      case "organization": {
        if (req.method === "GET") {
          if (!hasPermission("read:organization")) {
            return errorResponse("FORBIDDEN", "Insufficient permissions", 403);
          }
          const { data, error } = await supabase
            .from("organizations")
            .select("*")
            .eq("id", organization_id)
            .single();
          
          if (error) throw error;
          response = jsonResponse(data, 200, rateLimitHeaders);
        } else if (req.method === "PATCH") {
          if (!hasPermission("write:organization")) {
            return errorResponse("FORBIDDEN", "Insufficient permissions", 403);
          }
          const body = await req.json();
          const { data, error } = await supabase
            .from("organizations")
            .update({
              name: body.name,
              primary_color: body.primary_color,
              logo_url: body.logo_url,
            })
            .eq("id", organization_id)
            .select()
            .single();
          
          if (error) throw error;
          response = jsonResponse(data, 200, rateLimitHeaders);
        } else {
          response = errorResponse("METHOD_NOT_ALLOWED", "Method not allowed", 405);
        }
        break;
      }

      case "analytics": {
        if (!hasPermission("read:analytics")) {
          return errorResponse("FORBIDDEN", "Insufficient permissions", 403);
        }
        
        const params = url.searchParams;
        const startDate = params.get("start_date") || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
        const endDate = params.get("end_date") || new Date().toISOString();

        if (id === "tickets") {
          const { data, error } = await supabase
            .rpc("get_ticket_analytics", {
              p_organization_id: organization_id,
              p_start_date: startDate,
              p_end_date: endDate,
            });
          
          if (error) throw error;
          response = jsonResponse(data?.[0] || {}, 200, rateLimitHeaders);
        } else if (id === "performance") {
          const { data, error } = await supabase
            .rpc("get_agent_performance", {
              p_organization_id: organization_id,
              p_start_date: startDate,
              p_end_date: endDate,
            });
          
          if (error) throw error;
          response = jsonResponse(data || [], 200, rateLimitHeaders);
        } else {
          response = errorResponse("NOT_FOUND", "Analytics endpoint not found", 404);
        }
        break;
      }

      case "webhooks": {
        if (id === "test" && req.method === "POST") {
          // Test webhook endpoint
          const body = await req.json();
          response = jsonResponse({
            success: true,
            message: "Webhook test received",
            received_at: new Date().toISOString(),
            payload: body,
          }, 200, rateLimitHeaders);
        } else {
          response = errorResponse("NOT_FOUND", "Endpoint not found", 404);
        }
        break;
      }

      default:
        response = errorResponse("NOT_FOUND", "Endpoint not found", 404);
    }
  } catch (err) {
    console.error("API Error:", err);
    statusCode = 500;
    const errorMessage = err instanceof Error ? err.message : "An internal error occurred";
    response = errorResponse("INTERNAL_ERROR", errorMessage, 500);
  }

  // Log the request
  const responseTime = Date.now() - startTime;
  await supabase.from("api_request_logs").insert({
    api_key_id,
    organization_id,
    method: req.method,
    endpoint: url.pathname,
    status_code: statusCode,
    response_time_ms: responseTime,
    ip_address: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip"),
    user_agent: req.headers.get("user-agent"),
  } as Record<string, unknown>);

  return response;
});

// Helper function to trigger webhooks
async function triggerWebhook(
  supabase: SupabaseClient,
  organizationId: string,
  event: string,
  data: unknown
) {
  try {
    // Get active webhooks for this event
    const { data: webhooksData } = await supabase
      .from("webhook_configs")
      .select("id, url, secret, events, failure_count")
      .eq("organization_id", organizationId)
      .eq("is_active", true)
      .contains("events", [event]);

    const webhooks = (webhooksData || []) as WebhookConfigRow[];
    if (webhooks.length === 0) return;

    for (const webhook of webhooks) {
      const payload = {
        event,
        timestamp: new Date().toISOString(),
        organization_id: organizationId,
        data,
      };

      // Create signature
      const encoder = new TextEncoder();
      const key = await crypto.subtle.importKey(
        "raw",
        encoder.encode(webhook.secret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
      );
      const signature = await crypto.subtle.sign(
        "HMAC",
        key,
        encoder.encode(JSON.stringify(payload))
      );
      const signatureHex = Array.from(new Uint8Array(signature))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      // Create log entry
      const { data: logEntryData } = await supabase
        .from("webhook_logs")
        .insert({
          webhook_config_id: webhook.id,
          organization_id: organizationId,
          event,
          payload,
          status: "pending",
        } as Record<string, unknown>)
        .select()
        .single();

      const logEntry = logEntryData as { id: string } | null;

      // Send webhook (fire and forget with retry logic)
      try {
        const response = await fetch(webhook.url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Webhook-Signature": signatureHex,
            "X-Webhook-Event": event,
          },
          body: JSON.stringify(payload),
        });

        await supabase
          .from("webhook_logs")
          .update({
            status: response.ok ? "success" : "failed",
            response_code: response.status,
            response_body: await response.text().catch(() => null),
            completed_at: new Date().toISOString(),
          } as Record<string, unknown>)
          .eq("id", logEntry?.id);

        // Update webhook config
        await supabase
          .from("webhook_configs")
          .update({
            last_triggered_at: new Date().toISOString(),
            failure_count: response.ok ? 0 : webhook.failure_count + 1,
          } as Record<string, unknown>)
          .eq("id", webhook.id);
      } catch (webhookError) {
        const errorMessage = webhookError instanceof Error ? webhookError.message : "Unknown error";
        await supabase
          .from("webhook_logs")
          .update({
            status: "failed",
            error_message: errorMessage,
            completed_at: new Date().toISOString(),
          } as Record<string, unknown>)
          .eq("id", logEntry?.id);

        await supabase
          .from("webhook_configs")
          .update({
            failure_count: webhook.failure_count + 1,
          } as Record<string, unknown>)
          .eq("id", webhook.id);
      }
    }
  } catch (err) {
    console.error("Webhook trigger error:", err);
  }
}
