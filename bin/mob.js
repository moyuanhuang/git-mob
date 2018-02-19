#! /usr/bin/env node

let t0, t1;

t0 = Date.now();
const path = require('path');
t1 = Date.now();
console.log('path ' + (t1 - t0) + ' ms');

t0 = Date.now();
const minimist = require('minimist');
t1 = Date.now();
console.log('minimist ' + (t1 - t0) + ' ms');

// t0 = Date.now();
// const shell = require('shelljs');
// t1 = Date.now();
// console.log('shelljs ' + (t1 - t0) + ' ms');

t0 = Date.now();
const { execSync } = require('child_process');
t1 = Date.now();
console.log('childprocess ' + (t1 - t0) + ' ms');

t0 = Date.now();
const { stripIndent, oneLine } = require('common-tags');
t1 = Date.now();
console.log('common-tags ' + (t1 - t0) + ' ms');

t0 = Date.now();
const { gitAuthors } = require('../git-authors');
t1 = Date.now();
console.log('git-authors ' + (t1 - t0) + ' ms');

t0 = Date.now();
const { gitMessage } = require('../git-message');
t1 = Date.now();
console.log('git-message ' + (t1 - t0) + ' ms');

const gitMessagePath =
  process.env.GITMOB_MESSAGE_PATH ||
  commitTemplatePath() ||
  path.join('.git', '.gitmessage');

const argv = minimist(process.argv.slice(2), {
  alias: {
    h: 'help',
    v: 'version',
  },
});

if (argv.help) {
  runHelp();
  process.exit(0);
}
if (argv.version) {
  runVersion();
  process.exit(0);
}

runMob(argv._);

function runHelp() {
  const message = stripIndent`
    Usage
      $ git mob <co-author-initials>
      $ git solo

    Options
      -h  Prints usage information
      -v  Prints current version

    Examples
      $ git mob jd     # Set John Doe as co-author
      $ git mob jd am  # Set John & Amy as co-authors
      $ git solo       # Dissipate the mob
  `;
  console.log(message);
}

function runVersion() {
  console.log(require('../package.json').version);
}

function runMob(args) {
  if (args.length === 0) {
    printMob();
  } else {
    setMob(args);
  }
}

function printMob() {
  console.log(author());

  if (isCoAuthorSet()) {
    console.log(coauthors());
  }
}

function setMob(initials) {
  const authors = gitAuthors();
  const message = gitMessage(gitMessagePath);
  authors
    .read()
    .then(authorList => authors.coAuthors(initials, authorList))
    .then(coAuthors => {
      setCommitTemplate();
      resetMob();
      coAuthors.forEach(addCoAuthorToGitConfig);
      message.writeCoAuthors(coAuthors);
      // TODO: Set commit template
      // TODO: Append to .git/gitmessage
      printMob();
    })
    .catch(err => {
      console.error(`Error: ${err.message}`);
      process.exit(1);
    });
}

function author() {
  const name = silentRun('git config user.name').trim();
  const email = silentRun('git config user.email').trim();
  return oneLine`${name} <${email}>`;
}

function coauthors() {
  return silentRun('git config --get-all git-mob.co-author').trim();
}

function isCoAuthorSet() {
  const { code } = silentRun('git config git-mob.co-author');
  return code === 0;
}

function addCoAuthorToGitConfig(coAuthor) {
  silentRun(`git config --add git-mob.co-author "${coAuthor}"`);
}

function resetMob() {
  silentRun('git config --remove-section git-mob');
}

function silentRun(command) {
  return execSync('ls -la', { encoding: 'utf8' });
  // return shell.exec(command, { silent: true });
}

function setCommitTemplate() {
  const { code } = silentRun('git config commit.template');
  if (code !== 0) silentRun(`git config commit.template ${gitMessagePath}`);
}

function commitTemplatePath() {
  return silentRun('git config commit.template').trim();
}
