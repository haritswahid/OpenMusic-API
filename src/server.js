require('dotenv').config();

const Hapi = require('@hapi/hapi');
const hapiAuthJwt = require('@hapi/jwt');

const OpenMusicValidator = require('./validator/openmusic');
const TokenManager = require('./tokenize/TokenManager');

const albums = require('./api/albums');
const songs = require('./api/songs');
const users = require('./api/users');
const authentications = require('./api/authentications');
const playlists = require('./api/playlists');
const collaborations = require('./api/collaborations');
const exportsApi = require('./api/exports');

const AlbumsService = require('./services/postgres/AlbumsService');
const SongsService = require('./services/postgres/SongsService');
const UsersService = require('./services/postgres/UsersService');
const AuthenticationsService = require('./services/postgres/AuthenticationsService');
const PlaylistsService = require('./services/postgres/PlaylistsService');
const CollaborationsService = require('./services/postgres/CollaborationsService');

const producerService = require('./services/rabbitmq/ProducerService');

const init = async () => {
  const albumsService = new AlbumsService();
  const songsService = new SongsService();
  const usersService = new UsersService();
  const authenticationsService = new AuthenticationsService();
  const collaborationsService = new CollaborationsService();
  const playlistsService = new PlaylistsService(collaborationsService);

  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  // registrasi plugin eksternal
  await server.register([
    {
      plugin: hapiAuthJwt,
    },
  ]);

  // mendefinisikan strategy autentikasi jwt
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
      {
        plugin: playlists,
        options: {
          service: playlistsService,
          validator: OpenMusicValidator,
        },
      },
      {
        plugin: collaborations,
        options: {
          collaborationsService,
          playlistsService,
          validator: OpenMusicValidator,
        },
      },
      {
        plugin: exportsApi,
        options: {
          producerService,
          playlistsService,
          validator: OpenMusicValidator,
        },
      },
    ],
  );

  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
