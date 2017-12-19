import { Action } from 'redux'

enum ActionNames {
  AUTO_RELOAD_TOGGLED = 'auto_reload/toggled'
}

interface AutoReloadToggledAction extends Action {
  type: ActionNames.AUTO_RELOAD_TOGGLED
  active: boolean
}
export const autoReloadToggled =
  (active: boolean): AutoReloadToggledAction => ({
    type: ActionNames.AUTO_RELOAD_TOGGLED,
    active,
  });

export type AutoReloadActions = AutoReloadToggledAction

export interface AutoReloadState {
  active: boolean
}

const initialState: AutoReloadState =
  JSON.parse(localStorage.getItem('autoReload') || '{"active":false}');

export default function reducer(
  state: AutoReloadState = initialState,
  action: AutoReloadActions
): AutoReloadState {
  switch (action.type) {
    case ActionNames.AUTO_RELOAD_TOGGLED:
      return {
        ...state,
        active: action.active
      };
    default:
      return state;
  }
}
