import { useMemo } from 'react';
import { Progress } from '@/components/ui/progress';
import { validatePassword, getPasswordStrengthLabel, DEFAULT_PASSWORD_POLICY } from '@/lib/security/password-validator';
import { Check, X, AlertTriangle, Shield, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PasswordStrengthMeterProps {
  password: string;
  email?: string;
  fullName?: string;
  showRequirements?: boolean;
  showCrackTime?: boolean;
  className?: string;
}

export function PasswordStrengthMeter({
  password,
  email = '',
  fullName = '',
  showRequirements = true,
  showCrackTime = true,
  className,
}: PasswordStrengthMeterProps) {
  const validation = useMemo(() => {
    const userInputs = [email, fullName].filter(Boolean);
    return validatePassword(password, DEFAULT_PASSWORD_POLICY, userInputs);
  }, [password, email, fullName]);

  const strengthInfo = useMemo(() => getPasswordStrengthLabel(validation.score), [validation.score]);

  if (!password) {
    return null;
  }

  const requirements = [
    { 
      met: password.length >= 12, 
      label: 'At least 12 characters',
      critical: true,
    },
    { 
      met: /[A-Z]/.test(password), 
      label: 'One uppercase letter',
      critical: true,
    },
    { 
      met: /[a-z]/.test(password), 
      label: 'One lowercase letter',
      critical: true,
    },
    { 
      met: /[0-9]/.test(password), 
      label: 'One number',
      critical: true,
    },
    { 
      met: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~`]/.test(password), 
      label: 'One special character',
      critical: true,
    },
  ];

  return (
    <div className={cn('space-y-3', className)}>
      {/* Strength bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1.5">
            <Shield className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">Password strength:</span>
            <span className={cn('font-medium', strengthInfo.color)}>
              {strengthInfo.label}
            </span>
          </div>
          {showCrackTime && (
            <span className="text-xs text-muted-foreground">
              Crack time: {validation.estimatedCrackTime}
            </span>
          )}
        </div>
        <Progress 
          value={(validation.score + 1) * 20} 
          className={cn('h-2', {
            '[&>div]:bg-red-500': validation.score <= 1,
            '[&>div]:bg-yellow-500': validation.score === 2,
            '[&>div]:bg-lime-500': validation.score === 3,
            '[&>div]:bg-green-500': validation.score === 4,
          })}
        />
      </div>

      {/* Requirements checklist */}
      {showRequirements && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
          {requirements.map((req, index) => (
            <div
              key={index}
              className={cn(
                'flex items-center gap-1.5 text-xs',
                req.met ? 'text-green-600' : 'text-muted-foreground'
              )}
            >
              {req.met ? (
                <Check className="h-3 w-3" />
              ) : (
                <X className="h-3 w-3" />
              )}
              {req.label}
            </div>
          ))}
        </div>
      )}

      {/* Errors */}
      {validation.errors.length > 0 && (
        <div className="space-y-1">
          {validation.errors.map((error, index) => (
            <div
              key={index}
              className="flex items-start gap-1.5 text-xs text-destructive"
            >
              <AlertTriangle className="h-3 w-3 mt-0.5 shrink-0" />
              {error}
            </div>
          ))}
        </div>
      )}

      {/* Suggestions */}
      {validation.suggestions.length > 0 && validation.isValid && (
        <div className="space-y-1">
          {validation.suggestions.slice(0, 2).map((suggestion, index) => (
            <div
              key={index}
              className="flex items-start gap-1.5 text-xs text-muted-foreground"
            >
              <Info className="h-3 w-3 mt-0.5 shrink-0" />
              {suggestion}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
