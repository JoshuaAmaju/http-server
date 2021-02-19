import { Router } from "express";
import combineRoutes from "./combineRoutes";
import _Router, { ReConfig } from "./Router";
import { ExtraConfig } from "./types";

export default function httpListener({
  routes,
  exit = [],
  entry = [],
  actions = {},
  services = {},
}: {
  routes: (Router | ReturnType<typeof _Router>)[];
} & Partial<Pick<ReConfig, "entry" | "exit">> &
  Partial<ExtraConfig>) {
  const config = combineRoutes("/", { exit, entry, routes });

  return config.resolve({ actions, services });
}
