/* eslint-disable camelcase */
exports.up = (pgm) => {
  pgm.addColumns('albums', {
    cover: {
      type: 'text',
    },
  });
};

exports.down = (pgm) => {
  pgm.dropColumns('albums', 'cover');
};
