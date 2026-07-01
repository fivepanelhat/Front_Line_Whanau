const http = require('http');

const ENDPOINT = 'http://localhost:3000/api/agents';
const CONCURRENCY = 15;

async function sendRequest(id) {
  return new Promise((resolve) => {
    const req = http.request(ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': '192.168.1.100' // Mock IP
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`[Req ${id}] Status: ${res.statusCode} | Data: ${data.substring(0, 50)}`);
        resolve(res.statusCode);
      });
    });

    req.on('error', (e) => {
      console.error(`[Req ${id}] Request failed: ${e.message}`);
      resolve(0);
    });

    req.write(JSON.stringify({ query: 'Hello, what is preterm?' }));
    req.end();
  });
}

async function run() {
  console.log(`Starting load test with ${CONCURRENCY} concurrent requests...`);
  console.log(`Expected behavior: First 10 requests should be 200, the rest should be 429 Too Many Requests`);
  
  const promises = [];
  for (let i = 0; i < CONCURRENCY; i++) {
    promises.push(sendRequest(i + 1));
  }

  await Promise.all(promises);
  console.log('Load test complete.');
}

run();
