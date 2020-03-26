'use strict';

module.exports = (format, logger) => {
  switch (format) {
    case 'json': return console.log.bind(console);
    case 'flat': return logger.info.bind(logger);
    default: return console.log.bind(console);
  }
}
