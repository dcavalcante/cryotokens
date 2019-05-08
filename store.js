function store(opt) {
  const {promisify} = require('util');
  const defaults = require('./config');
  const redis = opt.test 
    ? require('redis-mock') 
    : require('redis');


  const config = {...defaults, ...opt}
  const client = redis.createClient(config);
  client.on("error", function (err) {
    console.log("Database Error " + err);
  });

  const get = promisify(client.get).bind(client);
  const set = promisify(client.set).bind(client);
  return {get, set};
}

module.exports = store;