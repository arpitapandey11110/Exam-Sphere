const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testAPI() {
  try {
    console.log('🧪 Testing API endpoints...\n');

    // Test 1: Server health check
    console.log('1. Testing server health...');
    const healthResponse = await fetch('http://localhost:5003/api/test');
    const healthData = await healthResponse.json();
    console.log('✅ Server Status:', healthData.message);
    console.log('✅ MongoDB Status:', healthData.mongodb);
    console.log('');

    // Test 2: Admin login
    console.log('2. Testing admin login...');
    const loginResponse = await fetch('http://localhost:5003/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'admin123'
      })
    });

    const loginData = await loginResponse.json();
    
    if (loginResponse.ok) {
      console.log('✅ Admin Login Successful!');
      console.log('👤 User:', loginData.user.firstName, loginData.user.lastName);
      console.log('🔑 Role:', loginData.user.role);
      console.log('🎫 Token:', loginData.token ? 'Generated' : 'Missing');
    } else {
      console.log('❌ Admin Login Failed:', loginData.error);
    }
    console.log('');

    // Test 3: Register a new student
    console.log('3. Testing student registration...');
    const registerResponse = await fetch('http://localhost:5003/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        firstName: 'Test',
        lastName: 'Student',
        email: 'student@test.com',
        college: 'Test University',
        password: 'password123',
        role: 'student'
      })
    });

    const registerData = await registerResponse.json();
    
    if (registerResponse.ok) {
      console.log('✅ Student Registration Successful!');
      console.log('👤 User:', registerData.user.firstName, registerData.user.lastName);
      console.log('🔑 Role:', registerData.user.role);
    } else {
      console.log('❌ Student Registration Failed:', registerData.error);
    }
    console.log('');

    // Test 4: Student login
    console.log('4. Testing student login...');
    const studentLoginResponse = await fetch('http://localhost:5003/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'student@test.com',
        password: 'password123'
      })
    });

    const studentLoginData = await studentLoginResponse.json();
    
    if (studentLoginResponse.ok) {
      console.log('✅ Student Login Successful!');
      console.log('👤 User:', studentLoginData.user.firstName);
      console.log('🔑 Role:', studentLoginData.user.role);
    } else {
      console.log('❌ Student Login Failed:', studentLoginData.error);
    }

  } catch (error) {
    console.error('❌ Test Error:', error.message);
  }
}

testAPI();
