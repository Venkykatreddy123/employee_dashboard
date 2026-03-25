const https = require('https');

const options = {
  hostname: 'empdash-virinchi23-tech.turso.io',
  port: 443,
  path: '/',
  method: 'GET'
};

const req = https.request(options, (res) => {
  console.log('STATUS:', res.statusCode);
  res.on('data', (d) => {
    process.stdout.write(d);
  });
});

req.on('error', (e) => {
  console.error('ERROR:', e.message);
});

req.end();
