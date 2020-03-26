'use strict'

const { KafkaClient, Producer } = require('kafka-node');
const kafkaCommand = require('../kafka.command');

module.exports = (program) => {
  kafkaCommand.init(program, 'publish')
    .option('-t --topic <topic>', 'Topic to send the message to', null, 'test', true)
    .option('-p --partition <parition>', 'Partition to send the message to', program.INT, 0, false)
    .argument('<message>', 'The message as a JSON string')
    .action(action);

  async function action(args, options, logger) {
    const { topic, partition, broker, connectTimeout } = options;
    const { message } = args;

    return new Promise((resolve, reject) => {
      const client = new KafkaClient({kafkaHost: broker, connectTimeout });
      const producer = new Producer(client);
      producer.on('error', (error) => {
        logger.error(error);
        reject(error);
      });

      producer.on('ready', async () => {
        await producer.send([ { messages: message, topic, partition}], (err, data) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(data);
        });

      });
    });
  }
};
