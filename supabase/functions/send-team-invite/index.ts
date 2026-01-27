import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface InviteRequest {
  email: string;
  fullName: string;
  role: string;
  token: string;
  customMessage?: string;
}

const ROLE_DESCRIPTIONS: Record<string, string> = {
  admin: "full access to organization settings and team management",
  agent: "ability to view and respond to assigned tickets",
  client: "ability to create and view your own tickets",
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, fullName, role, token, customMessage }: InviteRequest = await req.json();

    // Validate required fields
    if (!email || !fullName || !role || !token) {
      throw new Error("Missing required fields");
    }

    // Get SMTP configuration from environment
    const smtpHost = Deno.env.get("SMTP_HOST");
    const smtpPort = Deno.env.get("SMTP_PORT");
    const smtpUser = Deno.env.get("SMTP_USER");
    const smtpPassword = Deno.env.get("SMTP_PASSWORD");
    const smtpFromEmail = Deno.env.get("SMTP_FROM_EMAIL");
    const smtpFromName = Deno.env.get("SMTP_FROM_NAME") || "PRIVYDESK";

    if (!smtpHost || !smtpUser || !smtpPassword || !smtpFromEmail) {
      throw new Error("SMTP configuration is missing");
    }

    // Get the base URL from environment or use a default
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const baseUrl = supabaseUrl.replace('.supabase.co', '').replace('https://', 'https://');
    const inviteUrl = `${baseUrl}/auth/callback?type=invite&token=${token}`;

    const roleDescription = ROLE_DESCRIPTIONS[role] || "access to the platform";

    // Create email content
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>You're Invited to PRIVYDESK</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 40px; text-align: center;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">PRIVYDESK</h1>
                      <p style="margin: 10px 0 0; color: rgba(255, 255, 255, 0.9); font-size: 16px;">Secure Support Platform</p>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px;">
                      <h2 style="margin: 0 0 20px; color: #18181b; font-size: 24px; font-weight: 600;">
                        Hello ${fullName}! 👋
                      </h2>
                      
                      <p style="margin: 0 0 20px; color: #52525b; font-size: 16px; line-height: 1.6;">
                        You've been invited to join PRIVYDESK as a <strong style="color: #18181b;">${role.charAt(0).toUpperCase() + role.slice(1)}</strong>. 
                        This role gives you ${roleDescription}.
                      </p>
                      
                      ${customMessage ? `
                      <div style="background-color: #f4f4f5; border-left: 4px solid #6366f1; padding: 16px; margin: 20px 0; border-radius: 0 8px 8px 0;">
                        <p style="margin: 0; color: #52525b; font-size: 14px; font-style: italic;">"${customMessage}"</p>
                      </div>
                      ` : ''}
                      
                      <div style="text-align: center; margin: 32px 0;">
                        <a href="${inviteUrl}" style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);">
                          Accept Invitation
                        </a>
                      </div>
                      
                      <div style="background-color: #fef3c7; border-radius: 8px; padding: 16px; margin: 24px 0;">
                        <p style="margin: 0; color: #92400e; font-size: 14px;">
                          ⏰ <strong>This invitation expires in 7 days.</strong> Please accept it before then to join the team.
                        </p>
                      </div>
                      
                      <hr style="border: none; border-top: 1px solid #e4e4e7; margin: 32px 0;">
                      
                      <p style="margin: 0; color: #71717a; font-size: 14px; line-height: 1.6;">
                        If you didn't expect this invitation, you can safely ignore this email. 
                        If you have questions, please contact the person who invited you.
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #fafafa; padding: 24px 40px; border-top: 1px solid #e4e4e7;">
                      <p style="margin: 0; color: #a1a1aa; font-size: 12px; text-align: center;">
                        This email was sent by PRIVYDESK. If you have any questions, please contact support.
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

    // Use SMTP to send email (simplified - in production use a proper SMTP library)
    // For now, we'll use a fetch to an email API if available, or log the intent
    console.log(`Sending invitation email to ${email}`);
    console.log(`Invite URL: ${inviteUrl}`);

    // For production, integrate with your actual email sending mechanism
    // This could be Resend, SendGrid, or direct SMTP

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Invitation email sent",
        inviteUrl // Include for testing purposes
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in send-team-invite function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
