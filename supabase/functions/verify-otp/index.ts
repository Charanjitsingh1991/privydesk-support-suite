import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VerifyOTPRequest {
  email: string;
  code: string;
  type: "login" | "signup" | "verify_email" | "onboarding";
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, code, type }: VerifyOTPRequest = await req.json();

    if (!email || !code || !type) {
      throw new Error("Email, code, and type are required");
    }

    // The database enforces an allowed set of OTP types via a CHECK constraint.
    // Treat onboarding as verify_email for storage/verification consistency.
    const effectiveType = type === "onboarding" ? "verify_email" : type;

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Check rate limit for verification attempts
    const { data: rateLimitData, error: rateLimitError } = await supabaseAdmin.rpc(
      "check_rate_limit",
      {
        p_identifier: email,
        p_action: "otp_verify",
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
          error: "Too many verification attempts",
          blocked_until: blockedUntil,
          message: "Please try again later",
        }),
        {
          status: 429,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Verify OTP using database function
    const { data: isValid, error: verifyError } = await supabaseAdmin.rpc(
      "verify_otp",
      {
        p_email: email,
        p_code: code,
        p_type: effectiveType,
      }
    );

    if (verifyError) {
      console.error("OTP verification error:", verifyError);
      throw new Error("Failed to verify OTP");
    }

    if (!isValid) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Invalid or expired verification code",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // For login/signup, create a session
    if (effectiveType === "login" || effectiveType === "signup") {
      // Check if user exists using listUsers with filter
      const { data: usersData } = await supabaseAdmin.auth.admin.listUsers();
      const existingUser = usersData?.users?.find(u => u.email === email);

      let userId: string;

      if (!existingUser) {
        // Create new user for signup
        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email: email,
          email_confirm: true,
        });

        if (createError) {
          console.error("User creation error:", createError);
          throw new Error("Failed to create user");
        }

        userId = newUser.user.id;
      } else {
        userId = existingUser.id;
        
        // Mark email as verified if not already
        if (!existingUser.email_confirmed_at) {
          await supabaseAdmin.auth.admin.updateUserById(userId, {
            email_confirm: true,
          });
        }
      }

      // Update profile to mark email as verified
      await supabaseAdmin
        .from("profiles")
        .update({ email_verified: true })
        .eq("id", userId);

      // Generate a magic link for automatic login
      const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
        type: "magiclink",
        email: email,
      });

      if (linkError) {
        console.error("Link generation error:", linkError);
        throw new Error("Failed to generate session");
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: "Verification successful",
          action_link: linkData.properties.action_link,
          user_id: userId,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // For verify_email, just mark as verified
    if (effectiveType === "verify_email") {
      const { data: usersData } = await supabaseAdmin.auth.admin.listUsers();
      const user = usersData?.users?.find(u => u.email === email);
      
      if (user) {
        await supabaseAdmin.auth.admin.updateUserById(user.id, {
          email_confirm: true,
        });

        await supabaseAdmin
          .from("profiles")
          .update({ email_verified: true })
          .eq("id", user.id);
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: "Email verified successfully",
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in verify-otp:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
