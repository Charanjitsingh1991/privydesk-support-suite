/**
 * DNS Verification Service
 * Real DNS lookup and verification for custom domains
 */

export interface DNSRecord {
  type: 'A' | 'AAAA' | 'CNAME' | 'TXT' | 'MX';
  name: string;
  value: string;
  ttl?: number;
}

export interface DNSVerificationResult {
  verified: boolean;
  message: string;
  details?: {
    txtRecordFound: boolean;
    txtRecordValue?: string;
    cnameRecordFound: boolean;
    cnameRecordValue?: string;
    aRecordFound: boolean;
    aRecordValue?: string;
  };
}

/**
 * DNS Verification Service using Google DNS API
 * Free, no API key required, reliable
 */
export class DNSVerificationService {
  private static readonly GOOGLE_DNS_API = 'https://dns.google/resolve';
  private static readonly EXPECTED_CNAME = 'custom.privydesk.com';
  private static readonly EXPECTED_A_RECORD = '76.76.21.21'; // Your Hostinger IP

  /**
   * Verify domain ownership via TXT record
   */
  static async verifyTxtRecord(
    domain: string,
    expectedToken: string
  ): Promise<{ found: boolean; value?: string }> {
    try {
      const txtDomain = `_privydesk.${domain}`;
      const response = await fetch(
        `${this.GOOGLE_DNS_API}?name=${txtDomain}&type=TXT`
      );

      if (!response.ok) {
        throw new Error('DNS lookup failed');
      }

      const data = await response.json();
      
      if (!data.Answer || data.Answer.length === 0) {
        return { found: false };
      }

      // TXT records are returned with quotes, need to clean them
      const txtRecords = data.Answer.map((record: { data: string }) => 
        record.data.replace(/"/g, '')
      );

      const matchingRecord = txtRecords.find((record: string) =>
        record.includes(`privydesk-verify=${expectedToken}`)
      );

      return {
        found: !!matchingRecord,
        value: matchingRecord,
      };
    } catch (error) {
      console.error('TXT record verification failed:', error);
      return { found: false };
    }
  }

  /**
   * Verify CNAME record points to PrivyDesk
   */
  static async verifyCnameRecord(
    domain: string
  ): Promise<{ found: boolean; value?: string }> {
    try {
      const response = await fetch(
        `${this.GOOGLE_DNS_API}?name=${domain}&type=CNAME`
      );

      if (!response.ok) {
        throw new Error('DNS lookup failed');
      }

      const data = await response.json();

      if (!data.Answer || data.Answer.length === 0) {
        return { found: false };
      }

      const cnameValue = data.Answer[0].data.replace(/\.$/, ''); // Remove trailing dot

      return {
        found: cnameValue === this.EXPECTED_CNAME,
        value: cnameValue,
      };
    } catch (error) {
      console.error('CNAME record verification failed:', error);
      return { found: false };
    }
  }

  /**
   * Verify A record points to PrivyDesk IP
   */
  static async verifyARecord(
    domain: string
  ): Promise<{ found: boolean; value?: string }> {
    try {
      const response = await fetch(
        `${this.GOOGLE_DNS_API}?name=${domain}&type=A`
      );

      if (!response.ok) {
        throw new Error('DNS lookup failed');
      }

      const data = await response.json();

      if (!data.Answer || data.Answer.length === 0) {
        return { found: false };
      }

      const aValue = data.Answer[0].data;

      return {
        found: aValue === this.EXPECTED_A_RECORD,
        value: aValue,
      };
    } catch (error) {
      console.error('A record verification failed:', error);
      return { found: false };
    }
  }

  /**
   * Complete domain verification
   * Checks TXT record for ownership and CNAME/A record for routing
   */
  static async verifyDomain(
    domain: string,
    verificationToken: string
  ): Promise<DNSVerificationResult> {
    // Step 1: Verify TXT record (ownership)
    const txtResult = await this.verifyTxtRecord(domain, verificationToken);

    if (!txtResult.found) {
      return {
        verified: false,
        message: 'TXT record not found. Please add the verification record to your DNS.',
        details: {
          txtRecordFound: false,
          cnameRecordFound: false,
          aRecordFound: false,
        },
      };
    }

    // Step 2: Verify CNAME or A record (routing)
    const cnameResult = await this.verifyCnameRecord(domain);
    const aResult = await this.verifyARecord(domain);

    const routingConfigured = cnameResult.found || aResult.found;

    if (!routingConfigured) {
      return {
        verified: false,
        message: 'DNS records found but routing not configured. Please add CNAME or A record.',
        details: {
          txtRecordFound: true,
          txtRecordValue: txtResult.value,
          cnameRecordFound: false,
          aRecordFound: false,
        },
      };
    }

    // Success!
    return {
      verified: true,
      message: 'Domain verified successfully!',
      details: {
        txtRecordFound: true,
        txtRecordValue: txtResult.value,
        cnameRecordFound: cnameResult.found,
        cnameRecordValue: cnameResult.value,
        aRecordFound: aResult.found,
        aRecordValue: aResult.value,
      },
    };
  }

  /**
   * Check if DNS has propagated (can take up to 48 hours)
   */
  static async checkDNSPropagation(domain: string): Promise<{
    propagated: boolean;
    message: string;
  }> {
    try {
      // Check multiple DNS servers
      const servers = [
        'https://dns.google/resolve',
        'https://cloudflare-dns.com/dns-query',
      ];

      const results = await Promise.all(
        servers.map(async (server) => {
          try {
            const response = await fetch(`${server}?name=${domain}&type=A`, {
              headers: { Accept: 'application/dns-json' },
            });
            return response.ok;
          } catch {
            return false;
          }
        })
      );

      const propagated = results.every((r) => r);

      return {
        propagated,
        message: propagated
          ? 'DNS has propagated globally'
          : 'DNS propagation in progress. This can take up to 48 hours.',
      };
    } catch (error) {
      return {
        propagated: false,
        message: 'Unable to check DNS propagation',
      };
    }
  }

  /**
   * Get recommended DNS records for a domain
   */
  static getRecommendedDNSRecords(
    domain: string,
    verificationToken: string
  ): DNSRecord[] {
    return [
      {
        type: 'TXT',
        name: `_privydesk.${domain}`,
        value: `privydesk-verify=${verificationToken}`,
        ttl: 3600,
      },
      {
        type: 'CNAME',
        name: domain,
        value: this.EXPECTED_CNAME,
        ttl: 3600,
      },
      {
        type: 'A',
        name: domain,
        value: this.EXPECTED_A_RECORD,
        ttl: 3600,
      },
    ];
  }
}
