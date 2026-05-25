import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

const require = createRequire(import.meta.url);
const { renderTemplate, run } = require('../src/renderer');

let tempDir;

function writeFixture(relativePath, content) {
  const filePath = path.join(tempDir, relativePath);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, 'utf8');
  return filePath;
}

beforeEach(() => {
  tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'itmo-hbs-'));
});

afterEach(() => {
  fs.rmSync(tempDir, { recursive: true, force: true });
});

describe('Handlebars renderer', () => {
  it('renders a simple template', () => {
    const template = writeFixture('hello.hbs', 'Hello, {{name}}!');
    const context = writeFixture('context.json', '{"name":"Anna"}');

    expect(renderTemplate(template, context)).toBe('Hello, Anna!');
  });

  it('supports nested fields', () => {
    const template = writeFixture('profile.hbs', '{{user.name}} studies {{user.program}}.');
    const context = writeFixture('context.json', JSON.stringify({
      user: {
        name: 'Ivan',
        program: 'Web Technologies'
      }
    }));

    expect(renderTemplate(template, context)).toBe('Ivan studies Web Technologies.');
  });

  it('supports each blocks', () => {
    const template = writeFixture('items.hbs', '{{#each items}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}');
    const context = writeFixture('context.json', JSON.stringify({
      items: ['template', 'context', 'output']
    }));

    expect(renderTemplate(template, context)).toBe('template, context, output');
  });

  it('throws an error for invalid JSON', () => {
    const template = writeFixture('hello.hbs', 'Hello, {{name}}!');
    const context = writeFixture('broken.json', '{"name": "Anna"');

    expect(() => renderTemplate(template, context)).toThrow('Invalid JSON');
  });

  it('writes the rendered result to a file', () => {
    const template = writeFixture('hello.hbs', 'Hello, {{name}}!');
    const context = writeFixture('context.json', '{"name":"Maria"}');
    const out = path.join(tempDir, 'dist', 'result.txt');

    run(['--template', template, '--context', context, '--out', out], process);

    expect(fs.readFileSync(out, 'utf8')).toBe('Hello, Maria!');
  });
});
