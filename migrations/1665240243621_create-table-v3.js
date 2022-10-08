/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.addColumn('albums', {
    cover: {
      type: 'TEXT',
    },
  });
  pgm.createTable('likes', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    album_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    user_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
  });
  pgm.addConstraint('likes', 'fk_likes.album.id', 'FOREIGN KEY(album_id) REFERENCES albums(id) ON DELETE CASCADE');
  pgm.addConstraint('likes', 'fk_likes.user.id', 'FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE');
};

exports.down = (pgm) => {
  pgm.dropColumn('albums', 'cover');
  pgm.dropTable('likes');
};
