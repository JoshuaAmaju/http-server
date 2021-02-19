// examples

import express from "express";
import http from "http";
import combineRoutes from "./combineRoutes";
import createServer from "./createServer";
import httpListener from "./httpListener";
import Router from "./Router";

const users = Router({
  routes: {
    "/": {
      on: {
        GET: {
          effect: (_, res) => {
            console.log("here");

            res.json({ data: "Effect works" });
          },
        },
      },
    },
    "/:id": {
      on: {
        POST: {
          effect: () => {},
        },
      },
    },
  },
});

// const posts = Route({
//   routes: {
//     "/": {
//       on: {
//         GET: {
//           action: () => {},
//         },
//       },
//     },
//     "/{title}": {
//       on: {
//         POST: {
//           action: () => {},
//         },
//       },
//     },
//   },
// });

const resources = combineRoutes("/resources", {
  exit: ["logger"],
  entry: ["logger"],
  routes: [users],
});

const listener = httpListener({
  routes: resources,
  actions: {
    logger: (_, __, next) => {
      console.log("top-level logger");
      next();
    },
  },
});

const server = () => {
  return createServer({
    listener,
    port: 8080,
  });
};

// const app = express();

// app.get("/user/", () => {
//   console.log("here here");
// });

// app.listen(8080, () => {
//   console.log("running");
// });

(async () => {
  await server();

  console.log("Server running @ http://localhost:8080");

  const options = {
    port: 8080,
    host: "127.0.0.1",
    path: "/",
  };

  const req = http.request(options);
  req.end();

  req.on("information", (info) => {
    console.log(`Got information prior to main response: ${info.statusCode}`);
  });
})();
