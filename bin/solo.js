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
const child = execSync('ls -la', { encoding: 'utf8' });

write(child, function() {});
