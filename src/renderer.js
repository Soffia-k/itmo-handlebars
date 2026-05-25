const fs = require('fs');
const path = require('path');
const Handlebars = require('handlebars');

// Добавляем поддержку других движков
let pug, nunjucks;
try {
  pug = require('pug');
} catch (e) { /* pug not installed */ }
try {
  nunjucks = require('nunjucks');
} catch (e) { /* nunjucks not installed */ }

class CliError extends Error {
  constructor(message, code = 1) {
    super(message);
    this.name = 'CliError';
    this.code = code;
  }
}

function parseArgs(argv) {
  const options = { engine: 'handlebars' };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === '--template' || arg === '--context' || arg === '--out' || arg === '--engine') {
      const key = arg.slice(2);
      const value = argv[i + 1];

      if (!value || value.startsWith('--')) {
        throw new CliError(`Argument ${arg} requires a path value.`);
      }

      options[key] = value;
      i += 1;
      continue;
    }

    throw new CliError(`Unknown argument: ${arg}`);
  }

  if (!options.template || !options.context) {
    throw new CliError('Required arguments are missing: --template <path> and --context <path>.');
  }

  return options;
}

function readTemplate(templatePath) {
  try {
    return fs.readFileSync(templatePath, 'utf8');
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new CliError(`Template file not found: ${templatePath}`);
    }
    throw error;
  }
}

function readContext(contextPath) {
  let rawJson;

  try {
    rawJson = fs.readFileSync(contextPath, 'utf8');
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new CliError(`JSON context file not found: ${contextPath}`);
    }
    throw error;
  }

  try {
    return JSON.parse(rawJson);
  } catch (error) {
    throw new CliError(`Invalid JSON in context file: ${contextPath}`);
  }
}

// Основная функция рендеринга с поддержкой разных движков
function renderTemplateFromSource(templateSource, context, engine = 'handlebars') {
  try {
    switch (engine.toLowerCase()) {
      case 'pug':
        if (!pug) throw new Error('Pug is not installed. Run: npm install pug');
        const compiledPug = pug.compile(templateSource);
        return compiledPug(context);
      
      case 'nunjucks':
      case 'jinja2':
        if (!nunjucks) throw new Error('Nunjucks is not installed. Run: npm install nunjucks');
        return nunjucks.renderString(templateSource, context);
      
      case 'handlebars':
      default:
        const template = Handlebars.compile(templateSource, { strict: true });
        return template(context);
    }
  } catch (error) {
    throw new CliError(`Template rendering failed (${engine}): ${error.message}`);
  }
}

function renderTemplate(templatePath, contextPath, engine = 'handlebars') {
  const templateSource = readTemplate(templatePath);
  const context = readContext(contextPath);
  return renderTemplateFromSource(templateSource, context, engine);
}

function writeOutput(outPath, result) {
  const outputDir = path.dirname(outPath);
  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(outPath, result, 'utf8');
}

function run(argv = process.argv.slice(2), streams = process) {
  const options = parseArgs(argv);
  const result = renderTemplate(options.template, options.context, options.engine);

  if (options.out) {
    writeOutput(options.out, result);
  } else {
    streams.stdout.write(result);
  }

  return result;
}

// Экспортируем список доступных движков
function getAvailableEngines() {
  const engines = ['handlebars'];
  if (pug) engines.push('pug');
  if (nunjucks) engines.push('nunjucks', 'jinja2');
  return engines;
}

module.exports = {
  CliError,
  parseArgs,
  renderTemplateFromSource,
  renderTemplate,
  run,
  writeOutput,
  getAvailableEngines  // новая функция
};