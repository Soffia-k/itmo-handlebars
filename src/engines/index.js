const engines = {
  handlebars: require('./handlebars'),
  pug: require('./pug'),
  nunjucks: require('./nunjucks'),
  jinja2: require('./nunjucks'),
};

function render(engineName, template, context) {
  const Engine = engines[engineName];
  if (!Engine) {
    throw new Error(`Unknown engine: ${engineName}. Available: ${Object.keys(engines).join(', ')}`);
  }
  const engine = new Engine();
  return engine.compile(template, context);
}

module.exports = { render, engines };