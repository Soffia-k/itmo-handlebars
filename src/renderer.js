const fs = require('fs');
const path = require('path');
const Handlebars = require('handlebars');

class CliError extends Error {
  constructor(message, code = 1) {
    super(message);
    this.name = 'CliError';
    this.code = code;
  }
}

function parseArgs(argv) {
  const options = {};

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === '--template' || arg === '--context' || arg === '--out') {
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

function renderTemplate(templatePath, contextPath) {
  const templateSource = readTemplate(templatePath);
  const context = readContext(contextPath);

  try {
    const template = Handlebars.compile(templateSource, { strict: true });
    return template(context);
  } catch (error) {
    throw new CliError(`Template rendering failed: ${error.message}`);
  }
}

function writeOutput(outPath, result) {
  const outputDir = path.dirname(outPath);
  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(outPath, result, 'utf8');
}

function run(argv = process.argv.slice(2), streams = process) {
  const options = parseArgs(argv);
  const result = renderTemplate(options.template, options.context);

  if (options.out) {
    writeOutput(options.out, result);
  } else {
    streams.stdout.write(result);
  }

  return result;
}

module.exports = {
  CliError,
  parseArgs,
  renderTemplate,
  run,
  writeOutput
};
