const { permissions } = require('../../lib/input_validation');

module.exports = (emitter) => {
  emitter.on('beforeCreatingPermission', (data) => {
    const { error } = permissions.validate(data);
    if (error) {
      emitter.emit('ValidationError', error);
      throw error;
    }
  });
};
 