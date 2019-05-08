# Cryotokens
Simple NodeJS module to keep and check against a list of [JSON Web Tokens (JWT)](https://jwt.io/) until their expiration, allowing for a "logout" and "logout from all other devices" functionality to auth systems that use stateless tokens.

## ⚠️ Warning! ⚠️ 
This is a work in progress and is **NOT** production ready __yet__.

## Prerequisites
A running [Redis](https://redis.io/) server is needed, unless running Test mode (in memory) as specified in the Configuration section below.

If the "logout from all other devices" functionality (`freezeSub` method) is used, the JWT needs to have a `sub` property in their payload, which refers to the subscriber (usually the id of the user associated with that token). This is required to filter all tokens from the same user.

## Installation
```
$ npm install --save cryotokens
```

## Usage

### Initialization (a secret is required)
The modules needs to be initialized (ran as a function) and has only one required parameter: the [secret used to verify the JWT](https://github.com/auth0/node-jsonwebtoken#jwtverifytoken-secretorpublickey-options-callback).
```javascript
const ct = require('cryotokens')('somesecret');
```
Ideally this isn't hardcoded on your code but instead grabbed as a environment variable:
```javascript
const secret = process.env.JWT_SECRET;
const ct = require('cryotokens')(secret);
```

### Freeze token (Logout)
```javascript
ct.freeze(token);
```

### Freeze subscriber (Logout from all devices)
```javascript
ct.freezeSub(token);
```

### Check token
Returns the decoded token if it's not on the list and valid. Otherwise it throws an error if the token is frozen, expired or invalid.
```javascript
ct.check(token)
  .then(decoded => console.log('Decoded token: ', decoded))
  .catch(error => console.log('An error ocurred', error));
```
or inside try/catch blocks:
```javascript
try {
  const decoded = ct.check(token);
  console.log('Decoded token: ', decoded));
} catch(error) {
  console.log('An error ocurred', error));
}

```

## Configuration
Cryotokens uses [this redis client](https://github.com/NodeRedis/node_redis) and thus accepts its options listed [here](https://github.com/NodeRedis/node_redis#rediscreateclient). It uses the default host (127.0.0.1) and port (6379) for the Redis server. The only option this library sets is prefix, which adds `cryotokens:` to beginning of the database keys. 

Those options can be overriden by passing a second parameter to the imported module:
```javascript
const config = {host: 'somehost.com', port: 6378};
const ct = require('cryotokens')('somesecret', config);
```

### Test mode (in memory)
To store tokens in memory (no Redis install needed) just pass `{test: true}` as second parameter.
```javascript
const ct = require('cryotokens')('somesecret', {test: true});
```

## Tests
Tests use jest, redis-mock and sinon (for simulating expiry). To run them:
```
$ npm test
```

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## Roadmap
- [ ] Better error handling
- [ ] Express middleware that validates token from request header and handles auth
- [ ] Fail safely (if Redis is down)

## License
[MIT](https://choosealicense.com/licenses/mit/)
