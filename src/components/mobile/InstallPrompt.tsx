import { Download, X, Share, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useInstallPrompt } from '@/hooks/useInstallPrompt';
import { cn } from '@/lib/utils';

interface InstallPromptProps {
  className?: string;
}

export function InstallPrompt({ className }: InstallPromptProps) {
  const { isInstallable, isInstalled, isIOS, promptInstall, dismissPrompt, showPrompt } = useInstallPrompt();

  if (!showPrompt || isInstalled || !isInstallable) {
    return null;
  }

  const handleInstall = async () => {
    if (isIOS) {
      // For iOS, we can't programmatically trigger install
      // The banner will show instructions
      return;
    }
    await promptInstall();
  };

  return (
    <Card
      className={cn(
        'fixed bottom-20 left-4 right-4 z-50 animate-in shadow-xl md:left-auto md:right-4 md:w-80',
        className
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Download className="h-6 w-6" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold">Install PRIVYDESK</h3>
            {isIOS ? (
              <p className="text-sm text-muted-foreground mt-1">
                Tap <Share className="inline h-4 w-4 mx-0.5" /> then "Add to Home Screen" <Plus className="inline h-4 w-4 mx-0.5" />
              </p>
            ) : (
              <p className="text-sm text-muted-foreground mt-1">
                Install our app for quick access and offline support
              </p>
            )}
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={dismissPrompt}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {!isIOS && (
          <div className="mt-4 flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={dismissPrompt}
            >
              Not now
            </Button>
            <Button size="sm" className="flex-1" onClick={handleInstall}>
              Install
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
