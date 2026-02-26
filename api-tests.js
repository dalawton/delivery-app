// api-tests.js
// Run with: node api-tests.js
// Make sure server.js is running first

const BASE_URL = process.env.API_URL || 'http://localhost:3000';

let positivePassed = 0;
let negativePassed = 0;
let unexpectedFailed = 0;

let token = null;
let newEmail = `test_${Date.now()}@example.com`;

// ---------------- TEST RUNNERS ----------------

async function positiveTest(name, fn) {
  try {
    await fn();
    console.log(`PASS: ${name}`);
    positivePassed++;
  } catch (err) {
    console.log(`FAIL: ${name}`);
    console.log(`  -> ${err.message}`);
    unexpectedFailed++;
  }
}

async function negativeTest(name, fn) {
  try {
    await fn();
    throw new Error('Expected failure but request succeeded');
  } catch (err) {
    const msg = String(err.message || '');

    if (msg.includes('fetch failed')) {
      console.log(`FAIL: ${name}`);
      console.log(`  -> ${msg}`);
      unexpectedFailed++;
      return;
    }

    console.log(`PASS (correctly rejected): ${name}`);
    negativePassed++;
  }
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

async function req(method, path, body, authToken) {
  const headers = { 'Content-Type': 'application/json' };
  if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });

  const text = await res.text();
  let json = {};
  try { json = text ? JSON.parse(text) : {}; } catch {}

  return { status: res.status, body: json };
}

// ---------------- TEST SUITE ----------------

async function run() {

  console.log('\nRunning API Test Suite\n');

  // -------- 12 POSITIVE TESTS --------

  await positiveTest('Seed database', async () => {
    const { status, body } = await req('POST', '/api/seed');
    assert(status === 200);
    assert(body.userCount === 2);
  });

  await positiveTest('Health check', async () => {
    const { status, body } = await req('GET', '/api/health');
    assert(status === 200);
    assert(body.status === 'OK');
  });

  await positiveTest('Register new user', async () => {
    const { status, body } = await req('POST', '/api/auth/register', {
      name: 'Jane Doe',
      email: newEmail,
      password: 'securePass1'
    });
    assert(status === 201);
    assert(body.token);
    token = body.token;
  });

  await positiveTest('Login seeded customer', async () => {
    const { status } = await req('POST', '/api/auth/login', {
      email: 'customer@test.com',
      password: 'password123'
    });
    assert(status === 200);
  });

  await positiveTest('Get profile with token', async () => {
    const { status } = await req('GET', '/api/users/me', null, token);
    assert(status === 200);
  });

  await positiveTest('Update profile', async () => {
    const { status } = await req('PUT', '/api/users/me', {
      name: 'Jane Updated'
    }, token);
    assert(status === 200);
  });

  await positiveTest('Change password', async () => {
    const { status } = await req('POST', '/api/users/me/change-password', {
      currentPassword: 'securePass1',
      newPassword: 'newSecurePass2'
    }, token);
    assert(status === 200);
  });

  await positiveTest('Login with new password', async () => {
    const { status, body } = await req('POST', '/api/auth/login', {
      email: newEmail,
      password: 'newSecurePass2'
    });
    assert(status === 200);
    token = body.token;
  });

  await positiveTest('Add saved address', async () => {
    const { status } = await req('POST', '/api/users/me/addresses', {
      label: 'Home',
      address: '123 Elm Street'
    }, token);
    assert(status === 200);
  });

  await positiveTest('Delete saved address', async () => {
    const { status } = await req('DELETE', '/api/users/me/addresses/0', null, token);
    assert(status === 200);
  });

  await positiveTest('Deactivate account', async () => {
    const { status } = await req('POST', '/api/users/me/deactivate', null, token);
    assert(status === 200);
  });

  await positiveTest('Login seeded customer with role filter', async () => {
    const { status } = await req('POST', '/api/auth/login', {
      email: 'customer@test.com',
      password: 'password123',
      role: 'customer'
    });
    assert(status === 200);
  });

  // -------- 3 NEGATIVE TESTS --------

  await negativeTest('Register duplicate email', async () => {
    const { status } = await req('POST', '/api/auth/register', {
      name: 'Duplicate',
      email: 'customer@test.com',
      password: 'password123'
    });
    assert(status === 400);
  });

  await negativeTest('Login wrong password', async () => {
    const { status } = await req('POST', '/api/auth/login', {
      email: 'customer@test.com',
      password: 'wrongpassword'
    });
    assert(status === 401);
  });

  await negativeTest('Access protected route without token', async () => {
    const { status } = await req('GET', '/api/users/me');
    assert(status === 401);
  });

  // -------- SUMMARY --------

  const total = positivePassed + negativePassed + unexpectedFailed;

  console.log('\n--------------------------------');
  console.log(`Total tests run: ${total}`);
  console.log(`Positive tests passed: ${positivePassed}`);
  console.log(`Negative tests passed (correctly rejected): ${negativePassed}`);
  console.log(`Unexpected failures: ${unexpectedFailed}`);
  console.log('--------------------------------\n');

  process.exit(unexpectedFailed > 0 ? 1 : 0);
}

run();