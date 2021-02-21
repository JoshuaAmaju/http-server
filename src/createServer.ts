import express, { Express, NextFunction, Request, Response } from "express";
import httpListener from "./httpListener";
import { SwaggerSpec } from "./types/meta";
import { Action, Block } from "./types/resolved-definition";

const registerAction = (app: Express, actions: Action[]) => {
  actions.forEach((fn) => {
    app.use((req, res, next) => fn(req, res, next, {} as any));
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
    data = service?.onDone?.(req, { data: _res }) ?? _res;
  } catch (err) {
    error = service?.onError?.(req, { data: err }) ?? err;
  }

  effect(req, res, next, { data, error });
};

export default async function createServer({
  port,
  swagger,
  listener,
  afterInit,
  beforeInit,
}: {
  port?: number;
  swagger?: SwaggerSpec;
  afterInit?: (app: Express) => void;
  beforeInit?: (app: Express) => void;
  listener: ReturnType<typeof httpListener>;
}) {
  const server = express();

  let mergedMeta = {};

  listener.forEach(({ meta }) => {
    mergedMeta = {
      ...mergedMeta,
      ...meta,
    };
  });

  beforeInit?.(server);

  if (swagger) {
    const swaggerUI = require("swagger-ui-express");
    server.use(
      "/api-doc",
      swaggerUI.serve,
      swaggerUI.setup({ ...swagger, paths: mergedMeta }, { explorer: true })
    );
  }

  listener.forEach(({ exit, entry, routes }) => {
    registerAction(server, entry);

    for (const path in routes) {
      const { on } = routes[path];

      const route = server.route(path);

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

  return new Promise((resolve) => {
    server.listen(port, () => {
      resolve(null);
    });
  });
}
