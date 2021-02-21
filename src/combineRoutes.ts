import { Config } from "./types/definition";
import Router from "./Router";
import { ExtraConfig } from "./types/resolved-definition";

// add paths to avoid situations like: adding
// / + /resources = //resources or /resources + / = /resources/,
// which is what we want. We want /resources

// const concatPaths = (a: string, b: string) => {
//   let path;

//   if (b.startsWith("/") && a === "/") {
//     path = b;
//   } else if (a.endsWith("/") && b === "/") {
//     path = a;
//   } else {
//     path = `${a}${b}`;
//   }

//   return path;
// };

export default function combineRoutes(
  path: string,
  {
    routes,
    ...rest
  }: {
    routes:
      | ReturnType<typeof Router>[]
      | Record<string, ReturnType<typeof Router>>;
  } & Partial<Pick<Config, "entry" | "exit">> &
    Partial<ExtraConfig>
) {
  const merge = (
    path: string,
    {
      definition: { exit, entry, routes, services, actions },
    }: ReturnType<typeof Router>
  ) => {
    const config: Config = {
      // actions,
      // services,
      routes: {},
      actions: { ...rest.actions, ...actions },
      exit: ([] as any).concat(rest.exit, exit),
      services: { ...rest.services, ...services },
      entry: ([] as any).concat(rest.entry, entry),
    };

    Object.keys(routes).forEach((key) => {
      const route = routes[key];
      // let _path = concatPaths(path, key);
      config.routes[`${path}${key}`] = route;
    });

    return Router(config);
  };

  if (Array.isArray(routes)) {
    return routes.map((route) => merge(path, route));
  }

  return Object.keys(routes).map((_path) => {
    const route = routes[_path];
    return merge(`${path}${_path}` /** concatPaths(path, _path) */, route);
  });
}
