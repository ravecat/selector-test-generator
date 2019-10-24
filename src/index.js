require('@babel/register')({
  presets: ['@babel/preset-env'],
});

// const program = require('commander');
import program from 'commander';
import { generate } from './generator';

let selectorsDir;
let statePath;

program
  .arguments('[dir]')
  .option('-s, --state <state>')
  .action((_, cmdObj) => {
    if (typeof cmdObj.state === 'undefined') {
      console.error("Error: mocked state isn't specified");
      process.exit(1);
    }

    statePath = cmdObj.state;
  })
  .action(dir => {
    if (typeof dir === 'undefined') {
      console.warn('No specify selector directory, use current path', process.cwd());
    }

    selectorsDir = dir || process.cwd();
  })
  .parse(process.argv);

generate(selectorsDir, statePath);
