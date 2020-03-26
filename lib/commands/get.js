'use strict'

const { KafkaClient, Consumer } = require('kafka-node');
const kafkaCommand = require('../kafka.command');
const formatter  = require('../formatter');

module.exports = (program) => {
  kafkaCommand.init(program, 'get')
    .option('-t --topic <topic>', 'Topic to read the message from', null, 'test', true)
    .option('-p --partition <parition>', 'Partition to read the message from', program.INT, 0)
    .option('-g --group <group>', 'Consumer group id', null, 'q-group')
    .option('-o --offset <offset>', 'Offset to read', program.INT, 0)
    .option('-f --format <format>', 'Format to print the message', ['json', 'flat'], 'json')
    .action(action);


  async function action(args, options, logger) {
    const {topic, partition, broker, connectTimeout, group, offset, format } = options;

    const client = new KafkaClient({kafkaHost: broker, connectTimeout});
    const consumer = new Consumer(
      client,
      [
        {topic, partition, offset},
      ],
      {
        autoCommit: false,
        groupId: group,
        fromOffset: true
      }
    );

    return new Promise((resolve, reject) => {
      consumer.on('message', (message) => {
        if (message.offset === offset) {
          const print = formatter(format, logger);
          print(message.value);
          resolve(message);
        }
      });

      consumer.on('error', reject);
      consumer.on('offsetOutOfRange', (error) => {
        logger.error(`Offset ${offset} is out of range for ${topic}:${partition}`);
        reject();
      });
    })
  }
};
