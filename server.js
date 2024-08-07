const dotenv = require("dotenv")

dotenv.config({path: './config.env'})

const app = require("./src/app.js");



const port = process.env.PORT || 3000;



app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});

process.on('SIGINT', function() {
    process.exit(1)
});

