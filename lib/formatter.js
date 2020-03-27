'use strict';

module.exports = (format, logger) => {
  switch (format) {
    case 'json': return (output) => console.log(JSON.stringify(output));
    case 'flat': return logger.info.bind(logger);
    default: return console.log.bind(console);
  }
}
