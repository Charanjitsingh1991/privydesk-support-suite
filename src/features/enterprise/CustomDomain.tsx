import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Globe, CheckCircle, AlertCircle, Copy } from 'lucide-react';

export function CustomDomain() {
  const { toast } = useToast();
  const [domain, setDomain] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  const dnsRecords = [
    { type: 'A', name: '@', value: '76.76.21.21', ttl: '3600' },
    { type: 'CNAME', name: 'www', value: 'cname.privydesk.com', ttl: '3600' },
    { type: 'TXT', name: '_privydesk', value: 'privydesk-verification=abc123xyz', ttl: '3600' },
  ];

  const handleVerifyDomain = async () => {
    setIsVerifying(true);
    // Simulate DNS verification
    setTimeout(() => {
      setIsVerifying(false);
      setIsVerified(true);
      toast({
        title: 'Domain Verified',
        description: 'Your custom domain has been successfully verified.',
      });
    }, 2000);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied',
      description: 'DNS record copied to clipboard',
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Custom Domain</h2>
        <p className="text-white/60">Use your own domain for your helpdesk portal</p>
      </div>

      {/* Domain Input */}
      <Card className="p-6 bg-white/5 border-white/10">
        <div className="space-y-4">
          <div>
            <Label className="text-white/80">Your Domain</Label>
            <div className="flex gap-2">
              <Input
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="support.yourcompany.com"
                className="bg-black/20 border-white/10 text-white"
              />
              <Button
                onClick={handleVerifyDomain}
                disabled={!domain || isVerifying}
                className="bg-accent-lime text-black hover:bg-accent-lime/90"
              >
                {isVerifying ? 'Verifying...' : 'Verify'}
              </Button>
            </div>
          </div>

          {isVerified && (
            <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-green-500">Domain verified and active</span>
            </div>
          )}
        </div>
      </Card>

      {/* DNS Configuration */}
      {domain && (
        <Card className="p-6 bg-white/5 border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5 text-accent-lime" />
            DNS Configuration
          </h3>
          <p className="text-white/60 mb-4">
            Add these DNS records to your domain provider:
          </p>

          <div className="space-y-3">
            {dnsRecords.map((record, index) => (
              <div
                key={index}
                className="p-4 bg-black/20 border border-white/10 rounded-lg"
              >
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-white/60">Type</span>
                    <p className="text-white font-mono">{record.type}</p>
                  </div>
                  <div>
                    <span className="text-white/60">Name</span>
                    <p className="text-white font-mono">{record.name}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-white/60">Value</span>
                    <div className="flex items-center gap-2">
                      <p className="text-white font-mono truncate">{record.value}</p>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(record.value)}
                        className="text-accent-lime hover:text-accent-lime/80"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg flex gap-3">
            <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-500">
              <p className="font-semibold mb-1">DNS Propagation</p>
              <p className="text-blue-500/80">
                DNS changes can take up to 48 hours to propagate globally. You can verify your
                domain once the DNS records are active.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* SSL Certificate */}
      {isVerified && (
        <Card className="p-6 bg-white/5 border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4">SSL Certificate</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white">Automatic SSL certificate provisioning</p>
              <p className="text-sm text-white/60">
                We'll automatically provision and renew SSL certificates for your domain
              </p>
            </div>
            <CheckCircle className="w-6 h-6 text-green-500" />
          </div>
        </Card>
      )}
    </div>
  );
}
