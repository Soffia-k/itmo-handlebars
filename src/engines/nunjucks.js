const nunjucks = require('nunjucks');

class NunjucksEngine {
  compile(template, context) {
    return nunjucks.renderString(template, context);
  }
}

module.exports = NunjucksEngine;