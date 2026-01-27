import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Check, ExternalLink, Settings } from 'lucide-react';
import type { Integration } from '@/types/settings';

interface IntegrationCardProps {
  integration: Integration;
  onConnect: () => void;
  onConfigure?: () => void;
  onDisconnect?: () => void;
}

export function IntegrationCard({
  integration,
  onConnect,
  onConfigure,
  onDisconnect,
}: IntegrationCardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
            <img
              src={integration.icon}
              alt={integration.name}
              className="h-8 w-8"
              onError={(e) => {
                e.currentTarget.src = '/placeholder.svg';
              }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-medium">{integration.name}</h3>
              {integration.connected && (
                <Badge variant="secondary" className="text-xs gap-1">
                  <Check className="h-3 w-3" />
                  Connected
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {integration.description}
            </p>
          </div>
          <div className="flex gap-2">
            {integration.connected ? (
              <>
                {onConfigure && (
                  <Button variant="outline" size="sm" onClick={onConfigure}>
                    <Settings className="h-4 w-4" />
                  </Button>
                )}
                {onDisconnect && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onDisconnect}
                    className="text-destructive hover:text-destructive"
                  >
                    Disconnect
                  </Button>
                )}
              </>
            ) : (
              <Button size="sm" onClick={onConnect}>
                <ExternalLink className="h-4 w-4 mr-2" />
                Connect
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
