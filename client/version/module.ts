import { Action } from 'redux'
import { IpToNode } from '../node/module'

enum ActionNames {
  CONSOLE_VERSION_RETRIEVED = 'version/console_retrieved',
  NODE_VERSIONS_RETRIEVED = 'version/node_versions_retrieved',
  FETCH_STARTED = 'version/fetch_started',
  FETCH_FINISHED = 'version/fetch_finished'
}

interface ConsoleVersionRetrievedAction extends Action {
  type: ActionNames.CONSOLE_VERSION_RETRIEVED
  consoleVersion: string
}
export const consoleVersionRetrieved =
  (version: string): ConsoleVersionRetrievedAction => ({
    type: ActionNames.CONSOLE_VERSION_RETRIEVED,
    consoleVersion: version
  });

interface NodeVersionsRetrievedAction extends Action {
  type: ActionNames.NODE_VERSIONS_RETRIEVED
  nodeVersions: NodeVersion[]
}
export const nodeVersionsRetrieved =
  (versions: NodeVersion[]): NodeVersionsRetrievedAction => ({
    type: ActionNames.NODE_VERSIONS_RETRIEVED,
    nodeVersions: versions
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

export type VersionActions = ConsoleVersionRetrievedAction
                           | NodeVersionsRetrievedAction
                           | FetchStartedAction
                           | FetchFinishedAction;

export interface NodeVersion {
  node: string
  url: string
  ips: string[]
  version: string
  valid: boolean
};

export interface VersionState {
  consoleVersion: string
  nodeVersions: NodeVersion[]
  nodesLoaded: boolean
  ipToNode: IpToNode
  loadingCount: number
};

const initialState: VersionState = {
  consoleVersion: "",
  nodeVersions: [],
  nodesLoaded: false,
  ipToNode: {},
  loadingCount: 0
};

export default function reducer(
  state: VersionState = initialState,
  action: VersionActions
): VersionState {
  switch (action.type) {
    case ActionNames.CONSOLE_VERSION_RETRIEVED:
      return {
        ...state,
        consoleVersion: action.consoleVersion
      };
    case ActionNames.NODE_VERSIONS_RETRIEVED:
      let ipToNode = {} as { [key:string]: string };
      action.nodeVersions.forEach((node) => {
        node.ips.forEach((ip) => {
          ipToNode[ip] = node.node.split(':')[0];
        });
      });
      return {
        ...state,
        nodeVersions: action.nodeVersions.map((v) => {
          return {
            ...v,
            valid: /^Fireworq [0-9.]+(?:[-][a-zA-Z0-9.-]+)?(?:[+][a-zA-Z0-9.-]+)?$/.test(v.version)
          };
        }),
        nodesLoaded: true,
        ipToNode: ipToNode
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
