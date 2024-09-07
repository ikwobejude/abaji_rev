module.exports = (emitter) => {
    emitter.on('beforeCreateUser', (data) => {
      console.log(`[LOG] Before creating user: ${JSON.stringify(data)}`);
    });
  
    emitter.on('afterCreateUser', (user) => {
      console.log(`[LOG] User created: ${user.username} (${user.email})`);
    });
  
    emitter.on('userValidationError', (error) => {
      console.error(`[ERROR] Validation failed: ${error.message}`);
    });
  
    emitter.on('userCreationError', (error) => {
      console.error(`[ERROR] User creation failed: ${error.message}`);
    });


    emitter.on('ValidationError', (error) => {
      console.error(`[ERROR] Validation failed: ${error.message}`);
    });

    emitter.on('videoUploadError', (error) => {
      console.error(`[ERROR] Validation failed: ${error.message}`);
    });

    emitter.on('CreationError', (error) => {
      console.error(`[ERROR] User creation failed: ${error.message}`);
    });
  };
  