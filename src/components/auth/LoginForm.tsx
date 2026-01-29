import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { AccountLockoutAlert, LoginAttemptsWarning } from '@/components/security/SecurityAlerts';
import { loginRateLimiter } from '@/lib/security/input-sanitizer';
import { Loader2, Mail, Lock, Eye, EyeOff } from 'lucide-react';

const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 30 * 60 * 1000; // 30 minutes

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState<Date | null>(null);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const isLocked = lockoutUntil && lockoutUntil > new Date();
  const remainingAttempts = MAX_LOGIN_ATTEMPTS - failedAttempts;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if account is locked
    if (isLocked) {
      toast({
        title: 'Account locked',
        description: 'Please wait before trying again.',
        variant: 'destructive',
      });
      return;
    }

    // Check rate limiting
    if (loginRateLimiter.isRateLimited(email)) {
      setLockoutUntil(new Date(Date.now() + LOCKOUT_DURATION_MS));
      toast({
        title: 'Too many attempts',
        description: 'Your account has been temporarily locked.',
        variant: 'destructive',
      });
      return;
    }
    
    setLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);
      
      // Lock account after max attempts
      if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
        setLockoutUntil(new Date(Date.now() + LOCKOUT_DURATION_MS));
        toast({
          title: 'Account locked',
          description: 'Too many failed attempts. Please try again in 30 minutes.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Error signing in',
          description: error.message,
          variant: 'destructive',
        });
      }
      setLoading(false);
    } else {
      // Reset on successful login
      setFailedAttempts(0);
      loginRateLimiter.reset(email);
      
      // Check user's profile for organization - the AuthContext will update
      // and ProtectedRoute will handle the redirect appropriately
      // We use a small delay to let auth state propagate
      setTimeout(() => {
        setLoading(false);
        navigate('/dashboard');
      }, 100);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Account lockout alert */}
      {lockoutUntil && isLocked && (
        <AccountLockoutAlert
          lockoutUntil={lockoutUntil}
          attempts={failedAttempts}
          maxAttempts={MAX_LOGIN_ATTEMPTS}
        />
      )}
      
      {/* Warning about remaining attempts */}
      {!isLocked && failedAttempts > 0 && (
        <LoginAttemptsWarning
          remainingAttempts={remainingAttempts}
          maxAttempts={MAX_LOGIN_ATTEMPTS}
        />
      )}

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            id="email"
            type="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-10"
            disabled={isLocked || loading}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          <Link to="/forgot-password" className="text-sm text-primary hover:underline">
            Forgot password?
          </Link>
        </div>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pl-10 pr-10"
            disabled={isLocked || loading}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            disabled={isLocked || loading}
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      <Button 
        type="submit" 
        className="w-full" 
        disabled={loading || isLocked}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Signing in...
          </>
        ) : isLocked ? (
          'Account Locked'
        ) : (
          'Sign in'
        )}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Don't have an account?{' '}
        <Link to="/signup" className="text-primary font-medium hover:underline">
          Sign up
        </Link>
      </p>
    </form>
  );
}
