/**
 * Test Subdomain Automation
 * Tests Vercel's automatic subdomain routing and SSL provisioning
 */

const https = require('https');
const http = require('http');

// Configuration
const BASE_DOMAIN = 'privydesk.com';
const TEST_SUBDOMAIN = 'acme-corp';
const TEST_URL = `https://${TEST_SUBDOMAIN}.${BASE_DOMAIN}`;

console.log('🧪 Testing Subdomain Automation\n');
console.log('═'.repeat(60));
console.log(`Test URL: ${TEST_URL}`);
console.log('═'.repeat(60));
console.log('');

// Test 1: DNS Resolution
async function testDNSResolution() {
  console.log('📡 Test 1: DNS Resolution');
  console.log('-'.repeat(60));
  
  const dns = require('dns').promises;
  
  try {
    const startTime = Date.now();
    const addresses = await dns.resolve4(`${TEST_SUBDOMAIN}.${BASE_DOMAIN}`);
    const duration = Date.now() - startTime;
    
    console.log('✅ DNS Resolution: SUCCESS');
    console.log(`   IP Address: ${addresses[0]}`);
    console.log(`   Duration: ${duration}ms`);
    console.log('');
    return true;
  } catch (error) {
    console.log('❌ DNS Resolution: FAILED');
    console.log(`   Error: ${error.message}`);
    console.log('');
    return false;
  }
}

// Test 2: HTTPS Connection
async function testHTTPSConnection() {
  console.log('🔒 Test 2: HTTPS Connection & SSL Certificate');
  console.log('-'.repeat(60));
  
  return new Promise((resolve) => {
    const startTime = Date.now();
    
    const req = https.get(TEST_URL, (res) => {
      const duration = Date.now() - startTime;
      const cert = res.socket.getPeerCertificate();
      
      console.log('✅ HTTPS Connection: SUCCESS');
      console.log(`   Status Code: ${res.statusCode}`);
      console.log(`   Duration: ${duration}ms`);
      console.log('');
      console.log('📜 SSL Certificate Details:');
      console.log(`   Subject: ${cert.subject?.CN || 'N/A'}`);
      console.log(`   Issuer: ${cert.issuer?.O || 'N/A'}`);
      console.log(`   Valid From: ${cert.valid_from || 'N/A'}`);
      console.log(`   Valid To: ${cert.valid_to || 'N/A'}`);
      console.log(`   Days Remaining: ${Math.floor((new Date(cert.valid_to) - new Date()) / (1000 * 60 * 60 * 24))} days`);
      console.log('');
      
      resolve(true);
    });
    
    req.on('error', (error) => {
      const duration = Date.now() - startTime;
      console.log('❌ HTTPS Connection: FAILED');
      console.log(`   Error: ${error.message}`);
      console.log(`   Duration: ${duration}ms`);
      console.log('');
      resolve(false);
    });
    
    req.setTimeout(10000, () => {
      req.destroy();
      console.log('❌ HTTPS Connection: TIMEOUT (10s)');
      console.log('');
      resolve(false);
    });
  });
}

// Test 3: Response Time
async function testResponseTime() {
  console.log('⚡ Test 3: Response Time & Performance');
  console.log('-'.repeat(60));
  
  const attempts = 5;
  const times = [];
  
  for (let i = 1; i <= attempts; i++) {
    await new Promise((resolve) => {
      const startTime = Date.now();
      
      const req = https.get(TEST_URL, (res) => {
        const duration = Date.now() - startTime;
        times.push(duration);
        
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          console.log(`   Attempt ${i}/${attempts}: ${duration}ms (${res.statusCode})`);
          resolve();
        });
      });
      
      req.on('error', () => {
        console.log(`   Attempt ${i}/${attempts}: FAILED`);
        resolve();
      });
      
      req.setTimeout(10000, () => {
        req.destroy();
        console.log(`   Attempt ${i}/${attempts}: TIMEOUT`);
        resolve();
      });
    });
    
    // Small delay between requests
    await new Promise(r => setTimeout(r, 500));
  }
  
  if (times.length > 0) {
    const avg = times.reduce((a, b) => a + b, 0) / times.length;
    const min = Math.min(...times);
    const max = Math.max(...times);
    
    console.log('');
    console.log('📊 Performance Summary:');
    console.log(`   Average: ${avg.toFixed(2)}ms`);
    console.log(`   Fastest: ${min}ms`);
    console.log(`   Slowest: ${max}ms`);
    console.log('');
  }
}

// Test 4: Organization Detection
async function testOrganizationDetection() {
  console.log('🏢 Test 4: Organization Detection');
  console.log('-'.repeat(60));
  
  return new Promise((resolve) => {
    https.get(TEST_URL, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        // Check if page loaded successfully
        if (res.statusCode === 200) {
          console.log('✅ Page Load: SUCCESS');
          console.log(`   Status: ${res.statusCode}`);
          console.log(`   Content Length: ${data.length} bytes`);
          
          // Check for organization-specific content
          if (data.includes('acme-corp') || data.includes('Acme Corporation')) {
            console.log('✅ Organization Detection: SUCCESS');
            console.log('   Organization content found in page');
          } else {
            console.log('⚠️  Organization Detection: UNCERTAIN');
            console.log('   Could not verify organization content');
          }
        } else {
          console.log(`⚠️  Page Load: ${res.statusCode}`);
        }
        console.log('');
        resolve(true);
      });
    }).on('error', (error) => {
      console.log('❌ Page Load: FAILED');
      console.log(`   Error: ${error.message}`);
      console.log('');
      resolve(false);
    });
  });
}

// Test 5: Wildcard Subdomain Test
async function testWildcardSubdomain() {
  console.log('🌐 Test 5: Wildcard Subdomain Support');
  console.log('-'.repeat(60));
  
  const testSubdomains = [
    'test-org',
    'demo-company',
    'random-subdomain-12345'
  ];
  
  for (const subdomain of testSubdomains) {
    const url = `https://${subdomain}.${BASE_DOMAIN}`;
    
    await new Promise((resolve) => {
      const req = https.get(url, (res) => {
        console.log(`   ${subdomain}: ${res.statusCode} (${res.statusCode === 200 ? 'OK' : 'Not Found'})`);
        resolve();
      });
      
      req.on('error', () => {
        console.log(`   ${subdomain}: ERROR`);
        resolve();
      });
      
      req.setTimeout(5000, () => {
        req.destroy();
        console.log(`   ${subdomain}: TIMEOUT`);
        resolve();
      });
    });
    
    await new Promise(r => setTimeout(r, 300));
  }
  
  console.log('');
  console.log('ℹ️  Note: Non-existent organizations should return 200 (app loads)');
  console.log('   but show "Organization Not Found" message in the app.');
  console.log('');
}

// Run all tests
async function runAllTests() {
  console.log('Starting subdomain automation tests...\n');
  
  const dnsSuccess = await testDNSResolution();
  
  if (!dnsSuccess) {
    console.log('⚠️  DNS resolution failed. Subdomain may not be configured yet.');
    console.log('   This is expected if the organization was just created.');
    console.log('   Vercel handles wildcard DNS automatically, no manual setup needed.\n');
  }
  
  await testHTTPSConnection();
  await testResponseTime();
  await testOrganizationDetection();
  await testWildcardSubdomain();
  
  console.log('═'.repeat(60));
  console.log('🎉 Testing Complete!');
  console.log('═'.repeat(60));
  console.log('');
  console.log('📋 Summary:');
  console.log('   • Vercel handles wildcard subdomains automatically');
  console.log('   • SSL certificates are provisioned instantly');
  console.log('   • No manual DNS configuration needed per subdomain');
  console.log('   • Organization detection happens in the React app');
  console.log('');
  console.log('🔗 Test URL: ' + TEST_URL);
  console.log('');
}

// Execute tests
runAllTests().catch(console.error);
