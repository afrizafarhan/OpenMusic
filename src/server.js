require('dotenv').config();

const Hapi = require('@hapi/hapi');

// albums
const albums = require('./api/albums');
const AlbumService = require('./services/AlbumService');
const AlbumValidator = require('./validator/albums');

// songs
const songs = require('./api/songs');
const SongService = require('./services/SongService');
const SongValidator = require('./validator/songs');

const init = async () => {
  try {
    const albumService = new AlbumService();
    const songService = new SongService();
    const server = Hapi.server({
      port: process.env.PORT,
      host: process.env.HOST,
      routes: {
        cors: {
          origin: ['*'],
        },
      },
    });
    await server.register([
      {
        plugin: albums,
        options: {
          service: albumService,
          validator: AlbumValidator,
        },
      },
      {
        plugin: songs,
        options: {
          service: songService,
          validator: SongValidator,
        },
      },
    ]);
    await server.start();
  } catch (e) {
    console.error(e)
  }
};

init();
