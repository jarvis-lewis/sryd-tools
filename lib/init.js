'use strict';

// from publish-please

const path = require('path');
const writeFile = require('fs').writeFileSync;
const chalk = require('chalk');
const getNpmArgs = require('./utils/get-npm-args');

const pathJoin = path.join;

function reportNoConfig() {
  console.log(
    chalk.bgRed('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!')
  );
  console.log(
    chalk.bgRed("!! Unable to setup sryd-tools: project's package.json either missing !!")
  );
  console.log(
    chalk.bgRed('!! or malformed. Run `npm init` and then reinstall sryd-tools.       !!')
  );
  console.log(
    chalk.bgRed('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!')
  );
}

function reportCompletion() {
  console.log(chalk.bgGreen('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!'));
  console.log(chalk.bgGreen('!! sryd-tools was successfully installed for the project. !!'));
  console.log(chalk.bgGreen('!! Use `npm run pub` command for publishing.       !!'));
  console.log(chalk.bgGreen('!! publishing configuration.                                  !!'));
  console.log(chalk.bgGreen('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!'));
}

function addConfigHooks(cfg, projectDir) {
  console.log(cfg, projectDir);
  if (!cfg.scripts) {
    cfg.scripts = {};
  }

  if (cfg.scripts.pub) {
    return false;
  }

  cfg.scripts = Object.assign(cfg.scripts, {
    dist: 'sryd-tools run dist',
    compile: 'sryd-tools run compile',
    clean: 'sryd-tools run clean',
    start: 'sryd-tools run start',
    site: 'sryd-tools run site',
    deploy: 'sryd-tools run update-self && sryd-tools run deploy',
    'just-deploy': 'sryd-tools run just-deploy',
    pub: 'sryd-tools run update-self && sryd-tools run pub',
  });

  if (cfg.scripts.prepublish) {
    cfg.scripts['pre-publish'] = cfg.scripts.prepublish;
  }

  cfg.scripts.prepublish = 'sryd-tools run guard';

  writeFile(pathJoin(projectDir, 'package.json'), JSON.stringify(cfg, null, 2));

  return true;
}

function init() {
  const testMode = process.argv.indexOf('--test-mode') > -1;

  // NOTE: don't run on dev installation (running `npm install` in this repo)
  if (!testMode) {
    const npmArgs = getNpmArgs();

    if (!npmArgs || !npmArgs.some(arg => /^sryd-tools(@\d+\.\d+.\d+)?$/.test(arg))) {
      return;
    }
  }
  // NOTE: <projectDir>/node_modules/sryd-tools/lib
  const projectDir = pathJoin(__dirname, '../../../');

  const cfg = require(path.join(projectDir, 'package.json'));

  if (!cfg) {
    reportNoConfig();
    process.exit(1);
  } else if (addConfigHooks(cfg, projectDir)) {
    reportCompletion();
  }
}

init();
