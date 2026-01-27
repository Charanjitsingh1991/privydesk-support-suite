import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Shield, AlertTriangle } from 'lucide-react';

interface ExternalLinkWarningProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  url: string;
  isSuspicious?: boolean;
  reason?: string;
  onConfirm: () => void;
}

export function ExternalLinkWarning({
  open,
  onOpenChange,
  url,
  isSuspicious = false,
  reason,
  onConfirm,
}: ExternalLinkWarningProps) {
  const domain = (() => {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  })();

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            {isSuspicious ? (
              <>
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Suspicious Link Detected
              </>
            ) : (
              <>
                <Shield className="h-5 w-5 text-yellow-500" />
                External Link Warning
              </>
            )}
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-4">
            <p>
              You're about to visit an external website:
            </p>
            <div className="p-3 rounded-md bg-muted break-all">
              <code className="text-sm">{url}</code>
            </div>
            {isSuspicious ? (
              <div className="flex items-start gap-2 p-3 rounded-md bg-destructive/10 text-destructive">
                <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">This link appears suspicious</p>
                  {reason && <p className="text-sm">{reason}</p>}
                  <p className="text-sm mt-1">
                    We recommend not clicking this link. If you received this from someone you trust, 
                    verify with them directly.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-2">
                <ExternalLink className="h-5 w-5 flex-shrink-0 mt-0.5 text-muted-foreground" />
                <p>
                  This link will open in a new tab. Make sure you trust <Badge variant="secondary">{domain}</Badge> before proceeding.
                </p>
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm}
            className={isSuspicious ? 'bg-destructive hover:bg-destructive/90' : ''}
          >
            {isSuspicious ? 'Open Anyway (Not Recommended)' : 'Open in New Tab'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
