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
      <div className="hidden lg:flex lg:w-1/2 bg-black relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMiI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAzMHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
        <div className="relative z-10 flex flex-col justify-center px-12 lg:px-20">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-accent-lime rounded-xl flex items-center justify-center">
              <Ticket className="w-6 h-6 text-black" />
            </div>
            <span className="text-2xl font-bold text-white">PRIVYDESK</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
            Support that scales<br />with your business
          </h1>
          <p className="text-lg text-white/70 max-w-md">
            Multi-tenant helpdesk solution with powerful features for teams of all sizes.
          </p>
          <div className="mt-12 flex gap-8">
            <div>
              <div className="text-3xl font-bold text-accent-lime">10k+</div>
              <div className="text-sm text-white/60">Active users</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-accent-lime">99.9%</div>
              <div className="text-sm text-white/60">Uptime SLA</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-accent-lime">24/7</div>
              <div className="text-sm text-white/60">Support</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-[#0a0a0a]">
        <div className="w-full max-w-md animate-in">
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-10 h-10 bg-accent-lime rounded-xl flex items-center justify-center">
              <Ticket className="w-5 h-5 text-black" />
            </div>
            <span className="text-xl font-bold text-white">PRIVYDESK</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
          <p className="text-white/60 mb-8">{subtitle}</p>
          {children}
        </div>
      </div>
    </div>
  );
}
