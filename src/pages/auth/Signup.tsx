import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, ArrowRight, Shield, Loader2, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function AuthSignup() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [authMethod, setAuthMethod] = useState<"magic-link" | "otp">("magic-link");
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    try {
      const { error } = await supabase.functions.invoke("send-magic-link", {
        body: { 
          email,
          redirectTo: window.location.origin,
        },
      });

      if (error) throw error;

      navigate("/auth/magic-link-sent", { state: { email } });
    } catch (error) {
      console.error("Magic link error:", error);
      
      if (error.message?.includes("429") || error.message?.includes("Too many")) {
        toast({
          variant: "destructive",
          title: "Too many attempts",
          description: "Please wait a few minutes before trying again.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Failed to send magic link",
          description: error.message || "Please try again later.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    try {
      const { error } = await supabase.functions.invoke("send-otp", {
        body: { email, type: "signup" },
      });

      if (error) throw error;

      navigate("/auth/verify-otp", { state: { email, type: "signup" } });
    } catch (error) {
      console.error("OTP error:", error);
      
      if (error.message?.includes("429") || error.message?.includes("Too many")) {
        toast({
          variant: "destructive",
          title: "Too many requests",
          description: "Please wait before requesting another code.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Failed to send verification code",
          description: error.message || "Please try again later.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-black relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMiI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAzMHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
        
        <div className="relative z-10 flex flex-col justify-center px-12 lg:px-20">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-accent-lime flex items-center justify-center">
              <Shield className="h-6 w-6 text-black" />
            </div>
            <span className="text-2xl font-bold text-white">PRIVYDESK</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
            Get started in seconds
          </h1>
          <p className="text-lg text-white/70 max-w-md mb-8">
            No passwords required. Sign up with just your email and start managing support tickets instantly.
          </p>
          
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">Passwordless Security</h3>
                <p className="text-white/70 mt-1">No passwords to remember or manage. More secure than traditional authentication.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                <Mail className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">Instant Access</h3>
                <p className="text-white/70 mt-1">Receive a magic link or verification code via email. One click and you're in.</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="absolute bottom-8 left-12 lg:left-20 z-10">
          <p className="text-white/60 text-sm">© 2024 PRIVYDESK. All rights reserved.</p>
        </div>
      </div>

      {/* Right Panel - Signup Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-[#0a0a0a]">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold text-white">Create your account</h2>
            <p className="text-white/60 mt-2">Start your free trial today</p>
          </div>

          {/* Auth Method Toggle */}
          <div className="flex gap-2 p-1 bg-white/5 rounded-lg">
            <button
              onClick={() => setAuthMethod("magic-link")}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                authMethod === "magic-link"
                  ? "bg-white/10 text-white shadow-sm"
                  : "text-white/60 hover:text-white"
              }`}
            >
              <Mail className="h-4 w-4 inline mr-2" />
              Magic Link
            </button>
            <button
              onClick={() => setAuthMethod("otp")}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                authMethod === "otp"
                  ? "bg-white/10 text-white shadow-sm"
                  : "text-white/60 hover:text-white"
              }`}
            >
              <KeyRound className="h-4 w-4 inline mr-2" />
              Verification Code
            </button>
          </div>

          <form onSubmit={authMethod === "magic-link" ? handleMagicLink : handleOTP} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">Email address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <Button type="submit" className="w-full bg-accent-lime hover:bg-accent-lime/90 text-black font-medium" size="lg" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {authMethod === "magic-link" ? "Sending link..." : "Sending code..."}
                </>
              ) : (
                <>
                  {authMethod === "magic-link" ? "Send Magic Link" : "Send Verification Code"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <div className="text-center">
            <p className="text-white/60">
              Already have an account?{" "}
              <Link to="/auth/login" className="text-accent-lime hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </div>

          <p className="text-center text-xs text-white/40">
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
