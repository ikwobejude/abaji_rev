const express = require('express');
const multer = require('multer');
const app = require('../controller/app.controller');
const middleware = require('../middleware/middleware');
const Router = express.Router();

const upload = require('../lib/multer.config')({
  filetypes:  /jpeg|jpg|png/, 
  fileSize: 2 * 1024 * 1024, // 2MB max file size
  msg: 'Only .png, .jpg, and .jpeg format allowed!',
  path:'/uploads/'
});   


Router.route('/')
.get(function(req, res) {
    res.redirect("/login")
})
Router.get('/blank', function(req, res) {
    res.status(200).render('./blank')
})

Router.get('/success', middleware.requireAuth, app.loginSuccess)

Router.route('/clients')
.get(function(req, res) {
    res.status(200).render('./client')
})
.post((req, res, next) => {
    // console.log(req.body)
    upload.single('image')(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        // A Multer error occurred during the file upload (e.g., file too large)
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ message: 'File too large. Maximum size is 5MB.' });
        }
        return res.status(400).json({ message: `Multer error: ${err.message}` });
      } else if (err) {
        // An unknown error occurred during the file upload
        return res.status(400).json({ message: `Error: ${err.message}` });
      }
  
      // If no errors occurred, continue processing the image
      next();
    });
  }, app.addClient);



Router.post('/initialize_payments', app.pushPayment)
Router.get('/payment_notification', app.pushPayment)


module.exports = Router