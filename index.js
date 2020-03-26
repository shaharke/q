#!/usr/bin/env node

const program = require('caporal');
const { version } = require('./package.json');
const fs = require('fs');

async function main() {
  program
    .version(version);

  const commandsDirectory = fs.opendirSync(`${__dirname}/lib/commands`);
  for await (const commandFile of commandsDirectory) {
    const command = require(`./lib/commands/${commandFile.name}`);
    command(program);
  }

  await program.parse(process.argv);
}

main().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error(error)
  process.exit(-1);
});
