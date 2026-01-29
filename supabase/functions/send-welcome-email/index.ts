import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WelcomeEmailRequest {
  email: string;
  fullName: string;
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

function getWelcomeEmailTemplate(fullName: string): string {
  const firstName = fullName.split(' ')[0] || fullName;
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to PRIVYDESK!</title>
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
              <h2 style="margin: 0 0 16px; color: #18181b; font-size: 24px; font-weight: 600;">Welcome aboard, ${firstName}! 🎉</h2>
              <p style="margin: 0 0 24px; color: #52525b; font-size: 16px; line-height: 1.6;">
                We're thrilled to have you join PRIVYDESK. Your account is all set up and ready to go!
              </p>
              
              <!-- Quick Start Guide -->
              <div style="background-color: #f4f4f5; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
                <h3 style="margin: 0 0 16px; color: #18181b; font-size: 18px; font-weight: 600;">🚀 Quick Start Guide</h3>
                
                <table role="presentation" style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; vertical-align: top;">
                      <span style="display: inline-block; width: 24px; height: 24px; background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: #fff; text-align: center; line-height: 24px; border-radius: 50%; font-size: 12px; font-weight: 600; margin-right: 12px;">1</span>
                    </td>
                    <td style="padding: 8px 0;">
                      <strong style="color: #18181b;">Create your first ticket</strong>
                      <p style="margin: 4px 0 0; color: #52525b; font-size: 14px;">Submit support requests and track their progress</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; vertical-align: top;">
                      <span style="display: inline-block; width: 24px; height: 24px; background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: #fff; text-align: center; line-height: 24px; border-radius: 50%; font-size: 12px; font-weight: 600; margin-right: 12px;">2</span>
                    </td>
                    <td style="padding: 8px 0;">
                      <strong style="color: #18181b;">Set up your profile</strong>
                      <p style="margin: 4px 0 0; color: #52525b; font-size: 14px;">Add your details and customize your experience</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; vertical-align: top;">
                      <span style="display: inline-block; width: 24px; height: 24px; background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: #fff; text-align: center; line-height: 24px; border-radius: 50%; font-size: 12px; font-weight: 600; margin-right: 12px;">3</span>
                    </td>
                    <td style="padding: 8px 0;">
                      <strong style="color: #18181b;">Explore the dashboard</strong>
                      <p style="margin: 4px 0 0; color: #52525b; font-size: 14px;">Monitor your tickets and team activity</p>
                    </td>
                  </tr>
                </table>
              </div>
              
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center" style="padding: 16px 0;">
                    <a href="#" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 8px; box-shadow: 0 4px 14px rgba(79, 70, 229, 0.4);">
                      Go to Dashboard
                    </a>
                  </td>
                </tr>
              </table>
              
              <hr style="margin: 32px 0; border: none; border-top: 1px solid #e4e4e7;" />
              
              <p style="margin: 0; color: #71717a; font-size: 14px; line-height: 1.6;">
                Need help getting started? Our support team is here for you. Just reply to this email or create a support ticket from your dashboard.
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
    const { email, fullName }: WelcomeEmailRequest = await req.json();

    if (!email) {
      throw new Error("Email is required");
    }

    // Send welcome email
    await sendEmail(
      email,
      "Welcome to PRIVYDESK! 🎉",
      getWelcomeEmailTemplate(fullName || "there")
    );

    console.log("Welcome email sent successfully to:", email);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Welcome email sent successfully" 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-welcome-email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
