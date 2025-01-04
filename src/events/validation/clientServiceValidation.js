const { clientServiceSchema } = require('../../lib/input_validation');

module.exports = (emitter) => {
  emitter.on('beforeCreateClientService', (data) => {
    const { error } = clientServiceSchema.validate(data);
    if (error) {
      emitter.emit('ValidationError', error);
      throw error;
    }
  });

  // emitter.on('beforeInitialSetup', (data) => {
  //   const { error } = setupSchema.validate(data);
  //   if (error) {
  //     emitter.emit('ValidationError', error);
  //     throw error;
  //   }
  // });
};
 