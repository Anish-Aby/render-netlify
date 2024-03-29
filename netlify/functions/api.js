// const express = require("express");
// const cors = require("cors");
// const serverless = require("serverless-http");

// // const BlogRouter = require(`${__dirname}/routes/BlogRoutes.js`);
// // const UserRouter = require(`${__dirname}/routes/UserRoutes.js`);

// const app = express();
// const morgan = require("morgan");

// app.use(express.json());
// // app.use(express.static("public"));

// const corsOptions = {
//   // origin: "https://renderio.netlify.app",
//   // origin: "https://renderio.netlify.app",
//   origin: "*",
//   credentials: true, //access-control-allow-credentials:true
//   optionSuccessStatus: 200,
// };
// app.use(cors(corsOptions));

// if (process.env.NODE_ENV === "development") {
//   app.use(morgan("dev"));
// }

// const router = express.Router();

// router.get("/", (req, res) => {
//   res.writeHead(200, { "Content-Type": "text/html" });
//   res.write("Hello, actions");
//   res.end();
// });

// router.get("/like", (req, res) => {
//   res.status(200).json({ action: "like" });
// });

// app.use("/.netlify/functions/actions", router);
// // app.use("/api/v1/users", UserRouter);

// module.exports.handler = serverless(app);

const express = require("express");
const serverless = require("serverless-http");
const cors = require("cors");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");

const dotenv = require("dotenv");
dotenv.config();

const BlogRouter = require("./routes/BlogRoutes");
const UserRouter = require("./routes/UserRoutes");
const globalErrorHandler = require("./controllers/errorController");
const AppError = require("../../utils/appError");

const app = express();

// 1.) Global middlewares

// set security
app.use(helmet());

// Body parser, reading data from body into req.body
app.use(express.json());

// Data sanatization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(hpp());

// Serving static files
app.use(express.static("./public"));
app.use(cors());

app.use(function (req, res, next) {
  const allowedHosts = ["render-api.netlify.app", "localhost:8888"];
  const host = req.headers.host;
  console.log(`host: ${host}`);

  if (allowedHosts.includes(host)) {
    next();
  } else {
    return res.status(405).send("Host Not Allowed");
  }
});

app.use("/api/blogs", BlogRouter);
app.use("/api/users", UserRouter);

app.use("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports.handler = serverless(app);
