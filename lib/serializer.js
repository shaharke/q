'use strict';

module.exports = (messageType) => {
  switch (messageType) {
    case 'object': return (value) => {
      try {
        return JSON.parse(value);
      } catch(e) {
        return value;
      }
    }
    case 'buffer': return (value) => value;
  }
}
