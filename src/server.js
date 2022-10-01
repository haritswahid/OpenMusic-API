require('dotenv').config();

const Hapi = require('@hapi/hapi');

const OpenMusicValidator = require('./validator/openmusic');
const TokenManager = require('./tokenize/TokenManager');

const albums = require('./api/albums');
const songs = require('./api/songs');
const users = require('./api/users');
const authentications = require('./api/authentications');

const AlbumsService = require('./services/postgres/AlbumsService');
const SongsService = require('./services/postgres/SongsService');
const UsersService = require('./services/postgres/UsersService');
const AuthenticationsService = require('./services/postgres/AuthenticationsService');

const init = async () => {
  const albumsService = new AlbumsService();
  const songsService = new SongsService();
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

  await server.register(
    [
      {
        plugin: albums,
        options: {
          service: albumsService,
          validator: OpenMusicValidator,
        },
      },
      {
        plugin: songs,
        options: {
          service: songsService,
          validator: OpenMusicValidator,
        },
      },
      {
        plugin: users,
        options: {
          service: usersService,
          validator: OpenMusicValidator,
        },
      },
      {
        plugin: authentications,
        options: {
          authenticationsService,
          usersService,
          tokenManager: TokenManager,
          validator: OpenMusicValidator,
        },
      },
    ],
  );

  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
