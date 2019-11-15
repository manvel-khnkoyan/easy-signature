
easy-signature
==========

How to encode and validate given URL


#### Install

Stable Release (`1.0.x`)

```sh
$ npm install easy-signature --save
```

#### Encoding

```javascript
const Signature = require('../index.js');
const signature = new Signature({ secret: 'some-secret-here' });
const ecodedUrl = signature.encode('https://example.com/posts?postId=15');

console.log(ecodedUrl);
// Output:
// https://example.com/posts?es1_nonce=8rjcgf5ix8&es1_timestamp=1573827375&es1_method=sha256&es1_signature=OThjMTEwYWI0YTM5ZmQ1Yjg5NDZmMjg5MGFlM2EyOWU2NWM3YWI0MTg2OThmZTVmMjZmNjc3MjNmMGM4NzJjYQ%3D%3D
```

#### Validate

```javascript
signature.validate(ecodedUrl)
```


#### Parameters

Default expired date is 15 minutes, but its a configurable:

```javascript
 // Setting up expired time 1 hour
 const signature = new Signature({ secret: 'some-secret-here', expiredSeconds: 3600 });

```

Detailed explanation:

```
// seting up expiredSeconds only 4 seconds
const signature = new Signature({ secret: '#6h-_hey', expiredSeconds: 4, prefix: 'prfx_' });
const ecodedUrl = signature.encode('https://example.com/posts?postId=15');

console.log(signature.validate(ecodedUrl)); // -> true

setTimeout(() => {
  console.log(signature.validate(ecodedUrl)); // after 5 seconds -> false
}, 5000);

```

Other parameters

```javascript


const signature = new Signature({
    /*
     * default secret is empty string
     */
    secret: 'some-secret-here',

    /*
    * encoding parameters prefixes, default is es1_
    * This can be useful when the URL may contain the same parameters as the module,
    * so that you can avoid this problem by calling a unique prefix
    */
    prefix: 'psx_',

    /*
     * expired duration by seconds
     * default is 900 seconds = 15 minutes
     */
    expiredSeconds: 3600,

    /*
     * Signature encoding methods
     * default is sha256
     * also could be md5, sha512, sha1 and so on, see https://nodejs.org/api/crypto.html
     */
    method: 3600,

    /*
    * This parameters describing time oversight
    * This can be useful if you use different servers,
    * and the time may be slightly (adjusted using the parameter below) is different
    */
    oversight: 3600
});

```


### Testing

```
sudo apt install node-tap
sudo npm install tap
tap test/*.js
```
