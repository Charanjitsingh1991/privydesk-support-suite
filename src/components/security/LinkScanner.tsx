import { useState, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Shield, AlertTriangle, Check } from 'lucide-react';
import { ExternalLinkWarning } from './ExternalLinkWarning';
import { scanLink } from '@/lib/security/link-validator';
import type { LinkScanResult } from '@/types/security';

interface LinkScannerProps {
  url: string;
  children?: React.ReactNode;
  organizationDomains?: string[];
  className?: string;
}

export function LinkScanner({ 
  url, 
  children, 
  organizationDomains = [],
  className 
}: LinkScannerProps) {
  const [showWarning, setShowWarning] = useState(false);
  const [scanResult, setScanResult] = useState<LinkScanResult | null>(null);

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    
    const result = scanLink(url, organizationDomains);
    setScanResult(result);
    
    // If it's a trusted domain, open directly
    if (result.trustedDomain) {
      window.open(url, '_blank', 'noopener,noreferrer');
      return;
    }
    
    // Show warning for external or suspicious links
    setShowWarning(true);
  }, [url, organizationDomains]);

  const handleConfirm = useCallback(() => {
    window.open(url, '_blank', 'noopener,noreferrer');
    setShowWarning(false);
  }, [url]);

  const result = scanResult || scanLink(url, organizationDomains);

  return (
    <>
      <a
        href={url}
        onClick={handleClick}
        className={`inline-flex items-center gap-1 ${className}`}
        rel="noopener noreferrer"
      >
        {children || url}
        {result.trustedDomain ? (
          <Check className="h-3 w-3 text-green-500" />
        ) : result.safe ? (
          <ExternalLink className="h-3 w-3 text-muted-foreground" />
        ) : (
          <AlertTriangle className="h-3 w-3 text-destructive" />
        )}
        {!result.trustedDomain && result.external && (
          <Badge variant="outline" className="text-[10px] px-1 py-0">
            External
          </Badge>
        )}
      </a>
      
      <ExternalLinkWarning
        open={showWarning}
        onOpenChange={setShowWarning}
        url={url}
        isSuspicious={!result.safe}
        reason={result.reason}
        onConfirm={handleConfirm}
      />
    </>
  );
}

interface ScanLinksInContentProps {
  content: string;
  organizationDomains?: string[];
}

export function ScanLinksInContent({ content, organizationDomains = [] }: ScanLinksInContentProps) {
  // This component renders content with scanned links
  const urlRegex = /(https?:\/\/[^\s<>"']+)/gi;
  const parts = content.split(urlRegex);
  
  return (
    <>
      {parts.map((part, index) => {
        if (urlRegex.test(part)) {
          urlRegex.lastIndex = 0; // Reset regex state
          return (
            <LinkScanner 
              key={index} 
              url={part} 
              organizationDomains={organizationDomains}
              className="text-primary underline hover:no-underline"
            />
          );
        }
        return <span key={index}>{part}</span>;
      })}
    </>
  );
}
