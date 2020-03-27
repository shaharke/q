'use strict';

const { KafkaClient, Consumer } = require('kafka-node');
const kafkaCommand = require('../kafka.command');

module.exports = (program) => {
  kafkaCommand.init(program, 'drain')
    .option('-t --topic <topic>', 'Topic to read the message from', null, 'test', true)
    .option('-p --partition <parition>', 'Partition to read the message from', program.INT, 0)
    .option('-g --group <group>', 'Consumer group id', null, null, true)
    .action(action);


  async function action(args, options, logger) {
    const {topic, partition, broker, connectTimeout, group } = options;

    const client = new KafkaClient({kafkaHost: broker, connectTimeout});
    const consumer = new Consumer(
      client,
      [
        {topic, partition},
      ],
      {
        autoCommit: true,
        groupId: group,
      }
    );

    return new Promise((resolve, reject) => {
      let firstOffestRead = false;
      consumer.on('message', (message) => {
        if (firstOffestRead === false) {
          logger.info(`Starting to read at offset ${message.offset}. Need to get to ${message.highWaterOffset - 1}`);
          firstOffestRead = true;
        }

        if (message.offset === message.highWaterOffset - 1) {
          logger.info(`Reached last message at offset ${message.offset}. Stopping.`);
          resolve();
        }
      });

      consumer.on('error', reject);
    })
  }
};
