// FIXED: Test script to verify login functionality
const axios = require('axios');

async function testLogin() {
  try {
    console.log('Testing login endpoint...');
    
    const response = await axios.post('http://localhost:5000/api/auth/login', {
      username: 'collector1',
      password: 'password123'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Login successful!');
    console.log('Response status:', response.status);
    console.log('User data:', response.data);
    
  } catch (error) {
    console.log('❌ Login failed!');
    console.log('Status:', error.response?.status);
    console.log('Error:', error.response?.data);
    console.log('Request data:', error.config?.data);
  }
}

// Test all demo users
async function testAllUsers() {
  const testUsers = [
    { username: 'collector1', password: 'password123' },
    { username: 'labtech1', password: 'password123' },
    { username: 'processor1', password: 'password123' },
    { username: 'manufacturer1', password: 'password123' },
    { username: 'nmpb_admin', password: 'admin123' }
  ];
  
  for (const user of testUsers) {
    console.log(`\n--- Testing ${user.username} ---`);
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', user, {
        headers: { 'Content-Type': 'application/json' }
      });
      console.log(`✅ ${user.username} login successful - Role: ${response.data.role}`);
    } catch (error) {
      console.log(`❌ ${user.username} login failed:`, error.response?.data?.error);
    }
  }
}

if (require.main === module) {
  testAllUsers();
}

module.exports = { testLogin, testAllUsers };