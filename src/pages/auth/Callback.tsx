import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export default function AuthCallback() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the hash fragment from URL (Supabase uses hash-based tokens)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");
        const error = hashParams.get("error");
        const errorDescription = hashParams.get("error_description");

        // Also check query params for token_hash (used by some magic link flows)
        const tokenHash = searchParams.get("token_hash");
        const type = searchParams.get("type");

        if (error) {
          throw new Error(errorDescription || error);
        }

        if (accessToken && refreshToken) {
          // Set the session directly
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (sessionError) throw sessionError;
        } else if (tokenHash && type) {
          // Verify OTP token
          const { error: verifyError } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            type: type as any,
          });

          if (verifyError) throw verifyError;
        } else {
          // Check if there's already a session (might have been set by Supabase automatically)
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError) throw sessionError;
          
          if (!session) {
            throw new Error("No authentication data found. The link may have expired.");
          }
        }

        // Check user profile and organization status
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("last_login_at, organization_id")
            .eq("id", user.id)
            .single();

          const isFirstLogin = !profile?.last_login_at;
          const hasOrganization = !!profile?.organization_id;

          // Update last login
          await supabase
            .from("profiles")
            .update({ last_login_at: new Date().toISOString() })
            .eq("id", user.id);

          // Send welcome email for first-time users
          if (isFirstLogin) {
            try {
              await supabase.functions.invoke("send-welcome-email", {
                body: { 
                  email: user.email,
                  fullName: user.user_metadata?.full_name || user.email?.split("@")[0],
                },
              });
            } catch (emailError) {
              console.error("Failed to send welcome email:", emailError);
              // Don't block login for email errors
            }
          }

          setStatus("success");
          
          // Redirect based on organization status
          setTimeout(() => {
            if (hasOrganization) {
              navigate("/dashboard", { replace: true });
            } else {
              navigate("/onboarding", { replace: true });
            }
          }, 1500);
        } else {
          setStatus("success");
          setTimeout(() => {
            navigate("/onboarding", { replace: true });
          }, 1500);
        }
      } catch (error) {
        console.error("Auth callback error:", error);
        setStatus("error");
        setErrorMessage(error.message || "Authentication failed. Please try again.");
      }
    };

    handleCallback();
  }, [navigate, searchParams]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <div>
            <h2 className="text-xl font-semibold text-foreground">Signing you in...</h2>
            <p className="text-muted-foreground mt-1">Please wait while we verify your credentials.</p>
          </div>
        </div>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">Welcome back!</h2>
            <p className="text-muted-foreground mt-1">Redirecting to dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-8">
      <div className="text-center space-y-6 max-w-md">
        <div className="w-16 h-16 mx-auto rounded-full bg-destructive/10 flex items-center justify-center">
          <XCircle className="h-8 w-8 text-destructive" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-foreground">Authentication Failed</h2>
          <p className="text-muted-foreground mt-2">{errorMessage}</p>
        </div>
        <div className="space-y-3">
          <Button onClick={() => navigate("/auth/login")} className="w-full">
            Try Again
          </Button>
          <Button variant="outline" onClick={() => navigate("/")} className="w-full">
            Go to Homepage
          </Button>
        </div>
      </div>
    </div>
  );
}
