import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your PRIVYDESK Verification Code</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; max-width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); border-radius: 12px 12px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">PRIVYDESK</h1>
              <p style="margin: 8px 0 0; color: rgba(255, 255, 255, 0.9); font-size: 14px;">Secure Support Platform</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 16px; color: #18181b; font-size: 24px; font-weight: 600;">Your Verification Code</h2>
              <p style="margin: 0 0 24px; color: #52525b; font-size: 16px; line-height: 1.6;">
                Use the code below to ${actionText}. This code will expire in 10 minutes.
              </p>
              
              <!-- OTP Code Box -->
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center" style="padding: 24px 0;">
                    <div style="display: inline-block; padding: 20px 40px; background: linear-gradient(135deg, #f4f4f5 0%, #e4e4e7 100%); border-radius: 12px; border: 2px dashed #a1a1aa;">
                      <span style="font-family: 'Courier New', monospace; font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #4f46e5;">${code}</span>
                    </div>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 24px 0 0; color: #71717a; font-size: 14px; line-height: 1.6; text-align: center;">
                Enter this code in the verification form to continue.
              </p>
              
              <hr style="margin: 32px 0; border: none; border-top: 1px solid #e4e4e7;" />
              
              <p style="margin: 0; color: #a1a1aa; font-size: 12px; line-height: 1.6;">
                If you didn't request this code, you can safely ignore this email. Someone may have entered your email address by mistake.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background-color: #fafafa; border-radius: 0 0 12px 12px; text-align: center;">
              <p style="margin: 0; color: #71717a; font-size: 12px;">
                © 2024 PRIVYDESK. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
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
