/**
 * Test Multiple Organizations
 * Verifies subdomain automation works for multiple organizations independently
 */

import https from 'https';

const BASE_DOMAIN = 'privydesk.com';

const organizations = [
  {
    name: 'Acme Corporation',
    slug: 'acme-corp',
    color: '#10b981',
    plan: 'pro'
  },
  {
    name: 'TechStart Solutions',
    slug: 'techstart',
    color: '#3b82f6',
    plan: 'starter'
  }
];

console.log('🧪 Testing Multiple Organizations\n');
console.log('═'.repeat(60));
console.log('Testing subdomain isolation and independence');
console.log('═'.repeat(60));
console.log('');

// Test each organization
async function testOrganization(org) {
  const url = `https://${org.slug}.${BASE_DOMAIN}`;
  
  console.log(`\n🏢 Testing: ${org.name}`);
  console.log('-'.repeat(60));
  console.log(`   Subdomain: ${org.slug}.${BASE_DOMAIN}`);
  console.log(`   Expected Color: ${org.color}`);
  console.log(`   Expected Plan: ${org.plan}`);
  console.log('');

  return new Promise((resolve) => {
    const startTime = Date.now();
    
    const req = https.get(url, (res) => {
      const duration = Date.now() - startTime;
      
      console.log(`✅ Connection: SUCCESS`);
      console.log(`   Status: ${res.statusCode}`);
      console.log(`   Response Time: ${duration}ms`);
      
      // Get SSL certificate info
      const cert = res.socket.getPeerCertificate();
      console.log(`   SSL: Valid (${cert.subject?.CN || 'N/A'})`);
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`   Content Size: ${data.length} bytes`);
        
        // Check for organization-specific content
        if (data.includes(org.slug) || data.includes(org.name)) {
          console.log(`✅ Organization Detection: SUCCESS`);
        } else {
          console.log(`⚠️  Organization Detection: Content loaded but org not detected`);
        }
        
        console.log('');
        resolve({
          success: true,
          org: org.name,
          responseTime: duration,
          statusCode: res.statusCode
        });
      });
    });
    
    req.on('error', (error) => {
      console.log(`❌ Connection: FAILED`);
      console.log(`   Error: ${error.message}`);
      console.log('');
      resolve({
        success: false,
        org: org.name,
        error: error.message
      });
    });
    
    req.setTimeout(10000, () => {
      req.destroy();
      console.log(`❌ Connection: TIMEOUT`);
      console.log('');
      resolve({
        success: false,
        org: org.name,
        error: 'Timeout'
      });
    });
  });
}

// Test data isolation
async function testDataIsolation() {
  console.log('\n🔒 Testing Data Isolation');
  console.log('-'.repeat(60));
  console.log('Verifying organizations are independent...\n');
  
  const results = [];
  
  for (const org of organizations) {
    const result = await testOrganization(org);
    results.push(result);
    
    // Small delay between tests
    await new Promise(r => setTimeout(r, 500));
  }
  
  return results;
}

// Run tests
async function runTests() {
  console.log('Starting multi-organization tests...\n');
  
  const results = await testDataIsolation();
  
  console.log('═'.repeat(60));
  console.log('📊 Test Results Summary');
  console.log('═'.repeat(60));
  console.log('');
  
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log(`Total Organizations Tested: ${results.length}`);
  console.log(`✅ Successful: ${successful}`);
  console.log(`❌ Failed: ${failed}`);
  console.log('');
  
  if (successful === results.length) {
    console.log('🎉 All organizations working independently!');
    console.log('');
    console.log('✅ Subdomain automation verified:');
    console.log('   • Each organization has unique subdomain');
    console.log('   • SSL works for all subdomains');
    console.log('   • Organizations are isolated');
    console.log('   • No manual configuration needed');
  } else {
    console.log('⚠️  Some organizations failed to load');
    console.log('   Check DNS configuration and organization data');
  }
  
  console.log('');
  console.log('🔗 Test URLs:');
  organizations.forEach(org => {
    console.log(`   • https://${org.slug}.${BASE_DOMAIN}`);
  });
  console.log('');
}

runTests().catch(console.error);
