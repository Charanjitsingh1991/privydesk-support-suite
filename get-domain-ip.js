// Get IP address for privydesk.com
const dns = require('dns').promises;

async function getDomainIP() {
  try {
    console.log('🔍 Looking up IP address for privydesk.com...\n');
    
    const addresses = await dns.resolve4('privydesk.com');
    
    console.log('✅ Found IP address(es):');
    addresses.forEach((ip, index) => {
      console.log(`   ${index + 1}. ${ip}`);
    });
    
    console.log('\n📋 Use this IP for wildcard DNS:');
    console.log(`   Type: A`);
    console.log(`   Name: *`);
    console.log(`   Value: ${addresses[0]}`);
    console.log(`   TTL: 3600 (or default)`);
    
    return addresses[0];
  } catch (error) {
    console.error('❌ Failed to resolve domain:', error.message);
    console.log('\n💡 Alternative: Check your Hostinger panel for the server IP');
    console.log('   Go to: Websites → privydesk.com → Details');
  }
}

getDomainIP();
