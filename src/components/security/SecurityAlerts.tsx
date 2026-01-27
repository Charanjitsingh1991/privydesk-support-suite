import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Lock, Clock, AlertTriangle, ShieldOff } from 'lucide-react';
import { formatDistanceToNow, formatDistanceStrict } from 'date-fns';

interface AccountLockoutAlertProps {
  lockoutUntil: Date;
  attempts?: number;
  maxAttempts?: number;
  onUnlockRequest?: () => void;
  showUnlockRequest?: boolean;
}

export function AccountLockoutAlert({
  lockoutUntil,
  attempts = 5,
  maxAttempts = 5,
  onUnlockRequest,
  showUnlockRequest = false,
}: AccountLockoutAlertProps) {
  const now = new Date();
  const isLocked = lockoutUntil > now;
  const timeRemaining = isLocked 
    ? formatDistanceStrict(lockoutUntil, now, { addSuffix: false })
    : null;

  if (!isLocked) {
    return null;
  }

  return (
    <Alert variant="destructive" className="mb-6">
      <Lock className="h-4 w-4" />
      <AlertTitle className="flex items-center gap-2">
        Account Locked
      </AlertTitle>
      <AlertDescription className="space-y-2">
        <p>
          Your account has been temporarily locked due to {attempts} failed login attempts.
        </p>
        <p className="flex items-center gap-1 text-sm">
          <Clock className="h-3 w-3" />
          Time remaining: <strong>{timeRemaining}</strong>
        </p>
        {showUnlockRequest && onUnlockRequest && (
          <Button
            variant="outline"
            size="sm"
            onClick={onUnlockRequest}
            className="mt-2"
          >
            Request Unlock Email
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}

interface LoginAttemptsWarningProps {
  remainingAttempts: number;
  maxAttempts?: number;
}

export function LoginAttemptsWarning({
  remainingAttempts,
  maxAttempts = 5,
}: LoginAttemptsWarningProps) {
  if (remainingAttempts >= maxAttempts) {
    return null;
  }

  const severity = remainingAttempts <= 1 ? 'destructive' : 'default';

  return (
    <Alert variant={severity} className="mb-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription>
        {remainingAttempts === 0 ? (
          <span>No attempts remaining. Your account will be locked.</span>
        ) : remainingAttempts === 1 ? (
          <span>
            <strong>Warning:</strong> 1 attempt remaining before your account is locked.
          </span>
        ) : (
          <span>{remainingAttempts} login attempts remaining.</span>
        )}
      </AlertDescription>
    </Alert>
  );
}

interface SecurityAlertProps {
  type: 'new_device' | 'suspicious_activity' | 'password_expired' | 'session_expired';
  details?: Record<string, string>;
  onDismiss?: () => void;
  onAction?: () => void;
  actionLabel?: string;
}

export function SecurityAlert({
  type,
  details = {},
  onDismiss,
  onAction,
  actionLabel,
}: SecurityAlertProps) {
  const alerts = {
    new_device: {
      icon: ShieldOff,
      title: 'New Device Login',
      description: `A new device has logged into your account${details.location ? ` from ${details.location}` : ''}.`,
      variant: 'default' as const,
    },
    suspicious_activity: {
      icon: AlertTriangle,
      title: 'Suspicious Activity Detected',
      description: details.message || 'Unusual activity has been detected on your account.',
      variant: 'destructive' as const,
    },
    password_expired: {
      icon: Lock,
      title: 'Password Expired',
      description: 'Your password has expired and must be changed.',
      variant: 'destructive' as const,
    },
    session_expired: {
      icon: Clock,
      title: 'Session Expired',
      description: 'Your session has expired. Please log in again.',
      variant: 'default' as const,
    },
  };

  const alert = alerts[type];
  const Icon = alert.icon;

  return (
    <Alert variant={alert.variant} className="mb-4">
      <Icon className="h-4 w-4" />
      <AlertTitle>{alert.title}</AlertTitle>
      <AlertDescription className="flex items-center justify-between">
        <span>{alert.description}</span>
        <div className="flex gap-2 mt-2">
          {onAction && (
            <Button size="sm" onClick={onAction}>
              {actionLabel || 'Take Action'}
            </Button>
          )}
          {onDismiss && (
            <Button size="sm" variant="ghost" onClick={onDismiss}>
              Dismiss
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
}
