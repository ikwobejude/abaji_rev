const multer = require('multer');
const path = require('path');
const fs = require('fs');
module.exports = function (value) {
    // Set up Multer storage
    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
          cb(null, path.join(__dirname, '/uploads'));
        },
        filename: (req, file, cb) => {
          cb(null, Date.now() + path.extname(file.originalname)); // Add timestamp to file name
        }
    });
    
    // File filter to only allow image files
    const fileFilter = (req, file, cb) => {
        // const filetypes = /jpeg|jpg|png/; // Allowed extensions
        const extname = value.filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = value.filetypes.test(file.mimetype);
    
        if (mimetype && extname) {
           return cb(null, true);
        } else {
           cb(new Error(value.smg));
        }
    };
    
    // Set limits for file size (e.g., 2 MB limit)
    const upload = multer({
        storage: storage,
        limits: { fileSize: value.fileSize }, // Limit file size to 2 MB
        fileFilter: fileFilter
    });
    
    //   const upload = multer({ storage: storage });
    
    // Create the uploads directory if it doesn't exist
    // const dir = path.join(__dirname, '../../public/uploads');
    const dir = path.join(__dirname, "/uploads");

    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir, { recursive: true });
    }

    return upload;
}