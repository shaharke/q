'use strict';

const { KafkaClient, Consumer } = require('kafka-node');
const kafkaCommand = require('../kafka.command');
const formatter  = require('../formatter');
const serializer = require('../serializer');

module.exports = (program) => {
  kafkaCommand.init(program, 'slice')
    .option('-t --topic <topic>', 'Topic to read the message from', null, 'test', true)
    .option('-p --partition <parition>', 'Partition to read the message from', program.INT, 0)
    .option('-g --group <group>', 'Consumer group id', null, 'q-group')
    .option('--from <from>', 'Offset to start reading from', program.INT, 0)
    .option('--to <to>', 'Last offset to return', program.INT, 0)
    .option('-f --format <format>', 'Format to print the message', ['json', 'flat'], 'json')
    .option('--message-type <message-type>', 'The type of the message content. Use "object" for JSON objects or "buffer" for plain text', ['object', 'buffer'], 'object')
    .action(action);


  async function action(args, options, logger) {
    const {topic, partition, broker, connectTimeout, group, from, to, format, messageType } = options;

    if (from > to) {
      logger.error(`"From" offset must be less or equal to "to" offset. ${from} > ${to}`);
      return;
    }

    const client = new KafkaClient({kafkaHost: broker, connectTimeout});
    const consumer = new Consumer(
      client,
      [
        {topic, partition, from},
      ],
      {
        autoCommit: false,
        groupId: group,
        fromOffset: true
      }
    );

    return new Promise((resolve, reject) => {
      const serialize = serializer(messageType);

      const messages = [];
      consumer.on('message', (message) => {
        if (message.offset >= from && message.offset <= to) {
          messages.push(serialize(message.value));
        }

        if (message.offset === to) {
          const print = formatter(format, logger);
          print(messages);
          resolve();
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
