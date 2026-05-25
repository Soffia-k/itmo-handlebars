const Handlebars = require('handlebars');

class HandlebarsEngine {
  compile(template, context) {
    const compiled = Handlebars.compile(template);
    return compiled(context);
  }
}

module.exports = HandlebarsEngine;