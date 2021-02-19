import { resolve } from "./internals/resolve";
import { Config } from "./partial";
import { Action, Service, ServiceAction } from "./types";

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

export default function Router(c: Config) {
  return { definition: c, resolve: resolve(c) };
}
