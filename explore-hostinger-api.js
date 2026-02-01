// Explore Hostinger API endpoints
const API_TOKEN = '8gCIfK6AvTGIKN8m0OzrGe7atDx2NYs9k3yyytHW12ccc601';
const BASE_URL = 'https://developers.hostinger.com/api';

async function exploreAPI() {
  console.log('🔍 Exploring Hostinger API endpoints...\n');

  const endpoints = [
    // VPS endpoints
    { name: 'VPS List', url: '/vps/v1/virtual-machines' },
    
    // Hosting endpoints (for shared hosting/domains)
    { name: 'Hosting Accounts', url: '/hosting/v1/accounts' },
    { name: 'Hosting Domains', url: '/hosting/v1/domains' },
    
    // Website endpoints
    { name: 'Websites', url: '/websites/v1' },
    
    // Email endpoints
    { name: 'Email Accounts', url: '/email/v1/accounts' },
    
    // SSL endpoints
    { name: 'SSL Certificates', url: '/ssl/v1/certificates' },
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`\n📡 Testing: ${endpoint.name}`);
      console.log(`   URL: ${BASE_URL}${endpoint.url}`);
      
      const response = await fetch(`${BASE_URL}${endpoint.url}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${API_TOKEN}`,
          'Content-Type': 'application/json',
        },
      });

      console.log(`   Status: ${response.status}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`   ✅ Success!`);
        console.log(`   Data:`, JSON.stringify(data, null, 2).substring(0, 500));
      } else {
        const error = await response.text();
        console.log(`   ❌ Failed: ${error.substring(0, 200)}`);
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
  }

  console.log('\n\n📚 Checking Hostinger API Documentation...');
  console.log('Based on the token, this appears to be a VPS API token.');
  console.log('For domain/subdomain management, you may need:');
  console.log('1. A different API token (Hosting API token)');
  console.log('2. Or use cPanel API if available');
  console.log('3. Or manual subdomain creation in Hostinger panel');
}

exploreAPI();
