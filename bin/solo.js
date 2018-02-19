#! /usr/bin/env node

// Not compatible with git-duet which also has a solo command.
// Need to warn user to uninstall git-duet.

let stream = process.stdout;

function write(data, cb) {
  if (!stream.write(data)) {
    stream.once('drain', cb);
  } else {
    process.nextTick(cb);
  }
}
write('coming soon', function() {});

const { execSync } = require('child_process');

try {
  const child = execSync('git config commit.template', { encoding: 'utf8' });
  write(child, function() {});
} catch (e) {
  const errObj = {
    code: e.status,
    pid: e.pid,
    stderr: e.stderr,
    stdout: e.stdout,
    cmd: e.cmd,
  };
  console.log(errObj);
}
