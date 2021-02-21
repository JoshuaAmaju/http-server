import resolveDefinition from "./internals/resolve-definition";
import { Config } from "./types/definition";

export default function Router(definition: Config) {
  return { definition, resolve: resolveDefinition(definition) };
}
