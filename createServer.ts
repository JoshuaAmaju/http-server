import express, { Express, NextFunction, Request, Response } from "express";
import httpListener from "./httpListener";
import { Block } from "./Router";
import { Action } from "./types";

const registerAction = (app: Express, actions: Action[]) => {
  actions.forEach((fn) => {
    app.use((req, res, next) => fn(req, res, next));
  });
};

const executeEffect = ({
  effect,
  service,
}: Pick<Block, "effect" | "service">) => async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let data: unknown;
  let error: unknown;

  try {
    const _res = await service?.src(req);
    data = service?.onDone?.(req, { data: _res });
  } catch (error) {
    error = service?.onError?.(req, { data: error });
  }

  effect(req, res, next, { data, error });
};

export default async function createServer({
  port,
  listener,
  afterInit,
  beforeInit,
}: {
  port?: number;
  afterInit?: (app: Express) => void;
  beforeInit?: (app: Express) => void;
  listener: ReturnType<typeof httpListener>;
}) {
  const server = express();

  beforeInit?.(server);

  console.log(listener);

  listener.forEach(({ exit, entry, routes }) => {
    registerAction(server, entry);

    for (const path in routes) {
      const { on } = routes[path];

      const route = server.route(path);

      server.get(path, () => {
        console.log("not middleware");
      });

      for (const method in on) {
        const { exit, entry, effect, service } = on[method];

        registerAction(server, entry);

        const exec = executeEffect({ effect, service });

        switch (method.toLowerCase()) {
          case "get":
            route.get(exec);
            break;

          case "post":
            route.post(exec);
            break;

          case "put":
            route.put(exec);
            break;

          case "patch":
            route.patch(exec);
            break;

          case "purge":
            route.purge(exec);
            break;

          case "head":
            route.head(exec);
            break;

          case "options":
            route.options(exec);
            break;

          default:
            break;
        }

        registerAction(server, exit);
      }
    }

    registerAction(server, exit);
  });

  afterInit?.(server);

  return new Promise((resolve, reject) => {
    server.listen(port, () => {
      resolve(null);
    });
  });

  // const server = http.createServer(async (request, response) => {
  //   const { url = "", method = "" } = request;
  //   const resolved = listener.resolve(url, method);
  //   if (resolved) {
  //     let data: unknown;
  //     let error: unknown;
  //     const query = parse(url, true).query;
  //     const [params, { exit, entry, effect, service }] = resolved;
  //     const req: Request = Object.assign({ query, params }, request);
  //     await Promise.all(
  //       entry.map((fn) => {
  //         return fn(req, response);
  //       })
  //     );
  //     try {
  //       const res = service?.src(req);
  //       data = service?.onDone?.(req, { data: res });
  //     } catch (error) {
  //       error = service?.onError?.(req, { data: error });
  //     }
  //     effect(req, response, { data, error });
  //     await Promise.all(
  //       exit.map((fn) => {
  //         return fn(req, response);
  //       })
  //     );
  //   } else {
  //     console.log(`cannot ${method} ${url}`);
  //     response.write(`cannot ${method} ${url}`);
  //     response.end();
  //   }
  // });
  // return new Promise((resolve, reject) => {
  //   server.listen(port, () => {
  //     resolve(null);
  //   });
  // });
}
