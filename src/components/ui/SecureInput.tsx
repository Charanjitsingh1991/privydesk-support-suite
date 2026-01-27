import { useState, forwardRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, Copy, Check, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { generateSecurePassword } from '@/lib/security/password-validator';

interface SecureInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  showToggle?: boolean;
  showCopy?: boolean;
  showGenerate?: boolean;
  onGenerate?: (password: string) => void;
}

export const SecureInput = forwardRef<HTMLInputElement, SecureInputProps>(({
  showToggle = true,
  showCopy = false,
  showGenerate = false,
  onGenerate,
  className,
  type = 'password',
  value,
  ...props
}, ref) => {
  const [showValue, setShowValue] = useState(type !== 'password');
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!value) return;
    await navigator.clipboard.writeText(String(value));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGenerate = () => {
    const password = generateSecurePassword(16);
    onGenerate?.(password);
  };

  const hasActions = showToggle || showCopy || showGenerate;
  const actionCount = [showToggle, showCopy, showGenerate].filter(Boolean).length;

  return (
    <div className="relative">
      <Input
        ref={ref}
        type={type === 'password' && !showValue ? 'password' : 'text'}
        value={value}
        className={cn(
          hasActions && `pr-${10 + (actionCount - 1) * 8}`,
          className
        )}
        {...props}
      />
      {hasActions && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {showGenerate && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={handleGenerate}
              title="Generate secure password"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          )}
          {showCopy && value && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={handleCopy}
              title="Copy to clipboard"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          )}
          {showToggle && type === 'password' && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => setShowValue(!showValue)}
              title={showValue ? 'Hide' : 'Show'}
            >
              {showValue ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
      )}
    </div>
  );
});

SecureInput.displayName = 'SecureInput';
