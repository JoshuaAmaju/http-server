import { PathMeta } from "./meta";
import { Service, Action, ServiceAction } from "./resolved-definition";

type ServiceBlock = {
  src: string | Service;
  onDone?: string | ServiceAction;
  onError?: string | ServiceAction;
};

export type Block = {
  meta?: PathMeta;
  effect: string | Action;
  service?: string | ServiceBlock;
  exit?: string | string[] | Action | Action[];
  entry?: string | string[] | Action | Action[];
};

export type Config = Pick<Block, "entry" | "exit"> & {
  routes: {
    [path: string]: {
      on: {
        [method: string]: Block;
      };
    };
  };
  services?: {
    [service: string]: Service | ServiceBlock;
  };
  actions?: {
    [action: string]: Action;
  };
};
