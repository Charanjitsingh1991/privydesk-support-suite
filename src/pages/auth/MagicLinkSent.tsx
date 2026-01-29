import { useEffect, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { ArrowLeft, Mail, RefreshCw, Loader2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function MagicLinkSent() {
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const email = location.state?.email;

  useEffect(() => {
    if (!email) {
      navigate("/auth/login");
    }
  }, [email, navigate]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleResend = async () => {
    setIsResending(true);
    try {
      const { error } = await supabase.functions.invoke("send-magic-link", {
        body: { 
          email,
          redirectTo: window.location.origin,
        },
      });

      if (error) throw error;

      setResendCooldown(60);
      toast({
        title: "Link sent!",
        description: "A new magic link has been sent to your email.",
      });
    } catch (error: any) {
      console.error("Resend error:", error);
      
      if (error.message?.includes("429")) {
        toast({
          variant: "destructive",
          title: "Too many requests",
          description: "Please wait before requesting another link.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Failed to resend link",
          description: error.message || "Please try again.",
        });
      }
    } finally {
      setIsResending(false);
    }
  };

  const getEmailProviderLink = (email: string) => {
    const domain = email.split("@")[1]?.toLowerCase();
    const providers: Record<string, string> = {
      "gmail.com": "https://mail.google.com",
      "googlemail.com": "https://mail.google.com",
      "outlook.com": "https://outlook.live.com",
      "hotmail.com": "https://outlook.live.com",
      "live.com": "https://outlook.live.com",
      "yahoo.com": "https://mail.yahoo.com",
      "yahoo.co.uk": "https://mail.yahoo.com",
      "icloud.com": "https://www.icloud.com/mail",
    };
    return providers[domain];
  };

  const emailProviderLink = email ? getEmailProviderLink(email) : null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-8">
      <div className="w-full max-w-md space-y-8">
        <Link
          to="/auth/login"
          className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to login
        </Link>

        <div className="text-center">
          <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-6 relative">
            <Mail className="h-10 w-10 text-primary" />
            <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
              <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          
          <h2 className="text-3xl font-bold text-foreground">Check your email</h2>
          <p className="text-muted-foreground mt-4 leading-relaxed">
            We sent a magic link to
          </p>
          <p className="text-foreground font-semibold text-lg">{email}</p>
          <p className="text-muted-foreground mt-2">
            Click the link in the email to sign in to your account.
          </p>
        </div>

        {emailProviderLink && (
          <Button
            asChild
            variant="outline"
            className="w-full"
            size="lg"
          >
            <a href={emailProviderLink} target="_blank" rel="noopener noreferrer">
              Open Email App
              <ExternalLink className="ml-2 h-4 w-4" />
            </a>
          </Button>
        )}

        <div className="bg-muted/50 rounded-lg p-4 space-y-3">
          <h3 className="font-medium text-foreground">Tips:</h3>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              The link expires in 10 minutes
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              Check your spam or junk folder
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              Make sure you entered the correct email address
            </li>
          </ul>
        </div>

        <div className="text-center space-y-4">
          <p className="text-muted-foreground text-sm">
            Didn't receive the email?{" "}
            {resendCooldown > 0 ? (
              <span className="text-muted-foreground">
                Resend in {resendCooldown}s
              </span>
            ) : (
              <button
                onClick={handleResend}
                disabled={isResending}
                className="text-primary hover:underline font-medium inline-flex items-center"
              >
                {isResending ? (
                  <>
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Resend link
                  </>
                )}
              </button>
            )}
          </p>

          <p className="text-muted-foreground text-sm">
            Or{" "}
            <Link to="/auth/login" className="text-primary hover:underline font-medium">
              try a different method
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
