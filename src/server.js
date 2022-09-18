require('dotenv').config();

const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');

// albums
const albums = require('./api/albums');
const AlbumService = require('./services/AlbumService');
const AlbumValidator = require('./validator/albums');

// songs
const songs = require('./api/songs');
const SongService = require('./services/SongService');
const SongValidator = require('./validator/songs');
const ClientError = require('./exceptions/ClientError');

// users
const users = require('./api/users');
const UsersService = require('./services/UsersService');
const UsersValidator = require('./validator/users');

// authentications
const authentications = require('./api/authentications');
const AuthenticationsService = require('./services/AuthenticationsService');
const AuthenticationsValidator = require('./validator/authentications');
const TokenManager = require('./tokenize/TokenManager');

const init = async () => {
  try {
    const albumService = new AlbumService();
    const songService = new SongService();
    const usersService = new UsersService();
    const authenticationsService = new AuthenticationsService();
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
        plugin: Jwt,
      },
    ]);
    server.auth.strategy('openmusic_jwt', 'jwt', {
      keys: process.env.ACCESS_TOKEN_KEY,
      verify: {
        aud: false,
        iss: false,
        sub: false,
        maxAgeSec: process.env.ACCESS_TOKEN_AGE,
      },
      validate: (artifacts) => ({
        isValid: true,
        credentials: {
          id: artifacts.decoded.payload.id,
        },
      }),
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
      {
        plugin: users,
        options: {
          service: usersService,
          validator: UsersValidator,
        },
      },
      {
        plugin: authentications,
        options: {
          authenticationsService,
          usersService,
          tokenManager: TokenManager,
          validator: AuthenticationsValidator,
        },
      },
    ]);
    await server.start();
    server.ext('onPreResponse', (request, h) => {
      const { response } = request;

      if (response instanceof ClientError) {
        const newResponse = h.response({
          status: 'fail',
          message: response.message,
        });
        newResponse.code(response.statusCode);
        return newResponse;
      }

      console.log(response);

      return response.continue || response;
    });
  } catch (e) {
    console.error(e);
  }
};

init();
