import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, X, Ticket, MessageSquare, QrCode } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

interface FABAction {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  color?: string;
}

interface FloatingActionButtonProps {
  className?: string;
}

export function FloatingActionButton({ className }: FloatingActionButtonProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  if (!isMobile) return null;

  const actions: FABAction[] = [
    {
      icon: Ticket,
      label: 'New Ticket',
      onClick: () => {
        navigate('/dashboard/tickets/new');
        setIsExpanded(false);
      },
    },
    {
      icon: MessageSquare,
      label: 'Start Chat',
      onClick: () => {
        navigate('/dashboard/live-chat');
        setIsExpanded(false);
      },
    },
    {
      icon: QrCode,
      label: 'Scan QR',
      onClick: () => {
        // TODO: Implement QR scanner
        setIsExpanded(false);
      },
    },
  ];

  return (
    <>
      {/* Backdrop */}
      {isExpanded && (
        <div
          className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm"
          onClick={() => setIsExpanded(false)}
        />
      )}

      <div
        className={cn(
          'fixed bottom-20 right-4 z-50 flex flex-col items-end gap-3',
          className
        )}
      >
        {/* Action buttons */}
        <div
          className={cn(
            'flex flex-col items-end gap-2 transition-all duration-200',
            isExpanded
              ? 'pointer-events-auto opacity-100 translate-y-0'
              : 'pointer-events-none opacity-0 translate-y-4'
          )}
        >
          {actions.map((action, index) => {
            const Icon = action.icon;
            return (
              <div
                key={action.label}
                className="flex items-center gap-3"
                style={{
                  transitionDelay: isExpanded ? `${index * 50}ms` : '0ms',
                }}
              >
                <span className="rounded-lg bg-card px-3 py-1.5 text-sm font-medium shadow-lg">
                  {action.label}
                </span>
                <Button
                  size="icon"
                  className="h-12 w-12 rounded-full shadow-lg"
                  onClick={action.onClick}
                >
                  <Icon className="h-5 w-5" />
                </Button>
              </div>
            );
          })}
        </div>

        {/* Main FAB */}
        <Button
          size="icon"
          className={cn(
            'h-14 w-14 rounded-full shadow-xl transition-transform duration-200',
            isExpanded && 'rotate-45 bg-destructive hover:bg-destructive/90'
          )}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? (
            <X className="h-6 w-6" />
          ) : (
            <Plus className="h-6 w-6" />
          )}
        </Button>
      </div>
    </>
  );
}
