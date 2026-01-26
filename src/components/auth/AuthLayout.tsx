import { ReactNode } from 'react';
import { Ticket } from 'lucide-react';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-sidebar relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent" />
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-primary rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 flex flex-col justify-center px-12 lg:px-20">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-glow">
              <Ticket className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-sidebar-foreground">PRIVYDESK</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-sidebar-foreground mb-4 leading-tight">
            Support that scales<br />with your business
          </h1>
          <p className="text-lg text-sidebar-foreground/70 max-w-md">
            Multi-tenant helpdesk solution with powerful features for teams of all sizes.
          </p>
          <div className="mt-12 flex gap-8">
            <div>
              <div className="text-3xl font-bold text-primary">10k+</div>
              <div className="text-sm text-sidebar-foreground/60">Active users</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">99.9%</div>
              <div className="text-sm text-sidebar-foreground/60">Uptime SLA</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">24/7</div>
              <div className="text-sm text-sidebar-foreground/60">Support</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md animate-in">
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <Ticket className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">PRIVYDESK</span>
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">{title}</h2>
          <p className="text-muted-foreground mb-8">{subtitle}</p>
          {children}
        </div>
      </div>
    </div>
  );
}
