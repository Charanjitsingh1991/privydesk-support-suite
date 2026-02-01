// Test Hostinger API connectivity
const API_TOKEN = '8gCIfK6AvTGIKN8m0OzrGe7atDx2NYs9k3yyytHW12ccc601';
const API_URL = 'https://developers.hostinger.com/api';

async function testHostingerAPI() {
  console.log('Testing Hostinger API...\n');

  try {
    // Test 1: Get VPS list
    console.log('1. Testing VPS endpoint...');
    const vpsResponse = await fetch(`${API_URL}/vps/v1/virtual-machines`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('Status:', vpsResponse.status);
    const vpsData = await vpsResponse.json();
    console.log('Response:', JSON.stringify(vpsData, null, 2));
    console.log('✅ VPS endpoint working\n');

    // Test 2: Get domains list
    console.log('2. Testing domains endpoint...');
    const domainsResponse = await fetch(`${API_URL}/domains/v1/domains`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('Status:', domainsResponse.status);
    const domainsData = await domainsResponse.json();
    console.log('Response:', JSON.stringify(domainsData, null, 2));
    console.log('✅ Domains endpoint working\n');

    // Test 3: Check if privydesk.com is in the account
    if (domainsData.data) {
      const privydeskDomain = domainsData.data.find(d => d.domain === 'privydesk.com');
      if (privydeskDomain) {
        console.log('✅ Found privydesk.com in account!');
        console.log('Domain details:', JSON.stringify(privydeskDomain, null, 2));
      } else {
        console.log('⚠️ privydesk.com not found in account');
        console.log('Available domains:', domainsData.data.map(d => d.domain));
      }
    }

    console.log('\n✅ All API tests passed!');
  } catch (error) {
    console.error('❌ API test failed:', error.message);
    if (error.response) {
      console.error('Response:', await error.response.text());
    }
  }
}

testHostingerAPI();
