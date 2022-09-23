const AlbumsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'albums',
  version: '1.0.0',
  register: async (server, { service, uploadService, validator }) => {
    const albumsHandler = new AlbumsHandler(service, uploadService, validator);
    server.route(routes(albumsHandler));
  },
};
