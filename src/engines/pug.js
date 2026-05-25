const pug = require('pug');

class PugEngine {
  compile(template, context) {
    const compiled = pug.compile(template);
    return compiled(context);
  }
}

module.exports = PugEngine;