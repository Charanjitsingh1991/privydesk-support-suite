import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VerifyDomainRequest {
  domain: string;
  method: 'dns' | 'file';
  token: string;
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { domain, method, token }: VerifyDomainRequest = await req.json();

    if (!domain || !method || !token) {
      return new Response(
        JSON.stringify({ verified: false, error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Verifying domain: ${domain} using method: ${method}`);

    let verified = false;
    let error: string | null = null;

    if (method === 'dns') {
      // Verify DNS TXT record
      try {
        // Use Google's DNS over HTTPS API to check TXT records
        const dnsUrl = `https://dns.google/resolve?name=_privydesk-verify.${domain}&type=TXT`;
        const dnsResponse = await fetch(dnsUrl);
        const dnsData = await dnsResponse.json();

        console.log('DNS response:', JSON.stringify(dnsData));

        if (dnsData.Answer) {
          for (const record of dnsData.Answer) {
            // TXT records have quotes around the value
            const recordValue = record.data?.replace(/"/g, '').trim();
            if (recordValue === token) {
              verified = true;
              break;
            }
          }
        }

        if (!verified) {
          error = "TXT record not found or doesn't match. DNS changes may take up to 48 hours to propagate.";
        }
      } catch (dnsError) {
        console.error('DNS lookup error:', dnsError);
        error = "Could not perform DNS lookup. Please try again later.";
      }
    } else if (method === 'file') {
      // Verify file upload
      try {
        const fileUrl = `https://${domain}/privydesk-verification.html`;
        const fileResponse = await fetch(fileUrl, {
          headers: { 'User-Agent': 'PRIVYDESK-Verification-Bot/1.0' }
        });

        if (fileResponse.ok) {
          const content = await fileResponse.text();
          if (content.trim() === token) {
            verified = true;
          } else {
            error = "Verification file content doesn't match the expected token.";
          }
        } else {
          error = `Could not access verification file (HTTP ${fileResponse.status}). Make sure the file is accessible at ${fileUrl}`;
        }
      } catch (fileError) {
        console.error('File verification error:', fileError);
        error = "Could not reach your domain. Make sure it's accessible and the verification file is in place.";
      }
    }

    return new Response(
      JSON.stringify({ verified, error: verified ? null : error }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in verify-domain function:", error);
    return new Response(
      JSON.stringify({ verified: false, error: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
