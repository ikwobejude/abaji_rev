const validations = require('../../lib/input_validation');

module.exports = (emitter) => {

  // login validation events
  emitter.on('beforeLogin', (data) => {
    const { error } = validations.login.validate(data);
    if (error) {
      emitter.emit('ValidationError', error);
      throw error;
    }
  });


  emitter.on('beforeCreateRevenueLine', (data) => {
    const { error } = validations.economicValidation.validate(data);
    if (error) {
      emitter.emit('ValidationError', error);
      throw error;
    }
  });

  emitter.on('beforeCreateRevenueItem', (data) => {
    const { error } = validations.taxItemsValidation.validate(data);
    if (error) {
      emitter.emit('ValidationError', error);
      throw error;
    }
  });

  emitter.on('beforeCreateUser', (data) => {
    const { error } = validations.userValidation.validate(data);
    if (error) {
      emitter.emit('ValidationError', error);
      throw error;
    }
  });


  emitter.on('before_creating_building_categories', (data) => {
    const { error } = validations.buildingCategoryValidation.validate(data);
    if (error) {
      console.log(error)
      emitter.emit('ValidationError', error);
      throw error;
    }
  });

  emitter.on('before_edit_building_categories', (data) => {
    const { error } = validations.buildingTypeValidation.validate(data);
    if (error) {
      console.log(error)
      emitter.emit('ValidationError', error);
      throw error;
    }
  });

  emitter.on('before_building_types', (data) => {
    const { error } = validations.businessTypeValidation.validate(data);
    if (error) {
      console.log(error)
      emitter.emit('ValidationError', error);
      throw error;
    }
  });

  emitter.on('before_building_operation', (data) => {
    const { error } = validations.businessOperationValidation.validate(data);
    if (error) {
      console.log(error)
      emitter.emit('ValidationError', error);
      throw error;
    }
  });

  emitter.on('before_building_categories', (data) => {
    const { error } = validations.businessCategoryValidation.validate(data);
    if (error) {
      emitter.emit('ValidationError', error);
      throw error;
    }
  });


  emitter.on('beforeCreateOffice', (data) => {
    const { error } = validations.officeFormData.validate(data);
    if (error) {
      emitter.emit('ValidationError', error);
      throw error;
    }
  });



  
};
 