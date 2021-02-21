import { Request, Response, NextFunction } from "express";
import { PathMeta } from "./meta";

export type Action = (
  request: Request,
  response: Response,
  next: NextFunction,
  ctx: { data: unknown; error: unknown }
) => Promise<void> | void;

export type ServiceAction = <returnType>(
  req: Request,
  ctx: { data: unknown }
) => returnType;

export type Service = (request: Request) => Promise<unknown>;

export type ExtraConfig = {
  actions: {
    [action: string]: Action;
  };
  services: {
    [service: string]: Service;
  };
};

// Router definition
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

export type ReConfig = Pick<Block, "entry" | "exit"> & {
  routes: {
    [path: string]: {
      on: {
        [method: string]: Block;
      };
    };
  };
  meta: {
    [path: string]: {
      [method: string]: PathMeta;
    };
  };
};
