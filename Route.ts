import { Config, Block as PartialBlock } from "./partial";
import { Service, Action, ExtraConfig, ServiceAction } from "./types";

export type ServiceBlock = {
  src: Service;
  onDone?: ServiceAction;
  onError?: ServiceAction;
};

export type Block = {
  exit: Action[];
  entry: Action[];
  effect: Action;
  service?: ServiceBlock;
};

export type MethodBlocks = {
  [method: string]: Block;
};

export type ReConfig = Pick<Block, "entry" | "exit"> & {
  routes: {
    [path: string]: {
      on: MethodBlocks;
    };
  };
};

const isString = (x: unknown): x is string => {
  return typeof x === "string";
};

export default function Route(c: Config) {
  const resolve = (extraConfig: ExtraConfig) => {
    const getActions = (
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

    const recon: ReConfig = {
      routes: {},
      exit: getActions(c.exit) as Action[],
      entry: getActions(c.entry) as Action[],
    };

    Object.keys(c.routes).forEach((path) => {
      const route = c.routes[path];

      const config = { on: {} } as ReConfig["routes"][typeof path];

      Object.keys(route.on).forEach((method) => {
        const { entry, exit, effect: action, service } = route.on[method];

        const [_action] = getActions(action) as Action[];

        let { src, onDone, onError } =
          (typeof service === "string" ? c.services?.[service] : service) ?? {};

        const nService: ServiceBlock = {
          onDone: getActions(onDone)[0] as ServiceAction,
          onError: getActions(onError)[0] as ServiceAction,
          src: (isString(src) ? extraConfig.services[src] : src) as Service,
        };

        config.on[method] = {
          effect: _action,
          service: nService,
          exit: getActions(exit) as Action[],
          entry: getActions(entry) as Action[],
        };
      });

      recon.routes[path] = config;
    });

    return recon;
  };

  return { definition: c, resolve };
}
