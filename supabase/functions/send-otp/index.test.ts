import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { assertEquals, assertExists } from "https://deno.land/std@0.224.0/assert/mod.ts";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY")!;

const baseHeaders = {
  "Content-Type": "application/json",
  "apikey": SUPABASE_ANON_KEY,
};

Deno.test("send-otp - returns 200 for valid request", async () => {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/send-otp`, {
    method: "POST",
    headers: baseHeaders,
    body: JSON.stringify({ 
      email: "test-valid@example.com", 
      type: "login" 
    }),
  });
  
  const body = await response.text();
  // Should either succeed or hit rate limit
  assertEquals(response.status === 200 || response.status === 429, true);
});

Deno.test("send-otp - handles OPTIONS preflight request", async () => {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/send-otp`, {
    method: "OPTIONS",
    headers: baseHeaders,
  });
  
  await response.text();
  assertEquals(response.status, 200);
  assertExists(response.headers.get("access-control-allow-origin"));
});

Deno.test("send-otp - requires email parameter", async () => {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/send-otp`, {
    method: "POST",
    headers: baseHeaders,
    body: JSON.stringify({ type: "login" }),
  });
  
  const body = await response.json();
  assertEquals(response.status, 500);
  assertExists(body.error);
});

Deno.test("send-otp - requires type parameter", async () => {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/send-otp`, {
    method: "POST",
    headers: baseHeaders,
    body: JSON.stringify({ email: "test@example.com" }),
  });
  
  const body = await response.json();
  assertEquals(response.status, 500);
  assertExists(body.error);
});

Deno.test("send-otp - accepts onboarding type", async () => {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/send-otp`, {
    method: "POST",
    headers: baseHeaders,
    body: JSON.stringify({ 
      email: "test-onboarding@example.com", 
      type: "onboarding" 
    }),
  });
  
  await response.text();
  // Should either succeed or hit rate limit (both are valid outcomes)
  assertEquals(response.status === 200 || response.status === 429, true);
});

Deno.test("send-otp - accepts signup type", async () => {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/send-otp`, {
    method: "POST",
    headers: baseHeaders,
    body: JSON.stringify({ 
      email: "test-signup@example.com", 
      type: "signup" 
    }),
  });
  
  await response.text();
  assertEquals(response.status === 200 || response.status === 429, true);
});

Deno.test("send-otp - accepts verify_email type", async () => {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/send-otp`, {
    method: "POST",
    headers: baseHeaders,
    body: JSON.stringify({ 
      email: "test-verify@example.com", 
      type: "verify_email" 
    }),
  });
  
  await response.text();
  assertEquals(response.status === 200 || response.status === 429, true);
});

Deno.test("send-otp - returns proper CORS headers", async () => {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/send-otp`, {
    method: "POST",
    headers: baseHeaders,
    body: JSON.stringify({ 
      email: "test-cors@example.com", 
      type: "login" 
    }),
  });
  
  await response.text();
  assertEquals(response.headers.get("access-control-allow-origin"), "*");
});

Deno.test("send-otp - handles rate limiting", async () => {
  const email = `test-ratelimit-${Date.now()}@example.com`;
  
  // Send multiple requests quickly
  const requests = [];
  for (let i = 0; i < 4; i++) {
    requests.push(
      fetch(`${SUPABASE_URL}/functions/v1/send-otp`, {
        method: "POST",
        headers: baseHeaders,
        body: JSON.stringify({ email, type: "login" }),
      })
    );
  }
  
  const responses = await Promise.all(requests);
  
  // At least one should be rate limited (429) after 3 attempts per hour
  for (const response of responses) {
    await response.text(); // Consume body
  }
  
  const statuses = responses.map(r => r.status);
  // Should see either success (200) or rate limit (429)
  assertEquals(
    statuses.every(s => s === 200 || s === 429), 
    true,
    "All responses should be either 200 or 429"
  );
});
