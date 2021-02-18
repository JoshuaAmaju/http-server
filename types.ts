import { IncomingMessage, ServerResponse } from "http";
import { UrlWithParsedQuery } from "node:url";

export type Request = IncomingMessage & {
  params: Record<string, unknown>;
  query: UrlWithParsedQuery["query"];
};

export type Response = ServerResponse;

export type Action = (
  request: Request,
  response: Response,
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
