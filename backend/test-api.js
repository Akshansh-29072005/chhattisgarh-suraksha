import fetch from 'node-fetch';

async function testApi() {
  try {
    const response = await fetch('http://localhost:5000/api/status');
    const data = await response.json();
    console.log('API Response:', data);
  } catch (error) {
    console.error('Error testing API:', error);
  }
}

testApi();