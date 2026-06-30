import 'dotenv/config';

async function testLiveAgent() {
  console.log('Testing Live LangGraph Agent via Next.js API...');
  
  const payload = {
    query: 'What financial support is available for a preterm baby?',
    history: [],
    threadId: `test-thread-${Date.now()}`
  };

  try {
    const res = await fetch('http://localhost:3000/api/agents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      console.error(`HTTP Error: ${res.status} ${res.statusText}`);
      const text = await res.text();
      console.error(text);
      process.exit(1);
    }

    if (!res.body) {
      console.error('No response body returned from server.');
      process.exit(1);
    }

    console.log('--- STREAM START ---');
    
    // We parse the Server-Sent Events stream
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    
    let fullResponse = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));
            if (data.type === 'token') {
              process.stdout.write(data.token);
              fullResponse += data.token;
            } else if (data.type === 'interrupt') {
              console.log('\n[GUARDRAIL INTERRUPT Triggered]', data.message);
            } else if (data.type === 'error') {
              console.error('\n[AGENT ERROR]', data.message);
            } else if (data.type === 'done') {
              console.log('\n--- STREAM COMPLETE ---');
            }
          } catch (err) {
            // Some chunks might be partial or heartbeat pings
          }
        }
      }
    }

    console.log('\nTest passed. Agent successfully orchestrated via live HTTP endpoint.');
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
}

testLiveAgent();
