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
const router = require("./blogs/router");

const app = express();

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

app.use("/.netlify/functions/api", router);

module.exports.handler = serverless(app);
