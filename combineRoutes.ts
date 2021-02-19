import { Config } from "./partial";
import _Router, { ReConfig } from "./Router";
import { ExtraConfig } from "./types";
import { Router } from "express";
import { resolve as _resolve } from "./internals/resolve";

const registerRoute = (router: Router, { exit, entry, routes }: ReConfig) => {
  entry.forEach((fn) => {
    router.use((req, res) => fn(req as any, res as any));
  });

  for (const path in routes) {
    const { on } = routes[path];
    const route = router.route(path);

    const methods = Object.keys(on);

    methods.forEach((method) => {
      const { exit, entry, effect, service } = on[method];

      // register entry middlewares
      entry.forEach((fn) => {
        router.use((req, res) => fn(req as any, res as any));
      });

      switch (method) {
        case "GET":
          route.get((req, res) => {
            let data: unknown;
            let error: unknown;

            try {
              const res = service?.src(req as any);
              data = service?.onDone?.(req as any, { data: res });
            } catch (error) {
              error = service?.onError?.(req as any, { data: error });
            }

            effect(req, res, { data, error });
          });
          break;

        default:
          break;
      }

      exit.forEach((fn) => {
        router.use((req, res) => fn(req as any, res as any));
      });
    });

    exit.forEach((fn) => {
      router.use((req, res) => fn(req as any, res as any));
    });
  }

  return router;
};

export default function combineRoutes(
  path: string,
  {
    routes,
    ...rest
  }: {
    routes:
      | (Router | ReturnType<typeof _Router>)[]
      | Record<string, Router | ReturnType<typeof _Router>>;
  } & Partial<Pick<Config, "entry" | "exit">> &
    Partial<ExtraConfig>
) {
  const resolve = (extraConfig: ExtraConfig) => {
    const { exit, entry } = _resolve({
      exit: rest.exit,
      entry: rest.entry,
    })(extraConfig);

    const topLevelRouter = Router({ mergeParams: true });

    entry.forEach((fn) => {
      topLevelRouter.use((req, res) => fn(req, res));
    });

    if (Array.isArray(routes)) {
      const router = Router({ mergeParams: true });

      routes.forEach((route) => {
        if (typeof route === "function") {
          router.use(route);
        } else {
          registerRoute(router, route.resolve(extraConfig));
        }
      });

      topLevelRouter.use(path, router);
    } else {
      const router = Router({ mergeParams: true });

      Object.keys(routes).map((_path) => {
        const route = routes[_path];
        const _router = Router({ mergeParams: true });

        if (typeof route === "function") {
          _router.use(route);
        } else {
          registerRoute(_router, route.resolve(extraConfig));
        }

        router.use(_path, _router);
      });

      topLevelRouter.use(path, router);
    }

    exit.forEach((fn) => {
      topLevelRouter.use((req, res) => fn(req, res));
    });

    return topLevelRouter;
  };

  return { resolve };
}
