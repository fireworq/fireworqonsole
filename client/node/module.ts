import { Action } from 'redux'

export enum ActionNames {
  NODE_RETRIEVED = 'node/retrieved',
  FETCH_STARTED = 'node/fetch_started',
  FETCH_FINISHED = 'node/fetch_finished'
}

export interface NodeRetrievedAction extends Action {
  type: ActionNames.NODE_RETRIEVED
  queueName: string
  node: Node
}
export const nodeRetrieved =
  (queueName: string, node: Node): NodeRetrievedAction => ({
    type: ActionNames.NODE_RETRIEVED,
    queueName,
    node
  });

interface FetchStartedAction extends Action {
  type: ActionNames.FETCH_STARTED
  queueName: string
}
export const fetchStarted =
  (queueName: string): FetchStartedAction => ({
    type: ActionNames.FETCH_STARTED,
    queueName
  });

interface FetchFinishedAction extends Action {
  type: ActionNames.FETCH_FINISHED
  queueName: string
}
export const fetchFinished =
  (queueName: string): FetchFinishedAction => ({
    type: ActionNames.FETCH_FINISHED,
    queueName
  });

export type NodeActions = NodeRetrievedAction
                        | FetchStartedAction
                        | FetchFinishedAction;

export interface Node {
  id: string
  host: string
}

export interface IpToNode { [key:string]: string }

export interface NodeState {
  nodes: { [key:string]: Node }
  loadingCount: { [key:string]: number }
}

const initialState: NodeState = {
  nodes: {},
  loadingCount: {}
};

export interface NodeValue {
  node?: Node
  loadingCount: number
  nodesLoaded: boolean
  ipToNode: IpToNode
}

export default function reducer(
  state: NodeState = initialState,
  action: NodeActions
): NodeState {
  switch (action.type) {
    case ActionNames.NODE_RETRIEVED: {
      const queueName = action.queueName;
      return {
          ...state,
        nodes: {
          ...state.nodes,
          [queueName]: action.node
        }
      };
    }
    case ActionNames.FETCH_STARTED: {
      const queueName = action.queueName;
      return {
        ...state,
        loadingCount: {
          ...state.loadingCount,
          [queueName]: (state.loadingCount[queueName] || 0) + 1
        }
      };
    }
    case ActionNames.FETCH_FINISHED: {
      const queueName = action.queueName;
      return {
        ...state,
        loadingCount: {
          ...state.loadingCount,
          [queueName]: (state.loadingCount[queueName] || 0) - 1
        }
      };
    }
    default:
      return state;
  }
}
