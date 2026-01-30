import { useState, useMemo, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { PasswordStrengthMeter } from '@/components/auth/PasswordStrengthMeter';
import { validatePassword, DEFAULT_PASSWORD_POLICY } from '@/lib/security/password-validator';
import { Loader2, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';

export function SignupForm() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const passwordValidation = useMemo(() => {
    return validatePassword(password, DEFAULT_PASSWORD_POLICY, [email, fullName]);
  }, [password, email, fullName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate password before submitting
    if (!passwordValidation.isValid) {
      toast({
        title: 'Invalid password',
        description: passwordValidation.errors[0] || 'Please choose a stronger password',
        variant: 'destructive',
      });
      return;
    }
    
    setLoading(true);

    try {
      const { error } = await signUp(email, password, fullName);

      if (error) {
        throw error;
      }

      toast({
        title: 'Account created',
        description: 'Welcome to PRIVYDESK! Redirecting to dashboard...',
      });
      navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: 'Error signing up',
        description: error.message || 'Failed to create account',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="fullName" className="text-white">Full Name</Label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <Input
            id="fullName"
            type="text"
            placeholder="John Doe"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email" className="text-white">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <Input
            id="email"
            type="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-white">Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pl-10 pr-10 bg-white/5 border-white/10 text-white placeholder:text-white/40"
            minLength={12}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
        <PasswordStrengthMeter 
          password={password} 
          email={email} 
          fullName={fullName}
        />
      </div>

      <Button 
        type="submit" 
        className="w-full bg-accent-lime hover:bg-accent-lime/90 text-black font-medium" 
        disabled={loading || !passwordValidation.isValid}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating account...
          </>
        ) : (
          'Create account'
        )}
      </Button>

      <p className="text-center text-sm text-white/60">
        Already have an account?{' '}
        <Link to="/login" className="text-accent-lime font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
