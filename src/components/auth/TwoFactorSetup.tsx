import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { generateTwoFactorSetup, verifyTOTP, formatTOTPSecret, type TwoFactorSetup as TwoFactorSetupData } from '@/lib/security/totp';
import { 
  Shield, 
  Smartphone, 
  Copy, 
  Check, 
  Download, 
  Loader2, 
  Key,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TwoFactorSetupProps {
  email: string;
  onComplete: (data: { secret: string; backupCodes: string[] }) => Promise<void>;
  onCancel?: () => void;
}

export function TwoFactorSetup({ email, onComplete, onCancel }: TwoFactorSetupProps) {
  const { toast } = useToast();
  const [step, setStep] = useState<'setup' | 'verify' | 'backup'>('setup');
  const [setupData, setSetupData] = useState<TwoFactorSetupData | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [copied, setCopied] = useState<'secret' | 'codes' | null>(null);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    // Generate setup data on mount
    const data = generateTwoFactorSetup(email);
    setSetupData(data);
  }, [email]);

  const handleCopySecret = async () => {
    if (!setupData) return;
    await navigator.clipboard.writeText(setupData.secret);
    setCopied('secret');
    setTimeout(() => setCopied(null), 2000);
    toast({ title: 'Secret copied to clipboard' });
  };

  const handleCopyBackupCodes = async () => {
    if (!setupData) return;
    const codesText = setupData.backupCodes.join('\n');
    await navigator.clipboard.writeText(codesText);
    setCopied('codes');
    setTimeout(() => setCopied(null), 2000);
    toast({ title: 'Backup codes copied to clipboard' });
  };

  const handleDownloadBackupCodes = () => {
    if (!setupData) return;
    const content = `PRIVYDESK 2FA Backup Codes
Generated: ${new Date().toISOString()}
Email: ${email}

Keep these codes safe! Each code can only be used once.

${setupData.backupCodes.map((code, i) => `${i + 1}. ${code}`).join('\n')}

If you lose access to your authenticator app, use one of these codes to sign in.
`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'privydesk-2fa-backup-codes.txt';
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: 'Backup codes downloaded' });
  };

  const handleVerify = async () => {
    if (!setupData || !verificationCode) return;
    
    setVerifying(true);
    try {
      const isValid = await verifyTOTP(setupData.secret, verificationCode);
      if (isValid) {
        setStep('backup');
      } else {
        toast({
          title: 'Invalid code',
          description: 'The code you entered is incorrect. Please try again.',
          variant: 'destructive',
        });
      }
    } catch {
      toast({
        title: 'Verification failed',
        description: 'Could not verify the code. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setVerifying(false);
    }
  };

  const handleComplete = async () => {
    if (!setupData) return;
    
    setCompleting(true);
    try {
      await onComplete({
        secret: setupData.secret,
        backupCodes: setupData.backupCodes,
      });
      toast({
        title: '2FA Enabled',
        description: 'Two-factor authentication has been enabled for your account.',
      });
    } catch {
      toast({
        title: 'Error enabling 2FA',
        description: 'Could not save 2FA settings. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setCompleting(false);
    }
  };

  if (!setupData) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Generate QR code using a service (in production, use a library like qrcode)
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(setupData.qrCodeUrl)}`;

  return (
    <div className="space-y-6">
      {step === 'setup' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              Step 1: Scan QR Code
            </CardTitle>
            <CardDescription>
              Open your authenticator app and scan this QR code to add PRIVYDESK
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center gap-4">
              <div className="border rounded-lg p-4 bg-white">
                <img 
                  src={qrCodeUrl} 
                  alt="2FA QR Code" 
                  className="w-48 h-48"
                />
              </div>
              
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  Can't scan? Enter this code manually:
                </p>
                <div className="flex items-center gap-2 justify-center">
                  <code className="bg-muted px-3 py-1.5 rounded font-mono text-sm">
                    {formatTOTPSecret(setupData.secret)}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopySecret}
                  >
                    {copied === 'secret' ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>

            <Alert>
              <Smartphone className="h-4 w-4" />
              <AlertDescription>
                Popular authenticator apps: Google Authenticator, Authy, 1Password, Microsoft Authenticator
              </AlertDescription>
            </Alert>

            <div className="flex gap-2">
              {onCancel && (
                <Button variant="outline" onClick={onCancel} className="flex-1">
                  Cancel
                </Button>
              )}
              <Button onClick={() => setStep('verify')} className="flex-1">
                Continue
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 'verify' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Step 2: Verify Setup
            </CardTitle>
            <CardDescription>
              Enter the 6-digit code from your authenticator app
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="verification-code">Verification Code</Label>
              <Input
                id="verification-code"
                placeholder="000000"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="text-center text-2xl tracking-widest font-mono"
                maxLength={6}
              />
              <p className="text-xs text-muted-foreground text-center">
                The code changes every 30 seconds
              </p>
            </div>

            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setStep('setup')}
                className="flex-1"
              >
                Back
              </Button>
              <Button 
                onClick={handleVerify} 
                disabled={verificationCode.length !== 6 || verifying}
                className="flex-1"
              >
                {verifying && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Verify
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 'backup' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Step 3: Save Backup Codes
            </CardTitle>
            <CardDescription>
              Save these backup codes in a safe place. You can use them to sign in if you lose access to your authenticator.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert variant="destructive" className="border-amber-200 bg-amber-50 text-amber-800">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Each code can only be used once. Keep them secure and don't share them.
              </AlertDescription>
            </Alert>

            <div className="bg-muted rounded-lg p-4">
              <div className="grid grid-cols-2 gap-2">
                {setupData.backupCodes.map((code, index) => (
                  <div
                    key={index}
                    className="font-mono text-sm bg-background px-3 py-2 rounded text-center"
                  >
                    {code}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleCopyBackupCodes}
                className="flex-1"
              >
                {copied === 'codes' ? (
                  <Check className="h-4 w-4 mr-2 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4 mr-2" />
                )}
                Copy
              </Button>
              <Button
                variant="outline"
                onClick={handleDownloadBackupCodes}
                className="flex-1"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>

            <Button 
              onClick={handleComplete} 
              disabled={completing}
              className="w-full"
            >
              {completing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Enable 2FA
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

interface TwoFactorVerifyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVerify: (code: string) => Promise<boolean>;
  allowBackupCode?: boolean;
}

export function TwoFactorVerifyDialog({
  open,
  onOpenChange,
  onVerify,
  allowBackupCode = true,
}: TwoFactorVerifyDialogProps) {
  const { toast } = useToast();
  const [code, setCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [useBackupCode, setUseBackupCode] = useState(false);

  const handleVerify = async () => {
    if (!code) return;
    
    setVerifying(true);
    try {
      const success = await onVerify(code);
      if (success) {
        onOpenChange(false);
        setCode('');
      } else {
        toast({
          title: 'Invalid code',
          description: 'Please check your code and try again.',
          variant: 'destructive',
        });
      }
    } catch {
      toast({
        title: 'Verification failed',
        description: 'An error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setVerifying(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Two-Factor Authentication
          </DialogTitle>
          <DialogDescription>
            {useBackupCode
              ? 'Enter one of your backup codes'
              : 'Enter the code from your authenticator app'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="2fa-code">
              {useBackupCode ? 'Backup Code' : 'Authentication Code'}
            </Label>
            <Input
              id="2fa-code"
              placeholder={useBackupCode ? 'XXXX-XXXX' : '000000'}
              value={code}
              onChange={(e) => setCode(useBackupCode 
                ? e.target.value.toUpperCase()
                : e.target.value.replace(/\D/g, '').slice(0, 6)
              )}
              className="text-center text-xl tracking-widest font-mono"
              maxLength={useBackupCode ? 9 : 6}
            />
          </div>

          {allowBackupCode && (
            <Button
              variant="link"
              className="p-0 h-auto text-sm"
              onClick={() => {
                setUseBackupCode(!useBackupCode);
                setCode('');
              }}
            >
              {useBackupCode ? 'Use authenticator app instead' : 'Use a backup code'}
            </Button>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleVerify} 
            disabled={!code || verifying}
          >
            {verifying && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Verify
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface TwoFactorStatusProps {
  enabled: boolean;
  onEnable: () => void;
  onDisable: () => void;
  className?: string;
}

export function TwoFactorStatus({ enabled, onEnable, onDisable, className }: TwoFactorStatusProps) {
  return (
    <div className={cn('flex items-center justify-between gap-4', className)}>
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4" />
          <span className="font-medium">Two-Factor Authentication</span>
          <Badge variant={enabled ? 'default' : 'secondary'}>
            {enabled ? 'Enabled' : 'Disabled'}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          {enabled
            ? 'Your account is protected with 2FA'
            : 'Add an extra layer of security to your account'}
        </p>
      </div>
      <Button
        variant={enabled ? 'outline' : 'default'}
        onClick={enabled ? onDisable : onEnable}
      >
        {enabled ? (
          <>
            <RefreshCw className="h-4 w-4 mr-2" />
            Reconfigure
          </>
        ) : (
          <>
            <Shield className="h-4 w-4 mr-2" />
            Enable
          </>
        )}
      </Button>
    </div>
  );
}
