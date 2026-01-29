import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Known phishing patterns
const SUSPICIOUS_PATTERNS = [
  /bit\.ly/i,
  /tinyurl\.com/i,
  /goo\.gl/i,
  /t\.co/i,
  /paypa[il1]\.com/i,
  /g00gle\.com/i,
  /micros[o0]ft\.com/i,
  /amaz[o0]n\.com/i,
  /\.(tk|ml|ga|cf|gq|pw|top|xyz|work|click|link)$/i,
  /https?:\/\/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/i,
];

// Dangerous file extensions
const DANGEROUS_EXTENSIONS = [
  '.exe', '.bat', '.sh', '.cmd', '.com', '.scr', '.vbs', '.vbe',
  '.js', '.jse', '.ws', '.wsf', '.msc', '.msi', '.msp', '.pif',
  '.reg', '.ps1', '.psm1', '.dll', '.sys', '.drv', '.ocx'
];

interface ScanLinkRequest {
  url: string;
  organizationId?: string;
  organizationDomains?: string[];
}

interface ScanAttachmentRequest {
  fileName: string;
  mimeType: string;
  fileSize: number;
  organizationId: string;
}

interface LogEventRequest {
  organizationId: string;
  eventType: string;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  details?: Record<string, unknown>;
  severity?: 'low' | 'medium' | 'high' | 'critical';
}

function getDomainFromUrl(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.hostname.toLowerCase();
  } catch {
    return '';
  }
}

function isSuspiciousUrl(url: string): { suspicious: boolean; reason?: string } {
  for (const pattern of SUSPICIOUS_PATTERNS) {
    if (pattern.test(url)) {
      return { suspicious: true, reason: 'URL matches suspicious pattern' };
    }
  }

  const domain = getDomainFromUrl(url);
  
  // Check for excessive subdomains
  const subdomainCount = (domain.match(/\./g) || []).length;
  if (subdomainCount > 3) {
    return { suspicious: true, reason: 'Excessive subdomains detected' };
  }

  return { suspicious: false };
}

function isDangerousFile(fileName: string): { dangerous: boolean; reason?: string } {
  const ext = fileName.slice(fileName.lastIndexOf('.')).toLowerCase();
  
  if (DANGEROUS_EXTENSIONS.includes(ext)) {
    return { dangerous: true, reason: `File type not allowed: ${ext}` };
  }

  // Check for double extensions
  const dangerousPatterns = DANGEROUS_EXTENSIONS.map(e => 
    new RegExp(`\\.[a-z]{2,4}\\${e}$`, 'i')
  );
  
  if (dangerousPatterns.some(pattern => pattern.test(fileName))) {
    return { dangerous: true, reason: 'Suspicious double extension detected' };
  }

  return { dangerous: false };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const action = url.pathname.split('/').pop();

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    if (action === 'scan-link') {
      const body: ScanLinkRequest = await req.json();
      
      const suspiciousCheck = isSuspiciousUrl(body.url);
      const domain = getDomainFromUrl(body.url);
      const trustedDomain = body.organizationDomains?.some(d => 
        domain === d || domain.endsWith(`.${d}`)
      ) ?? false;

      // Log if suspicious
      if (suspiciousCheck.suspicious && body.organizationId) {
        await supabaseAdmin.from('security_events').insert({
          organization_id: body.organizationId,
          event_type: 'suspicious_link',
          details: { url: body.url, reason: suspiciousCheck.reason },
          severity: 'medium',
        });

        await supabaseAdmin.from('flagged_content').insert({
          organization_id: body.organizationId,
          content_type: 'link',
          flagged_content: body.url,
          reason: suspiciousCheck.reason || 'Suspicious URL pattern detected',
          severity: 'medium',
          auto_flagged: true,
        });
      }

      return new Response(
        JSON.stringify({
          url: body.url,
          safe: !suspiciousCheck.suspicious,
          reason: suspiciousCheck.reason,
          external: !trustedDomain,
          trustedDomain,
        }),
        { headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (action === 'scan-attachment') {
      const body: ScanAttachmentRequest = await req.json();
      
      const dangerousCheck = isDangerousFile(body.fileName);

      // Log if dangerous
      if (dangerousCheck.dangerous) {
        await supabaseAdmin.from('security_events').insert({
          organization_id: body.organizationId,
          event_type: 'dangerous_file_blocked',
          details: { fileName: body.fileName, reason: dangerousCheck.reason },
          severity: 'high',
        });

        await supabaseAdmin.from('flagged_content').insert({
          organization_id: body.organizationId,
          content_type: 'attachment',
          flagged_content: body.fileName,
          reason: dangerousCheck.reason || 'Dangerous file type blocked',
          severity: 'high',
          auto_flagged: true,
        });
      }

      return new Response(
        JSON.stringify({
          fileName: body.fileName,
          safe: !dangerousCheck.dangerous,
          reason: dangerousCheck.reason,
          blocked: dangerousCheck.dangerous,
        }),
        { headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (action === 'log-event') {
      const body: LogEventRequest = await req.json();
      
      const { error } = await supabaseAdmin.from('security_events').insert({
        organization_id: body.organizationId,
        event_type: body.eventType,
        user_id: body.userId,
        ip_address: body.ipAddress,
        user_agent: body.userAgent,
        details: body.details || {},
        severity: body.severity || 'low',
      });

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Unknown action" }),
      { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("Error in security-scan:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
