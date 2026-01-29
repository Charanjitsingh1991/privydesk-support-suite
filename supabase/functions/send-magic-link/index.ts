import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface MagicLinkRequest {
  email: string;
  redirectTo?: string;
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

function getMagicLinkEmailTemplate(magicLink: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your PRIVYDESK Login Link</title>
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
              <h2 style="margin: 0 0 16px; color: #18181b; font-size: 24px; font-weight: 600;">Sign in to your account</h2>
              <p style="margin: 0 0 24px; color: #52525b; font-size: 16px; line-height: 1.6;">
                Click the button below to securely sign in to your PRIVYDESK account. This link will expire in 10 minutes.
              </p>
              
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center" style="padding: 16px 0;">
                    <a href="${magicLink}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 8px; box-shadow: 0 4px 14px rgba(79, 70, 229, 0.4);">
                      Sign In to PRIVYDESK
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 24px 0 0; color: #71717a; font-size: 14px; line-height: 1.6;">
                If the button doesn't work, copy and paste this link into your browser:
              </p>
              <p style="margin: 8px 0 0; color: #4f46e5; font-size: 12px; word-break: break-all;">
                ${magicLink}
              </p>
              
              <hr style="margin: 32px 0; border: none; border-top: 1px solid #e4e4e7;" />
              
              <p style="margin: 0; color: #a1a1aa; font-size: 12px; line-height: 1.6;">
                If you didn't request this email, you can safely ignore it. Someone may have entered your email address by mistake.
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
    const { email, redirectTo }: MagicLinkRequest = await req.json();

    if (!email) {
      throw new Error("Email is required");
    }

    // Check rate limit
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: rateLimitData, error: rateLimitError } = await supabaseAdmin.rpc(
      "check_rate_limit",
      {
        p_identifier: email,
        p_action: "magic_link",
        p_max_attempts: 5,
        p_window_minutes: 15,
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
          error: "Too many login attempts",
          blocked_until: blockedUntil,
          message: "Please try again later",
        }),
        {
          status: 429,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Generate magic link using Supabase Auth
    const baseUrl = redirectTo || Deno.env.get("SUPABASE_URL")!.replace('.supabase.co', '.lovable.app');
    
    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email: email,
      options: {
        redirectTo: `${baseUrl}/auth/callback`,
      },
    });

    if (error) {
      console.error("Magic link generation error:", error);
      throw new Error("Failed to generate magic link");
    }

    // Send email with magic link
    const magicLink = data.properties.action_link;
    await sendEmail(
      email,
      "Your PRIVYDESK Login Link",
      getMagicLinkEmailTemplate(magicLink)
    );

    console.log("Magic link sent successfully to:", email);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Magic link sent successfully" 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-magic-link:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
