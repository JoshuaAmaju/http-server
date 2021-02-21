import {
  ExtraConfig,
  ServiceAction,
  Action,
  Service,
  ReConfig,
  ServiceBlock,
} from "../types/resolved-definition";
import { Config } from "../types/definition";
import getActions from "./get-actions";
import { isString } from "./utils";

const resolve = ({ exit, entry, routes, services }: Partial<Config>) => (
  extraConfig: ExtraConfig
) => {
  const actionGetter = getActions(extraConfig);

  const recon: ReConfig = {
    meta: {},

    routes: {},

    exit: actionGetter(exit, {
      name: "exit",
      location: "(root)",
    }) as Action[],

    entry: actionGetter(entry, {
      name: "entry",
      location: "(root)",
    }) as Action[],
  };

  if (routes) {
    Object.keys(routes).forEach((path) => {
      const route = routes[path];

      const config = { on: {} } as ReConfig["routes"][typeof path];

      // const _meta = {} as any;

      recon.meta = {
        ...recon.meta,
        [path]: {},
      };

      Object.keys(route.on).forEach((method) => {
        const { meta, entry, exit, effect, service } = route.on[method];

        const [action] = actionGetter(effect) as Action[];

        const regex = RegExp(/([:^])\w+/g);

        // const [target, symbol] = regex.exec(path) ?? [];

        // const name = `{${target.substr(1)}}`;

        const newPath = path.replace(regex, (m, group) => {
          return `{${m.substr(1)}}`;
        });

        console.log(path, newPath);

        // const n = path.matchAll(regex);

        // const n = "/user/:id/:name".replace(regex, (m, group) => {
        //   return `{${m.substr(1)}}`;
        // });

        // console.log(n);

        // console.log(regex.exec("/user/:id/:name"), n.next(), n.next());

        recon.meta[newPath] = {
          ...(recon.meta?.[newPath] ?? {}),
          [method.toLowerCase()]: meta as any,
        };

        const _service =
          typeof service === "string"
            ? services?.[service]
            : typeof service === "function"
            ? ({ src: service } as ServiceBlock)
            : service;

        let { src, onDone, onError } =
          typeof _service === "function"
            ? ({ src: _service } as ServiceBlock)
            : _service ?? {};

        // let { src, onDone, onError } =
        //   (typeof service === "string"
        //     ? services?.[service]
        //     : typeof service === "function"
        //     ? ({ src: service } as ServiceBlock)
        //     : service) ?? ({} as any);

        const nService: ServiceBlock = {
          onDone: actionGetter(onDone)[0] as ServiceAction,
          onError: actionGetter(onError)[0] as ServiceAction,
          src: (isString(src) ? extraConfig.services[src] : src) as Service,
        };

        config.on[method] = {
          effect: action,
          service: nService,

          exit: actionGetter(exit, {
            name: "exit",
            location: `${method}: ${path}`,
          }) as Action[],

          entry: actionGetter(entry, {
            name: "entry",
            location: `${method}: ${path}`,
          }) as Action[],
        };
      });

      recon.routes[path] = config;
    });
  }

  return recon;
};

export default resolve;
