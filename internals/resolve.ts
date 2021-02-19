import { ReConfig, ServiceBlock } from "../Router";
import { ExtraConfig, ServiceAction, Action, Service } from "../types";
import { Config, Block as PartialBlock } from "../partial";

const isString = (x: unknown): x is string => {
  return typeof x === "string";
};

const getActions = (extraConfig: ExtraConfig) => (
  action: PartialBlock["entry"] | ServiceAction
): (Action | ServiceAction)[] => {
  if (typeof action === "string") {
    return [extraConfig.actions[action]];
  }

  if (typeof action === "function") {
    return [action];
  }

  if (Array.isArray(action)) {
    // @ts-ignore
    return [].concat(action.map(getActions)).flat();
  }

  return [];
};

export const resolve = ({ exit, entry, routes, services }: Partial<Config>) => (
  extraConfig: ExtraConfig
) => {
  const actionGetter = getActions(extraConfig);

  const recon: ReConfig = {
    routes: {},
    exit: actionGetter(exit) as Action[],
    entry: actionGetter(entry) as Action[],
  };

  if (routes) {
    Object.keys(routes).forEach((path) => {
      const route = routes[path];

      const config = { on: {} } as ReConfig["routes"][typeof path];

      Object.keys(route.on).forEach((method) => {
        const { entry, exit, effect: action, service } = route.on[method];

        const [_action] = actionGetter(action) as Action[];

        let { src, onDone, onError } =
          (typeof service === "string" ? services?.[service] : service) ?? {};

        const nService: ServiceBlock = {
          onDone: actionGetter(onDone)[0] as ServiceAction,
          onError: actionGetter(onError)[0] as ServiceAction,
          src: (isString(src) ? extraConfig.services[src] : src) as Service,
        };

        config.on[method] = {
          effect: _action,
          service: nService,
          exit: actionGetter(exit) as Action[],
          entry: actionGetter(entry) as Action[],
        };
      });

      recon.routes[path] = config;
    });
  }

  return recon;
};
