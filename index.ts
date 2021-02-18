// examples

import http from "http";
import combineRoutes from "./combineRoutes";
import createServer from "./createServer";
import httpListener from "./httpListener";
import Route from "./Route";

const users = Route({
  routes: {
    "/": {
      on: {
        GET: {
          effect: () => {
            console.log("here");
          },
        },
      },
    },
    "/{id}": {
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
    logger: () => {
      console.log("top-level logger");
    },
  },
});

const server = () => {
  return createServer({
    listener,
    port: 8080,
  });
};

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
