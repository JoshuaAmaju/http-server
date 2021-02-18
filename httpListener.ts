// @ts-ignore
import simplex from "simple-path-expressions";
import combineRoutes from "./combineRoutes";
import NotFound from "./NotFound";
import Route, { Block, ReConfig } from "./Route";
import { ExtraConfig } from "./types";

export default function httpListener({
  routes,
  exit = [],
  entry = [],
  actions = {},
  services = {},
}: {
  routes: ReturnType<typeof Route>[];
} & Partial<Pick<ReConfig, "entry" | "exit">> &
  Partial<ExtraConfig>) {
  const mergedRoutes = combineRoutes("", {
    exit,
    entry,
    routes,
  }).map((route) => {
    return route.resolve({ actions, services });
  });

  const resolve = (
    url: string,
    method: string
  ): [Record<string, any>, Block] | undefined => {
    // if (!url || !method) return null;

    for (const route of mergedRoutes) {
      const { routes } = route;

      const paths = Object.keys(routes);

      console.log("paths", paths, routes);

      for (const path of paths) {
        const route = routes[path];
        const match = simplex.match(path, url);

        // console.log(match, path, url, method, route);

        if (match) {
          const block = route.on[method];

          if (block) {
            const _block = {
              ...block,
              exit: exit.concat(block.exit),
              entry: entry.concat(block.entry),
            };

            return [match, _block];
          }
        }
      }
    }
  };

  return { resolve };
}
