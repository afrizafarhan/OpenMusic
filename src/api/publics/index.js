const path = require('path');

module.exports = {
  name: 'public',
  version: '1.0.0',
  register: async (server) => {
    server.route({
      method: 'GET',
      path: '/public/{param*}',
      handler: {
        directory: {
          path: path.resolve(__dirname, '../../../public'),
        },
      },
    });
  },
};
