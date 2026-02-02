
const http = require('http');

const data = JSON.stringify({
    name: 'Debug User',
    email: 'debug_' + Date.now() + '@example.com',
    password: 'password123'
});

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/auth/signup',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

console.log(`Attempting POST to http://localhost:5000/auth/signup...`);

const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);

    let body = '';
    res.on('data', (chunk) => {
        body += chunk;
    });

    res.on('end', () => {
        console.log('Response Body:', body);
    });
});

req.on('error', (e) => {
    console.error(`Request Error: ${e.message}`);
});

req.write(data);
req.end();
