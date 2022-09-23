const ExportsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'exports',
  version: '1.0.0',
  register: async (server, { exportService, playlistsService, validator }) => {
    const exportHandler = new ExportsHandler(exportService, playlistsService, validator);
    server.route(routes(exportHandler));
  },
};
