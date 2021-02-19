import { Request, Response, NextFunction } from "express";

export type Action = (
  request: Request,
  response: Response,
  next: NextFunction,
  ctx?: { data: unknown; error: unknown }
) => Promise<void> | void;

export type ServiceAction = <returnType>(
  req: Request,
  ctx: { data: unknown }
) => returnType;

export type Service = <returnType>(request: Request) => Promise<returnType>;

export type ExtraConfig = {
  actions: {
    [action: string]: Action;
  };
  services: {
    [service: string]: Service;
  };
};
