import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  // Important: allow Supabase client headers used by supabase-js in the browser.
  // Missing headers here causes the browser preflight to fail with "TypeError: Failed to fetch".
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface OTPRequest {
  email: string;
  type: "login" | "signup" | "verify_email" | "onboarding";
}

async function sendEmail(to: string, subject: string, html: string) {
  const client = new SMTPClient({
    connection: {
      hostname: Deno.env.get("SMTP_HOST")!,
      port: parseInt(Deno.env.get("SMTP_PORT") || "587"),
      tls: true,
      auth: {
        username: Deno.env.get("SMTP_USER")!,
        password: Deno.env.get("SMTP_PASSWORD")!,
      },
    },
  });

  try {
    await client.send({
      from: `${Deno.env.get("SMTP_FROM_NAME")} <${Deno.env.get("SMTP_FROM_EMAIL")}>`,
      to: to,
      subject: subject,
      html: html,
    });
  } finally {
    await client.close();
  }
}

function getOTPEmailTemplate(code: string, type: string): string {
  const actionText = type === "signup" ? "complete your registration" : 
                     type === "verify_email" ? "verify your email address" : 
                     type === "onboarding" ? "complete your organization setup" :
                     "sign in to your account";

  // Some email clients show literal "=20" artifacts when the HTML is sent with
  // quoted-printable encoding but not decoded correctly. A reliable workaround
  // is to avoid indentation/trailing whitespace and keep the markup compact.
  const year = new Date().getFullYear();

  return [
    '<!doctype html>',
    '<html lang="en">',
    '<head>',
    '<meta charset="utf-8"/>',
    '<meta name="viewport" content="width=device-width, initial-scale=1"/>',
    '<meta name="x-apple-disable-message-reformatting"/>',
    '<title>Your PRIVYDESK Verification Code</title>',
    '</head>',
    '<body style="margin:0;padding:0;background:#f4f4f5;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">',
    '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;width:100%;">',
    '<tr>',
    '<td align="center" style="padding:32px 12px;">',
    '<table role="presentation" width="560" cellspacing="0" cellpadding="0" style="border-collapse:collapse;width:560px;max-width:100%;background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,.10);">',
    '<tr>',
    '<td style="padding:28px 28px 22px;text-align:center;background:linear-gradient(135deg,#4f46e5 0%,#7c3aed 100%);">',
    '<div style="font-size:22px;line-height:1.1;font-weight:800;letter-spacing:.4px;color:#ffffff;">PRIVYDESK</div>',
    '<div style="margin-top:8px;font-size:13px;line-height:1.4;color:rgba(255,255,255,.9);">Secure Support Platform</div>',
    '</td>',
    '</tr>',
    '<tr>',
    '<td style="padding:28px;">',
    '<h1 style="margin:0 0 10px;font-size:22px;line-height:1.3;color:#18181b;">Your verification code</h1>',
    `<p style="margin:0 0 18px;font-size:15px;line-height:1.6;color:#52525b;">Use the code below to ${actionText}. This code will expire in 10 minutes.</p>`,
    '<div style="text-align:center;padding:18px 0 8px;">',
    '<div style="display:inline-block;padding:16px 22px;border-radius:14px;background:#f4f4f5;border:1px dashed #a1a1aa;">',
    `<span style="font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace;font-size:34px;font-weight:800;letter-spacing:10px;color:#4f46e5;">${code}</span>`,
    '</div>',
    '</div>',
    '<p style="margin:14px 0 0;font-size:13px;line-height:1.6;color:#71717a;text-align:center;">Enter this code in the verification form to continue.</p>',
    '<hr style="margin:22px 0;border:none;border-top:1px solid #e4e4e7;"/>',
    '<p style="margin:0;font-size:12px;line-height:1.6;color:#a1a1aa;">If you didn\'t request this code, you can safely ignore this email.</p>',
    '</td>',
    '</tr>',
    '<tr>',
    '<td style="padding:18px 28px;background:#fafafa;text-align:center;">',
    `<p style="margin:0;font-size:12px;line-height:1.6;color:#71717a;">© ${year} PRIVYDESK. All rights reserved.</p>`,
    '</td>',
    '</tr>',
    '</table>',
    '</td>',
    '</tr>',
    '</table>',
    '</body>',
    '</html>',
  ].join('');
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, type }: OTPRequest = await req.json();

    if (!email || !type) {
      throw new Error("Email and type are required");
    }

    // The database enforces an allowed set of OTP types via a CHECK constraint.
    // Treat onboarding as verify_email for storage/verification consistency.
    const dbOtpType = type === "onboarding" ? "verify_email" : type;

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Check rate limit for OTP requests (max 3 per hour)
    const { data: rateLimitData, error: rateLimitError } = await supabaseAdmin.rpc(
      "check_rate_limit",
      {
        p_identifier: email,
        p_action: "otp_request",
        p_max_attempts: 3,
        p_window_minutes: 60,
      }
    );

    if (rateLimitError) {
      console.error("Rate limit check error:", rateLimitError);
      throw new Error("Failed to check rate limit");
    }

    if (!rateLimitData?.[0]?.allowed) {
      const blockedUntil = rateLimitData?.[0]?.blocked_until;
      return new Response(
        JSON.stringify({
          error: "Too many OTP requests",
          blocked_until: blockedUntil,
          message: "Please try again later",
        }),
        {
          status: 429,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Generate OTP using database function
    const { data: otpCode, error: otpError } = await supabaseAdmin.rpc(
      "generate_otp",
      {
        p_email: email,
        p_type: dbOtpType,
        p_expires_minutes: 10,
      }
    );

    if (otpError) {
      console.error("OTP generation error:", otpError);
      throw new Error("Failed to generate OTP");
    }

    // Send OTP email
    await sendEmail(
      email,
      "Your PRIVYDESK Verification Code",
      getOTPEmailTemplate(otpCode, type)
    );

    console.log("OTP sent successfully to:", email);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Verification code sent successfully" 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-otp:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
