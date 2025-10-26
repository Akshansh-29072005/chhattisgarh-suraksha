import http from 'http';

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ message: 'Hello World' }));
});

const port = 5001;
server.listen(port, '127.0.0.1', () => {
  console.log(`Test server running on http://127.0.0.1:${port}`);
});