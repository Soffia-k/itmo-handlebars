const http = require('http');
const fs = require('fs');
const path = require('path');
const { renderTemplateFromSource, CliError } = require('./renderer');

const host = '127.0.0.1';
const port = Number(process.env.PORT) || 3000;
const publicDir = path.join(__dirname, '..', 'public');

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(payload));
}

function sendFile(res, filePath, contentType) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    res.writeHead(200, { 'Content-Type': `${contentType}; charset=utf-8` });
    res.end(content);
  } catch (error) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not found');
  }
}

function collectRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) {
        reject(new Error('Request body too large.'));
      }
    });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

function createServer() {
  return http.createServer(async (req, res) => {
    if (req.method === 'GET' && req.url === '/') {
      sendFile(res, path.join(publicDir, 'index.html'), 'text/html');
      return;
    }

    if (req.method === 'GET' && req.url === '/app.jsx') {
      sendFile(res, path.join(publicDir, 'app.jsx'), 'application/javascript');
      return;
    }

    if (req.method === 'GET' && req.url === '/styles.css') {
      sendFile(res, path.join(publicDir, 'styles.css'), 'text/css');
      return;
    }

    if (req.method === 'POST' && req.url === '/api/render') {
      try {
        const rawBody = await collectRequestBody(req);
        const { template, context } = JSON.parse(rawBody);

        if (typeof template !== 'string' || template.trim() === '') {
          sendJson(res, 400, { error: 'Template is required.' });
          return;
        }

        let parsedContext;
        try {
          parsedContext = JSON.parse(context);
        } catch (error) {
          sendJson(res, 400, { error: 'Context must be valid JSON.' });
          return;
        }

        const output = renderTemplateFromSource(template, parsedContext);
        sendJson(res, 200, { output });
      } catch (error) {
        if (error instanceof CliError) {
          sendJson(res, 400, { error: error.message });
          return;
        }

        if (error instanceof SyntaxError) {
          sendJson(res, 400, { error: 'Request body must be valid JSON.' });
          return;
        }

        sendJson(res, 500, { error: 'Internal server error.' });
      }
      return;
    }

    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not found');
  });
}

if (require.main === module) {
  const server = createServer();
  server.listen(port, host, () => {
    process.stdout.write(`Sandbox server is running at http://${host}:${port}\n`);
  });
}

module.exports = { createServer };
