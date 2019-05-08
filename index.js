const jwt = require('jsonwebtoken');

/** Shorter verify */
function verify(token, secret) {
  return jwt.verify(token, secret, 
    (e, data) => {
      if (e) throw new Error(e);
      return data;
    }
  );
}

/** Main function */
function cryoTokens(secret, config) {
  if (!secret) throw new Error('Cryotokens need a secret');
  const {get, set} = require('./store')(config);

  /**
   * Adds a single token to the list
   * for the duration of its expiry
   * @param {String} token 
   */
  async function freeze(token) {
    const decoded = jwt.decode(token);
    const {exp} = decoded;
    const n = Date.now();
    if (exp * 1000 < n) return false;

    const seconds = (exp * 1000 - n) / 1000;
    const payload = token.split('.')[1];
    const promise = set(payload, true, 'EX', Math.ceil(seconds));
    return promise;
  }

  /**
   * Adds a token subject's ID to the list
   * for duration of token's expiry
   * @param {String} token (needs a sub property on its payload)
   */
  async function freezeSub(token) {
    const decoded = jwt.decode(token);
    const {sub, exp, iat} = decoded;
    const expiry = exp - iat;
    const promise = set(sub, Date.now(), 'EX', Math.ceil(expiry));
    return promise;
  }

  /**
   * Checks if a token is valid then
   * if it or its subscriber are frozen
   * @param {String} token (needs a sub property on its payload)
   */
  async function check(token) {
    const verified = verify(token, secret);
    const payload = token.split('.')[1];
    const {exp} = verified;
    if (!exp) {
      throw new Error('jwt has no expiration');
    }

    await _checkToken(verified, payload);
    await _checkSub(verified);
    return verified;
  }
  
  async function _checkToken(verified, payload) {
    const frozen = await get(payload);
    if (frozen) throw new Error('jwt frozen');
    return verified;
  }

  async function _checkSub(verified) {
    const {sub, iat} = verified;
    const fat = await get(sub);
    if (iat*1000 <= fat) {
      throw new Error('jwt subscriber frozen');
    }
    return verified;
  }

  /**
   * Checks if a token is valid
   * then if it is frozen
   * @param {String} token 
   */

  async function checkToken(token) {
    const verified = verify(token, secret);
    const {exp} = verified;
    if (!exp) {
      throw new Error('jwt has no expiration');
    }
    let payload = token.split('.')[1];
    const frozen = await get(payload);
    if (frozen) throw new Error('jwt frozen');
    return verified;
  }

  return {
    freeze, freezeSub,
    check, checkToken,
  };
}

module.exports = cryoTokens;