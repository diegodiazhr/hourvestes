

const {https} = require('firebase-functions');
const next = require('next');
const path = require('path');

const dev = process.env.NODE_ENV !== 'production';

// Initialize Next.js app from the parent directory
const app = next({
  dev,
  conf: { distDir: '.next' },
  dir: path.join(__dirname, '../')
});

const handle = app.getRequestHandler();

exports.app = https.onRequest((req, res) => {
  return app.prepare().then(() => handle(req, res));
});
