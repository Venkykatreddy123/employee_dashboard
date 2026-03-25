const https = require('https');

const token = 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NzQ0MTY1ODYsImlkIjoiMDE5ZDIzNzgtNDYwMS03NDE3LWFmMWEtZWRiNDkwNmRiOTAyIiwicmlkIjoiMTg4ZDUxNjgtZmM0OC00OTA1LTg5NTctZDYzOGRkNDU1NjQ2In0.I0AB9Y83GgvkYVK19aaeoMAKsP9oP0DoRH9R9NGjgkUUpL7BzhaX88isQx5OGx5MXk5hM31bPKp2YrzFBmS0Aw';

const options = {
  hostname: 'empdash-virinchi23-tech.turso.io',
  port: 443,
  path: '/',
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
};

const body = JSON.stringify({
  requests: [
    { type: 'execute', stmt: { sql: 'SELECT 1 as val' } }
  ]
});

const req = https.request(options, (res) => {
  console.log('STATUS:', res.statusCode);
  res.on('data', (d) => process.stdout.write(d));
});

req.on('error', (e) => console.error(e));
req.write(body);
req.end();
