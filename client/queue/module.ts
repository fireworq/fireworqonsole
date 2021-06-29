import { Action } from 'redux'
import { Stats, StatsList } from '../stats/module'

enum ActionNames {
  QUEUE_RETRIEVED = 'queue/retrieved',
  QUEUE_LIST_RETRIEVED = 'queue/list_retrieved',
  FETCH_STARTED = 'queue/fetch_started',
  FETCH_FINISHED = 'queue/fetch_finished',
  SAVE_STARTED = 'queue/save_started',
  SAVE_FINISHED = 'queue/save_finished',
  DELETE_STARTED = 'queue/delete_started',
  DELETE_FINISHED = 'queue/delete_finished',
  LIST_FETCH_STARTED = 'queue/list_fetch_started',
  LIST_FETCH_FINISHED = 'queue/list_fetch_finished'
}

interface QueueRetrievedAction extends Action {
  type: ActionNames.QUEUE_RETRIEVED
  queue: Queue
}
export const queueRetrieved =
  (queue: Queue): QueueRetrievedAction => ({
    type: ActionNames.QUEUE_RETRIEVED,
    queue: queue
  });

interface QueueListRetrievedAction extends Action {
  type: ActionNames.QUEUE_LIST_RETRIEVED
  queues: QueueList
}
export const queueListRetrieved =
  (queues: QueueList): QueueListRetrievedAction => ({
    type: ActionNames.QUEUE_LIST_RETRIEVED,
    queues
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

interface SaveStartedAction extends Action {
  type: ActionNames.SAVE_STARTED
  queueName: string
}
export const saveStarted =
  (queueName: string): SaveStartedAction => ({
    type: ActionNames.SAVE_STARTED,
    queueName
  });

interface SaveFinishedAction extends Action {
  type: ActionNames.SAVE_FINISHED
  queueName: string
}
export const saveFinished =
  (queueName: string): SaveFinishedAction => ({
    type: ActionNames.SAVE_FINISHED,
    queueName
  });

interface DeleteStartedAction extends Action {
  type: ActionNames.DELETE_STARTED
  queueName: string
}
export const deleteStarted =
  (queueName: string): DeleteStartedAction => ({
    type: ActionNames.DELETE_STARTED,
    queueName
  });

interface DeleteFinishedAction extends Action {
  type: ActionNames.DELETE_FINISHED
  queueName: string
}
export const deleteFinished =
  (queueName: string): DeleteFinishedAction => ({
    type: ActionNames.DELETE_FINISHED,
    queueName
  });

interface ListFetchStartedAction extends Action {
  type: ActionNames.LIST_FETCH_STARTED
}
export const listFetchStarted =
  (): ListFetchStartedAction => ({
    type: ActionNames.LIST_FETCH_STARTED
  });

interface ListFetchFinishedAction extends Action {
  type: ActionNames.LIST_FETCH_FINISHED
}
export const listFetchFinished =
  (): ListFetchFinishedAction => ({
    type: ActionNames.LIST_FETCH_FINISHED
  });

export type QueueActions = QueueRetrievedAction
                         | QueueListRetrievedAction
                         | FetchStartedAction
                         | FetchFinishedAction
                         | SaveStartedAction
                         | SaveFinishedAction
                         | DeleteStartedAction
                         | DeleteFinishedAction
                         | ListFetchStartedAction
                         | ListFetchFinishedAction;

export interface QueueList { [key:string]: Queue }

export interface Queue {
  name: string
  pollingInterval: number | string
  maxWorkers: number
  maxDispatchesPerSecond?: number
  maxBurstSize?: number
};

export interface QueueState {
  queues: QueueList
  queueListLoaded: boolean
  loadingCount: { [key:string]: number }
  savingCount: { [key:string]: number }
  listLoadingCount: number
}

const initialState: QueueState = {
  queues: {},
  queueListLoaded: false,
  loadingCount: {},
  savingCount: {},
  listLoadingCount: 0
};

export interface QueueValue {
  queue?: Queue
  stats?: Stats
  loadingCount: number
  savingCount: number
}

export interface QueueListValue extends QueueState {
  stats: StatsList
  statsListLoaded: boolean
  nodesLoaded: boolean
}

export default function reducer(
  state: QueueState = initialState,
  action: QueueActions
): QueueState {
  switch (action.type) {
    case ActionNames.QUEUE_RETRIEVED:
      return {
        ...state,
        queues: {
          ...state.queues,
          [action.queue.name]: action.queue
        }
      };
    case ActionNames.QUEUE_LIST_RETRIEVED:
      return {
        ...state,
        queues: action.queues,
        queueListLoaded: true
      };
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
    case ActionNames.SAVE_STARTED: {
      const queueName = action.queueName;
      return {
        ...state,
        savingCount: {
          ...state.savingCount,
          [queueName]: (state.savingCount[queueName] || 0) + 1
        }
      };
    }
    case ActionNames.SAVE_FINISHED: {
      const queueName = action.queueName;
      return {
        ...state,
        savingCount: {
          ...state.savingCount,
          [queueName]: (state.savingCount[queueName] || 0) - 1
        }
      };
    }
    case ActionNames.DELETE_STARTED: {
      const queueName = action.queueName;
      return {
        ...state,
        savingCount: {
          ...state.savingCount,
          [queueName]: (state.savingCount[queueName] || 0) + 1
        }
      };
    }
    case ActionNames.DELETE_FINISHED: {
      const queueName = action.queueName;
      return {
        ...state,
        savingCount: {
          ...state.savingCount,
          [queueName]: (state.savingCount[queueName] || 0) - 1
        }
      };
    }
    case ActionNames.LIST_FETCH_STARTED:
      return {
        ...state,
        listLoadingCount: state.listLoadingCount + 1
      };
    case ActionNames.LIST_FETCH_FINISHED:
      return {
        ...state,
        listLoadingCount: state.listLoadingCount - 1
      };
    default:
      return state;
  }
}
