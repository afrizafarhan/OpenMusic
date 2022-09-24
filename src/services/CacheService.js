const redis = require('redis');
const fs = require('fs');
const config = require('../utils/config');

class CacheService {
  constructor() {
    this._client = redis.createClient({
      socket: {
        host: config.redis.host,
      },
    });

    if (!fs.existsSync(`${__dirname}/../logs`)) {
      fs.mkdirSync('logs', { recursive: true });
    }

    this._client.on('error', (error) => {
      fs.appendFile(`${__dirname}/../logs`, error.message);
    });

    this._client.connect();
  }

  async set(key, value, expired = 1800) {
    await this._client.set(key, value, {
      EX: expired,
    });
  }

  async get(key) {
    const result = await this._client.get(key);
    return result;
  }

  delete(key) {
    return this._client.del(key);
  }
}

module.exports = CacheService;
