#!/usr/bin/env node

const { CliError, run } = require('../src/renderer');

try {
  run();
} catch (error) {
  const message = error instanceof CliError ? error.message : error.stack || error.message;
  process.stderr.write(`${message}\n`);
  process.exitCode = error.code || 1;
}
