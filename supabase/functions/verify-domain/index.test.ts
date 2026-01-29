import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { assertEquals, assertExists } from "https://deno.land/std@0.224.0/assert/mod.ts";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY")!;

const baseHeaders = {
  "Content-Type": "application/json",
  "apikey": SUPABASE_ANON_KEY,
};

Deno.test("verify-domain - handles OPTIONS preflight request", async () => {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/verify-domain`, {
    method: "OPTIONS",
    headers: baseHeaders,
  });
  
  await response.text();
  assertEquals(response.status, 200);
  assertExists(response.headers.get("access-control-allow-origin"));
});

Deno.test("verify-domain - requires domain parameter", async () => {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/verify-domain`, {
    method: "POST",
    headers: baseHeaders,
    body: JSON.stringify({ method: "dns", token: "test-token" }),
  });
  
  const body = await response.json();
  assertEquals(response.status, 400);
  assertExists(body.error);
});

Deno.test("verify-domain - requires method parameter", async () => {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/verify-domain`, {
    method: "POST",
    headers: baseHeaders,
    body: JSON.stringify({ domain: "test.example.com", token: "test-token" }),
  });
  
  const body = await response.json();
  assertEquals(response.status, 400);
  assertExists(body.error);
});

Deno.test("verify-domain - requires token parameter", async () => {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/verify-domain`, {
    method: "POST",
    headers: baseHeaders,
    body: JSON.stringify({ domain: "test.example.com", method: "dns" }),
  });
  
  const body = await response.json();
  assertEquals(response.status, 400);
  assertExists(body.error);
});

Deno.test("verify-domain - handles DNS verification for non-existent domain", async () => {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/verify-domain`, {
    method: "POST",
    headers: baseHeaders,
    body: JSON.stringify({ 
      domain: "nonexistent-domain-123456.example.com", 
      method: "dns",
      token: "test-verification-token"
    }),
  });
  
  const body = await response.json();
  assertEquals(response.status, 200);
  assertEquals(body.verified, false);
  assertExists(body.error);
});

Deno.test("verify-domain - handles file verification for non-existent domain", async () => {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/verify-domain`, {
    method: "POST",
    headers: baseHeaders,
    body: JSON.stringify({ 
      domain: "nonexistent-domain-123456.example.com", 
      method: "file",
      token: "test-verification-token"
    }),
  });
  
  const body = await response.json();
  assertEquals(response.status, 200);
  assertEquals(body.verified, false);
  assertExists(body.error);
});

Deno.test("verify-domain - returns proper CORS headers", async () => {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/verify-domain`, {
    method: "POST",
    headers: baseHeaders,
    body: JSON.stringify({ 
      domain: "test.example.com",
      method: "dns",
      token: "test-token"
    }),
  });
  
  await response.text();
  assertEquals(response.headers.get("access-control-allow-origin"), "*");
});

Deno.test("verify-domain - returns verified:false for DNS without matching TXT record", async () => {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/verify-domain`, {
    method: "POST",
    headers: baseHeaders,
    body: JSON.stringify({ 
      domain: "example.com",  // Real domain but won't have our TXT record
      method: "dns",
      token: "privydesk-verify-test-unique-token"
    }),
  });
  
  const body = await response.json();
  assertEquals(response.status, 200);
  assertEquals(body.verified, false);
});

Deno.test("verify-domain - returns verified:false for file without matching content", async () => {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/verify-domain`, {
    method: "POST",
    headers: baseHeaders,
    body: JSON.stringify({ 
      domain: "example.com",  // Real domain but won't have verification file
      method: "file",
      token: "privydesk-verify-test-unique-token"
    }),
  });
  
  const body = await response.json();
  assertEquals(response.status, 200);
  assertEquals(body.verified, false);
});

Deno.test("verify-domain - handles malformed JSON gracefully", async () => {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/verify-domain`, {
    method: "POST",
    headers: baseHeaders,
    body: "not-valid-json",
  });
  
  const body = await response.json();
  assertEquals(response.status, 500);
  assertExists(body.error);
});
