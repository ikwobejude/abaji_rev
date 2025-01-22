// const Email = require('../config/email')

const Email = require('../lib/email')

const email = new Email()

module.exports = (emitter) => {
    emitter.on('afterCreateUser', (user) => {
      // Simulate sending a welcome email or other notifications
      console.log(`[NOTIFICATION] Welcome email sent to: ${user.email}`);
    });

    emitter.on('courseEnrollment', (user) => {
      // Simulate sending a welcome email or other notifications
      console.log(`[NOTIFICATION] Welcome email sent to: ${user.email}`);
    });

    emitter.on('afterCreatingClientService', async(details) => {
      // Simulate sending a welcome email or other notifications
      await new Email(details).sendEmail()
      console.log(`[NOTIFICATION] Welcome email sent to: ${details.email}`);
    });
    emitter.on('afterChangingPassword', async(details) => {
      // Simulate sending a welcome email or other notifications
      await new Email(details).sendEmail()
      console.log(`[NOTIFICATION] Client Password change: ${details.email}`);
    });

    emitter.on('AfterOtpSent', async(details) => {
      // Simulate sending a welcome email or other notifications
      await new Email(details).sendEmail()
      console.log(`[NOTIFICATION] Client Password reset Otp: ${details.email}`);
    });
    emitter.on('AfterResetingPassword', async(details) => {
      // Simulate sending a welcome email or other notifications
      await new Email(details).sendEmail()
      console.log(`[NOTIFICATION] Client Password reset successfully : ${details.email}`);
    });

    emitter.on('AfterContactMessageSaved', async(details) => {
      // Simulate sending a welcome email or other notifications
      await new Email(details).sendEmail()
      console.log(`[NOTIFICATION]message received from the client: ${details.email}`);
    });

    emitter.on('AfterLogin', async(details) => {
      // Simulate sending a welcome email or other notifications
      await new Email(details).sendEmail()
      console.log(`[NOTIFICATION]message received from the client: ${details.email}`);
    });
};