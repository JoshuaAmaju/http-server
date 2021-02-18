import { Service, Action, ServiceAction } from "./types";

type ServiceBlock = {
  src: string | Service;
  onDone?: string | ServiceAction;
  onError?: string | ServiceAction;
};

export type Block = {
  effect: string | Action;
  service?: string | ServiceBlock;
  exit?: string | string[] | Action | Action[];
  entry?: string | string[] | Action | Action[];
};

type MethodBlocks = {
  [method: string]: Block;
};

export type Config = Pick<Block, "entry" | "exit"> & {
  routes: {
    [path: string]: {
      on: MethodBlocks;
    };
  };
  services?: {
    [service: string]: ServiceBlock;
  };
  actions?: {
    [action: string]: Action;
  };
};
