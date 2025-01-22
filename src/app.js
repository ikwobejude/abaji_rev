const express = require("express");
const cookieParser = require("cookie-parser");
const session = require("cookie-session");
const compression = require("compression");
const cors = require("cors");
const path = require("path");
const https = require("https");
const xmlparser = require("express-xml-bodyparser");
https.globalAgent.maxSockets = Infinity;

// const timeout = require("connect-timeout");

const app = express();

app.use(compression());
app.use(cors());

// static files
app.use(express.static("public"));
app.use(express.static("uploads"));

app.use(express.json({ limit: "50mb" })); //for json body parser
app.use(cookieParser());
app.use(xmlparser()); // req.rawBody Read XML

// app.use(timeout("180s"));

//session setup
app.set("trust proxy", 1); // trust first proxy
app.use(
  session({
    secret: "kkjkkljkjjl",
    resave: false,
    saveUninitialized: true,
    // store: sessionStore,
    cookie: {
      maxAge: 1 * 24 * 60 * 60,
    },
  })
);

app.use(require("connect-flash")());
app.use(function (req, res, next) {
  res.locals.messages = require("express-messages")(req, res);
  //   res.locals.copyright = currentYear;
  next();
});

app.route("*").get(function (req, res, next) {
  // console.log(req.path)
    res.locals.link = req.path;
  res.locals.copyright = new Date().getFullYear();
  next();
});

const middleware = require("./middleware/middleware");
const appRouter = require("./router/app.routes");
const authRouter = require("./router/auth.routes");
const apiRouter = require("./router/api.routes");
const adminRouter = require("./router/admin.routes");
const setupRouter = require("./router/setup.routes");
const walletRouter = require("./router/wallet.routes");
const reportRouter = require("./router/report.routes");
const superRoutes = require("./router/super.routes");
const budRouter = require("./router/budpay.routes");
const taxpayerRouter = require("./router/tax_payer.routes")

app.set("views", path.join(__dirname, "../views"));
app.set("view engine", "ejs");

app.use("/", appRouter);
app.use(authRouter);
app.use("/api", apiRouter);
app.use("/admin", middleware.requireAuth, adminRouter);
app.use("/setup", middleware.requireAuth, setupRouter);
app.use("/wallet", middleware.requireAuth, walletRouter);
app.use("/report", middleware.requireAuth, reportRouter);
app.use("/pay", budRouter);
app.use('/super', middleware.requireSuperAuth, superRoutes)
app.use("/tax", middleware.requireAuth, taxpayerRouter);


// app.user('/')

module.exports = app;
