'use strict'

function init(program, commandName) {
  return program.command(commandName)
    .option('-b --broker <broker>', 'Kafka broker url', null, 'localhost:9092')
    .option('--connectTimeout <connectTimeout>', 'Connection timeout', null, 1000)
}

module.exports = {
  init,
}
