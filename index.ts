// examples

import http from "http";
import express from "express";
import { combineRoutes, createServer, httpListener, Router } from "./src";

const rUsers = Router({
  routes: {
    "/": {
      on: {
        GET: {
          entry: "logger",
          service: "getAllUsers",
          effect: ({ body }, res, __, { data }) => {
            res.json({ data, message: "Users: Effect works" });
          },
          meta: {
            tags: ["user"],
            description: "Returns list of users",
            requestBody: {
              description: "user data",
              content: {
                ert: {
                  schema: {
                    type: "object",
                    properties: {
                      name: {
                        type: "string",
                      },
                    },
                  },
                  examples: {
                    Jane: {
                      value: {
                        id: "124",
                        name: "Jane Doe",
                      },
                    },
                  },
                },
              },
            },
            responses: {
              200: {
                description: "A list of users",
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      properties: {
                        name: {
                          type: "string",
                          description: "name of user",
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/:id": {
      on: {
        GET: {
          service: "getUser",
          effect: (_, res, __, { data }) => {
            res.json(data);
          },
          meta: {
            tags: ["user"],
          },
        },
        POST: {
          service: "createUser",
          effect: (_, res) => {
            res.json({ data: "User created" });
          },
        },
      },
    },
  },
  services: {
    getAllUsers: () => Promise.resolve(5555),
    getUser: ({ params: { id } }) => Promise.resolve({ id, name: "Jane Doe" }),
    createUser: ({ params: { id } }) => {
      return Promise.resolve({ id, name: "Jane Doe" });
    },
  },
});

// const user$$ = combineRoutes("/users", {
//   routes: [rUsers],
// });

const listener = httpListener({
  routes: [rUsers],
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
    swagger: {
      openapi: "3.0.0",
      tags: [
        {
          name: "user",
          description: "user object",
        },
      ],
      info: {
        version: "0.0.1",
        description: "Testing swagger",
      },
    },
    beforeInit(app) {
      app.use(express.static("./public"));
    },
  });
};

// const app = express();

// app.use(express.static("./public"));

// app.get("/:id", () => {
//   console.log("here server");
// });

// app.listen(8080, () => {
//   console.log("running");
// });

const main = async () => {
  await server();

  console.log("Server running @ http://localhost:8080");

  //   const options = {
  //     port: 8080,
  //     host: "127.0.0.1",
  //     path: "/",
  //   };

  //   const req = http.request(options);
  //   req.end();

  //   req.on("response", (response) => {
  //     console.log("Receiving response");

  //     response.on("data", (data) => {
  //       console.log(`Got data ${data}`);
  //     });

  //     response.on("end", () => {
  //       console.log("Response ended");
  //     });
  //   });

  //   req.on("information", (info) => {
  //     console.log(`Got information prior to main response: ${info.statusCode}`);
  //   });
};

main();
