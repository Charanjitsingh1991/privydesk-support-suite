import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  Ticket,
  Users,
  Building2,
  Home,
  Settings,
  Search,
  FileText,
  MessageSquare,
} from 'lucide-react';
import { useUser } from '@/hooks/useSession';

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const navigate = useNavigate();
  const { role } = useUser();

  // Handle keyboard shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [open, onOpenChange]);

  const runCommand = useCallback((command: () => void) => {
    onOpenChange(false);
    command();
  }, [onOpenChange]);

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search tickets, users, or navigate..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Navigation">
          <CommandItem onSelect={() => runCommand(() => navigate('/dashboard'))}>
            <Home className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/dashboard/tickets'))}>
            <Ticket className="mr-2 h-4 w-4" />
            <span>Tickets</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/dashboard/tickets/new'))}>
            <FileText className="mr-2 h-4 w-4" />
            <span>Create New Ticket</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/dashboard/chat'))}>
            <MessageSquare className="mr-2 h-4 w-4" />
            <span>Chat</span>
          </CommandItem>
        </CommandGroup>

        {(role === 'admin' || role === 'super_admin') && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Admin">
              <CommandItem onSelect={() => runCommand(() => navigate('/dashboard/team'))}>
                <Users className="mr-2 h-4 w-4" />
                <span>Team Members</span>
              </CommandItem>
              <CommandItem onSelect={() => runCommand(() => navigate('/dashboard/settings'))}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </CommandItem>
            </CommandGroup>
          </>
        )}

        {role === 'super_admin' && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Super Admin">
              <CommandItem onSelect={() => runCommand(() => navigate('/dashboard/organizations'))}>
                <Building2 className="mr-2 h-4 w-4" />
                <span>Organizations</span>
              </CommandItem>
              <CommandItem onSelect={() => runCommand(() => navigate('/dashboard/users'))}>
                <Users className="mr-2 h-4 w-4" />
                <span>All Users</span>
              </CommandItem>
            </CommandGroup>
          </>
        )}

        <CommandSeparator />
        <CommandGroup heading="Recent Searches">
          <CommandItem disabled>
            <Search className="mr-2 h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">No recent searches</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
