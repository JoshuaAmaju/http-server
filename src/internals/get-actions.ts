import {
  ExtraConfig,
  ServiceAction,
  Action,
} from "../types/resolved-definition";
import { Block as PartialBlock } from "../types/definition";
import { warn } from "./utils";

const getActions = (extraConfig: ExtraConfig) => (
  action: PartialBlock["entry"] | ServiceAction,
  debug?: { name: string; location: string }
): (Action | ServiceAction)[] => {
  if (typeof action === "string") {
    const _action = extraConfig.actions[action];

    warn(
      `[${debug?.name}]: missing action "${action}" specified at "${debug?.location}"`
    )(!_action);

    return _action ? [_action] : [];
  }

  if (typeof action === "function") {
    return [action];
  }

  if (Array.isArray(action)) {
    // @ts-ignore
    return [].concat(action.map(getActions(extraConfig))).flat();
  }

  return [];
};

export default getActions;
