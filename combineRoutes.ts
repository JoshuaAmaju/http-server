import { Config } from "./partial";
import Route from "./Route";
import { ExtraConfig } from "./types";

// add paths to avoid situations like: adding
// / + /resources = //resources or /resources + / = /resources/,
// which is what we want. We want /resources
const concatPaths = (a: string, b: string) => {
  let path;

  if (b.startsWith("/") && a === "/") {
    path = b;
  } else if (a.endsWith("/") && b === "/") {
    path = a;
  } else {
    path = `${a}${b}`;
  }

  return path;
};

export default function combineRoutes(
  path: string,
  {
    routes,
    ...rest
  }: {
    routes:
      | ReturnType<typeof Route>[]
      | Record<string, ReturnType<typeof Route>>;
  } & Partial<Pick<Config, "entry" | "exit">> &
    Partial<ExtraConfig>
) {
  const merge = (
    path: string,
    { definition: { exit, entry, routes } }: ReturnType<typeof Route>
  ) => {
    const config: Config = {
      routes: {},
      exit: [].concat(rest.exit as any, exit as any),
      entry: [].concat(rest.entry as any, entry as any),
    };

    Object.keys(routes).forEach((key) => {
      const route = routes[key];
      let _path = concatPaths(path, key);
      config.routes[_path] = route;
    });

    return Route(config);
  };

  if (Array.isArray(routes)) {
    return routes.map((route) => merge(path, route));
  }

  return Object.keys(routes).map((_path) => {
    const route = routes[_path];
    return merge(concatPaths(path, _path), route);
  });
}
