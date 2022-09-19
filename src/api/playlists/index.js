const PlaylistsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'playlisplaylistServicets',
  version: '1.0.0',
  register: async (server, {
    playlistsService,
    playlistSongsService,
    songService,
    validator,
  }) => {
    const playlistsHandler = new PlaylistsHandler(
      playlistsService,
      playlistSongsService,
      songService,
      validator,
    );
    server.route(routes(playlistsHandler));
  },
};
