import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { ArrowLeft, Loader2, CheckCircle2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function VerifyOTP() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isVerified, setIsVerified] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const email = location.state?.email;
  const type = location.state?.type || "login";

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

  useEffect(() => {
    // Focus first input on mount
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste
      const digits = value.replace(/\D/g, "").slice(0, 6).split("");
      const newOtp = [...otp];
      digits.forEach((digit, i) => {
        if (index + i < 6) {
          newOtp[index + i] = digit;
        }
      });
      setOtp(newOtp);
      const nextIndex = Math.min(index + digits.length, 5);
      inputRefs.current[nextIndex]?.focus();
    } else {
      const newOtp = [...otp];
      newOtp[index] = value.replace(/\D/g, "");
      setOtp(newOtp);
      
      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join("");
    if (code.length !== 6) {
      toast({
        variant: "destructive",
        title: "Invalid code",
        description: "Please enter all 6 digits.",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("verify-otp", {
        body: { email, code, type },
      });

      if (error) throw error;

      if (!data.success) {
        toast({
          variant: "destructive",
          title: "Invalid code",
          description: data.error || "The verification code is incorrect or expired.",
        });
        return;
      }

      setIsVerified(true);

      // If we got an action link, use it to sign in
      if (data.action_link) {
        // Extract token from action link and verify
        const url = new URL(data.action_link);
        const token_hash = url.searchParams.get("token");
        const tokenType = url.searchParams.get("type");
        
        if (token_hash && tokenType) {
          const { error: verifyError } = await supabase.auth.verifyOtp({
            token_hash,
            type: tokenType as any,
          });

          if (verifyError) {
            console.error("Session verification error:", verifyError);
          }
        }
      }

      toast({
        title: "Verification successful!",
        description: "You're now signed in.",
      });

      // Small delay to show success state
      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);
    } catch (error: any) {
      console.error("Verification error:", error);
      
      if (error.message?.includes("429")) {
        toast({
          variant: "destructive",
          title: "Too many attempts",
          description: "Please wait before trying again.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Verification failed",
          description: error.message || "Please try again.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    try {
      const { error } = await supabase.functions.invoke("send-otp", {
        body: { email, type },
      });

      if (error) throw error;

      setResendCooldown(60);
      toast({
        title: "Code sent!",
        description: "A new verification code has been sent to your email.",
      });
    } catch (error: any) {
      console.error("Resend error:", error);
      
      if (error.message?.includes("429")) {
        toast({
          variant: "destructive",
          title: "Too many requests",
          description: "Please wait before requesting another code.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Failed to resend code",
          description: error.message || "Please try again.",
        });
      }
    } finally {
      setIsResending(false);
    }
  };

  // Auto-submit when all digits are entered
  useEffect(() => {
    if (otp.every((digit) => digit !== "") && !isLoading && !isVerified) {
      handleVerify();
    }
  }, [otp]);

  if (isVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-8">
        <div className="w-full max-w-md text-center space-y-6">
          <div className="w-20 h-20 mx-auto rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Verified!</h2>
            <p className="text-muted-foreground mt-2">Redirecting to dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

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
          <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-6">
            <svg
              className="h-8 w-8 text-primary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-foreground">Enter verification code</h2>
          <p className="text-muted-foreground mt-2">
            We sent a 6-digit code to
          </p>
          <p className="text-foreground font-medium">{email}</p>
        </div>

        <div className="flex justify-center gap-3">
          {otp.map((digit, index) => (
            <Input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-12 h-14 text-center text-2xl font-bold"
              disabled={isLoading}
            />
          ))}
        </div>

        <Button
          onClick={handleVerify}
          className="w-full"
          size="lg"
          disabled={isLoading || otp.some((d) => !d)}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Verifying...
            </>
          ) : (
            "Verify Code"
          )}
        </Button>

        <div className="text-center">
          <p className="text-muted-foreground text-sm">
            Didn't receive the code?{" "}
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
                    Resend code
                  </>
                )}
              </button>
            )}
          </p>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          The code expires in 10 minutes. Check your spam folder if you don't see the email.
        </p>
      </div>
    </div>
  );
}
