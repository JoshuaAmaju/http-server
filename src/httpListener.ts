import Route from "./Router";
import { ReConfig, ExtraConfig } from "./types/resolved-definition";

export default function httpListener({
  routes,
  exit = [],
  entry = [],
  actions = {},
  services = {},
}: {
  routes: ReturnType<typeof Route>[];
} & Partial<Pick<ReConfig, "entry" | "exit">> &
  Partial<ExtraConfig>) {
  return routes
    .map(({ definition }) => {
      return Route({
        routes: definition.routes,
        actions: definition.actions,
        services: definition.services,
        exit: ([] as any).concat(exit, definition.exit),
        entry: ([] as any).concat(entry, definition.entry),
      });
    })
    .map((route) => {
      return route.resolve({ actions, services });
    });
}
