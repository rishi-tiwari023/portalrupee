import http from 'http';

const BASE_URL = 'http://127.0.0.1:5000/api/v1';

function request(url, options = {}) {
  return new Promise((resolve, reject) => {
    const { method = 'GET', body, headers = {} } = options;
    const req = http.request(url, { method, headers: { ...headers, 'Content-Type': 'application/json' } }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ ok: res.statusCode >= 200 && res.statusCode < 300, status: res.statusCode, data: json });
        } catch (e) {
          resolve({ ok: false, status: res.statusCode, data: { message: 'Invalid JSON response' } });
        }
      });
    });
    req.on('error', (err) => {
      reject(err);
    });
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function login(email, password) {
  const res = await request(`${BASE_URL}/auth/login`, {
    method: 'POST',
    body: { email, password }
  });
  if (!res.ok) throw new Error(`Login failed (${res.status}): ${res.data.message}`);
  return res.data.data.accessToken;
}

async function getBalance(token, accountNumber) {
  const res = await request(`${BASE_URL}/accounts`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error(`Get balance failed (${res.status}): ${res.data.message}`);
  const account = res.data.data.find(acc => acc.accountNumber === accountNumber);
  if (!account) throw new Error(`Account ${accountNumber} not found`);
  return account.balance;
}

async function getReceiverId(token, email) {
  const res = await request(`${BASE_URL}/users/search?query=${email}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error(`Search failed (${res.status}): ${res.data.message}`);
  if (!res.data.data.users || res.data.data.users.length === 0) throw new Error(`User ${email} not found`);
  return res.data.data.users[0]._id;
}

async function runConcurrencyTest() {
  console.log('--- Starting Concurrency Test on Port 5000 ---');
  
  try {
    const token = await login('customer@portalrupee.com', 'password123');
    const receiverId = await getReceiverId(token, 'customer2@portalrupee.com');
    
    const ACC_NUM = '100000000001';
    const initialBalance = await getBalance(token, ACC_NUM);
    console.log(`Initial Balance of ${ACC_NUM}: ₹${initialBalance}`);

    const transferAmount = 100;
    const numberOfTransfers = 5;

    console.log(`Sending ${numberOfTransfers} simultaneous transfers of ₹${transferAmount} each...`);

    const requests = [];
    for (let i = 0; i < numberOfTransfers; i++) {
      requests.push(
        request(`${BASE_URL}/transactions/transfer`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: {
            receiverId,
            amount: transferAmount,
            description: `Concurrent Transfer ${i + 1}`,
            tpin: '111111'
          }
        }).then(res => {
          if (!res.ok) {
            console.error(`Transfer ${i + 1} failed (${res.status}): ${res.data.message}`);
          } else {
            console.log(`Transfer ${i + 1} succeeded.`);
          }
          return res;
        })
      );
    }

    const results = await Promise.all(requests);
    const successful = results.filter(r => r.ok).length;
    const failed = results.filter(r => !r.ok).length;

    console.log(`Summary: ${successful} successful, ${failed} failed.`);

    const finalBalance = await getBalance(token, ACC_NUM);
    console.log(`Final Balance: ₹${finalBalance}`);
    console.log(`Expected Balance: ₹${initialBalance - (successful * transferAmount)}`);

    if (finalBalance === initialBalance - (successful * transferAmount)) {
      console.log('TEST PASSED: Balance is consistent.');
    } else {
      console.error('TEST FAILED: Balance mismatch detected!');
    }

  } catch (error) {
    console.error('Test Execution Error:', error.message || error);
  }
}

runConcurrencyTest();
