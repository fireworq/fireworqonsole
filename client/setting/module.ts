import { Action } from 'redux'

enum ActionNames {
  NODE_SETTINGS_RETRIEVED = 'setting/node_settings_retrieved',
  FETCH_STARTED = 'setting/fetch_started',
  FETCH_FINISHED = 'setting/fetch_finished'
}

interface NodeSettingsRetrievedAction extends Action {
  type: ActionNames.NODE_SETTINGS_RETRIEVED
  nodeSettings: NodeSettings
}
export const nodeSettingsRetrieved =
  (settings: NodeSettings): NodeSettingsRetrievedAction => ({
    type: ActionNames.NODE_SETTINGS_RETRIEVED,
    nodeSettings: settings
  });

interface FetchStartedAction extends Action {
  type: ActionNames.FETCH_STARTED
}
export const fetchStarted =
  (): FetchStartedAction => ({
    type: ActionNames.FETCH_STARTED
  });

interface FetchFinishedAction extends Action {
  type: ActionNames.FETCH_FINISHED
}
export const fetchFinished =
  (): FetchFinishedAction => ({
    type: ActionNames.FETCH_FINISHED
  });

export type SettingActions = NodeSettingsRetrievedAction
                           | FetchStartedAction
                           | FetchFinishedAction;

export interface NodeSettings {
  [key:string]: { [key:string]: string }
};

export interface SettingState {
  nodeSettings: NodeSettings
  loadingCount: number
};

const initialState: SettingState = {
  nodeSettings: {},
  loadingCount: 0
};

export interface NodeInfo {
  node: string
  ips: string[]
}

export interface SettingListValue extends SettingState {
  nodes: NodeInfo[]
  nodesLoaded: boolean
}

export default function reducer(
  state: SettingState = initialState,
  action: SettingActions
): SettingState {
  switch (action.type) {
    case ActionNames.NODE_SETTINGS_RETRIEVED:
      return {
        ...state,
        nodeSettings: action.nodeSettings
      };
    case ActionNames.FETCH_STARTED:
      return {
        ...state,
        loadingCount: state.loadingCount + 1
      };
    case ActionNames.FETCH_FINISHED:
      return {
        ...state,
        loadingCount: state.loadingCount - 1
      };
    default:
      return state;
  }
}
