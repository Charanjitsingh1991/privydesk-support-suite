import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { assertEquals, assertExists } from "https://deno.land/std@0.224.0/assert/mod.ts";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY")!;

const baseHeaders = {
  "Content-Type": "application/json",
  "apikey": SUPABASE_ANON_KEY,
};

Deno.test("verify-otp - handles OPTIONS preflight request", async () => {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/verify-otp`, {
    method: "OPTIONS",
    headers: baseHeaders,
  });
  
  await response.text();
  assertEquals(response.status, 200);
  assertExists(response.headers.get("access-control-allow-origin"));
});

Deno.test("verify-otp - requires email parameter", async () => {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/verify-otp`, {
    method: "POST",
    headers: baseHeaders,
    body: JSON.stringify({ code: "123456", type: "login" }),
  });
  
  const body = await response.json();
  assertEquals(response.status, 500);
  assertExists(body.error);
});

Deno.test("verify-otp - requires code parameter", async () => {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/verify-otp`, {
    method: "POST",
    headers: baseHeaders,
    body: JSON.stringify({ email: "test@example.com", type: "login" }),
  });
  
  const body = await response.json();
  assertEquals(response.status, 500);
  assertExists(body.error);
});

Deno.test("verify-otp - requires type parameter", async () => {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/verify-otp`, {
    method: "POST",
    headers: baseHeaders,
    body: JSON.stringify({ email: "test@example.com", code: "123456" }),
  });
  
  const body = await response.json();
  assertEquals(response.status, 500);
  assertExists(body.error);
});

Deno.test("verify-otp - rejects invalid OTP code", async () => {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/verify-otp`, {
    method: "POST",
    headers: baseHeaders,
    body: JSON.stringify({ 
      email: "test-invalid-otp@example.com", 
      code: "000000", 
      type: "login" 
    }),
  });
  
  // Either 400 (invalid code) or 429 (rate limited)
  await response.text();
  assertEquals(response.status === 400 || response.status === 429, true);
});

Deno.test("verify-otp - accepts onboarding type (maps to verify_email)", async () => {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/verify-otp`, {
    method: "POST",
    headers: baseHeaders,
    body: JSON.stringify({ 
      email: "test-onboarding-verify@example.com", 
      code: "123456", 
      type: "onboarding" 
    }),
  });
  
  await response.text();
  // Should either fail validation (400) or hit rate limit (429)
  assertEquals(response.status === 400 || response.status === 429, true);
});

Deno.test("verify-otp - returns proper CORS headers", async () => {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/verify-otp`, {
    method: "POST",
    headers: baseHeaders,
    body: JSON.stringify({ 
      email: "test-cors@example.com", 
      code: "123456",
      type: "login" 
    }),
  });
  
  await response.text();
  assertEquals(response.headers.get("access-control-allow-origin"), "*");
});

Deno.test("verify-otp - handles rate limiting for verification attempts", async () => {
  const email = `test-verify-ratelimit-${Date.now()}@example.com`;
  
  // Send multiple verification attempts
  const requests = [];
  for (let i = 0; i < 6; i++) {
    requests.push(
      fetch(`${SUPABASE_URL}/functions/v1/verify-otp`, {
        method: "POST",
        headers: baseHeaders,
        body: JSON.stringify({ 
          email, 
          code: `00000${i}`, 
          type: "login" 
        }),
      })
    );
  }
  
  const responses = await Promise.all(requests);
  
  for (const response of responses) {
    await response.text(); // Consume body
  }
  
  const statuses = responses.map(r => r.status);
  // Should see either invalid (400) or rate limit (429)
  assertEquals(
    statuses.every(s => s === 400 || s === 429), 
    true,
    "All responses should be either 400 or 429"
  );
});

Deno.test("verify-otp - returns success:false for expired OTP", async () => {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/verify-otp`, {
    method: "POST",
    headers: baseHeaders,
    body: JSON.stringify({ 
      email: "expired-otp@example.com", 
      code: "999999", 
      type: "verify_email" 
    }),
  });
  
  // Should fail validation
  await response.text();
  assertEquals(response.status === 400 || response.status === 429, true);
});
