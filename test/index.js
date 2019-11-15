
const tap = require('tap');
const Signature = require('../index.js');

const signature = new Signature({ secret: '#6h-_hey' });
const ecodedUrl = signature.encode('https://example.com/posts?postId=15');


tap.test('easy signature', (t) => {
  t.ok(signature.validate(ecodedUrl), 'validating just encoded url');
  t.ok(!signature.validate(ecodedUrl.replace(/timestamp=([0-9]+)/, 'timestamp=1573826535')), 'validating invalid url');

  const signature2 = new Signature({ secret: '#6h-_hey', expiredSeconds: 4, prefix: 'prfx_' });
  const ecodedUrl2 = signature2.encode('https://example.com/posts?postId=15');
  t.ok(signature2.validate(ecodedUrl2), 'validating just encoded url');

  tap.pass('going to test expired time');
  tap.pass('please wait 5 seconds ...');
  setTimeout(() => {
    t.ok(!signature2.validate(ecodedUrl2), 'validating url after expired seconds (5)');
    t.end();
  }, 5000);
});
