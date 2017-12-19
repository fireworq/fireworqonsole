import { Action } from 'redux'

enum ActionNames {
  ROUTING_RETRIEVED = 'routing/retrieved',
  ROUTING_LIST_RETRIEVED = 'routing/list_retrieved',
  FETCH_STARTED = 'routing/fetch_started',
  FETCH_FINISHED = 'routing/fetch_finished',
  SAVE_STARTED = 'routing/save_started',
  SAVE_FINISHED = 'routing/save_finished',
  DELETE_STARTED = 'routing/delete_started',
  DELETE_FINISHED = 'routing/delete_finished',
  LIST_FETCH_STARTED = 'routing/list_fetch_started',
  LIST_FETCH_FINISHED = 'routing/list_fetch_finished'
}

interface RoutingRetrievedAction extends Action {
  type: ActionNames.ROUTING_RETRIEVED
  routing: Routing
}
export const routingRetrieved =
  (routing: Routing): RoutingRetrievedAction => ({
    type: ActionNames.ROUTING_RETRIEVED,
    routing: routing
  });

interface RoutingListRetrievedAction extends Action {
  type: ActionNames.ROUTING_LIST_RETRIEVED
  routings: RoutingList
}
export const routingListRetrieved =
  (routings: RoutingList): RoutingListRetrievedAction => ({
    type: ActionNames.ROUTING_LIST_RETRIEVED,
    routings
  });

interface FetchStartedAction extends Action {
  type: ActionNames.FETCH_STARTED
  jobCategory: string
}
export const fetchStarted =
  (jobCategory: string): FetchStartedAction => ({
    type: ActionNames.FETCH_STARTED,
    jobCategory
  });

interface FetchFinishedAction extends Action {
  type: ActionNames.FETCH_FINISHED
  jobCategory: string
}
export const fetchFinished =
  (jobCategory: string): FetchFinishedAction => ({
    type: ActionNames.FETCH_FINISHED,
    jobCategory
  });

interface SaveStartedAction extends Action {
  type: ActionNames.SAVE_STARTED
  jobCategory: string
}
export const saveStarted =
  (jobCategory: string): SaveStartedAction => ({
    type: ActionNames.SAVE_STARTED,
    jobCategory
  });

interface SaveFinishedAction extends Action {
  type: ActionNames.SAVE_FINISHED
  jobCategory: string
  queueName: string
}
export const saveFinished =
  (jobCategory: string, queueName: string): SaveFinishedAction => ({
    type: ActionNames.SAVE_FINISHED,
    jobCategory,
    queueName
  });

interface DeleteStartedAction extends Action {
  type: ActionNames.DELETE_STARTED
  jobCategory: string
}
export const deleteStarted =
  (jobCategory: string): DeleteStartedAction => ({
    type: ActionNames.DELETE_STARTED,
    jobCategory
  });

interface DeleteFinishedAction extends Action {
  type: ActionNames.DELETE_FINISHED
  jobCategory: string
}
export const deleteFinished =
  (jobCategory: string): DeleteFinishedAction => ({
    type: ActionNames.DELETE_FINISHED,
    jobCategory
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

export type RoutingActions = RoutingRetrievedAction
                           | RoutingListRetrievedAction
                           | FetchStartedAction
                           | FetchFinishedAction
                           | SaveStartedAction
                           | SaveFinishedAction
                           | DeleteStartedAction
                           | DeleteFinishedAction
                           | ListFetchStartedAction
                           | ListFetchFinishedAction;

export interface Routing {
  jobCategory: string
  queueName: string
}

export interface RoutingList { [key:string]: Routing }

export interface RoutingState {
  routings: RoutingList
  routingListLoaded: boolean
  loadingCount: { [key:string]: number }
  savingCount: { [key:string]: number }
  listLoadingCount: number
}

const initialState: RoutingState = {
  routings: {},
  routingListLoaded: false,
  loadingCount: {},
  savingCount: {},
  listLoadingCount: 0
};

export interface RoutingValue {
  routing?: Routing
  queueNames: string[]
  queueNamesLoaded: boolean
  loadingCount: number
  savingCount: number
}

export default function reducer(
  state: RoutingState = initialState,
  action: RoutingActions
): RoutingState {
  switch (action.type) {
    case ActionNames.ROUTING_RETRIEVED:
      return {
        ...state,
        routings: {
          ...state.routings,
          [action.routing.jobCategory]: action.routing
        }
      };
    case ActionNames.ROUTING_LIST_RETRIEVED:
      return {
        ...state,
        routings: action.routings,
        routingListLoaded: true
      };
    case ActionNames.FETCH_STARTED: {
      const jobCategory = action.jobCategory;
      return {
        ...state,
        loadingCount: {
          ...state.loadingCount,
          [jobCategory]: (state.loadingCount[jobCategory] || 0) + 1
        }
      };
    }
    case ActionNames.FETCH_FINISHED: {
      const jobCategory = action.jobCategory;
      return {
        ...state,
        loadingCount: {
          ...state.loadingCount,
          [jobCategory]: (state.loadingCount[jobCategory] || 0) - 1
        }
      };
    }
    case ActionNames.SAVE_STARTED: {
      const jobCategory = action.jobCategory;
      return {
        ...state,
        savingCount: {
          ...state.savingCount,
          [jobCategory]: (state.savingCount[jobCategory] || 0) + 1
        }
      };
    }
    case ActionNames.SAVE_FINISHED: {
      const jobCategory = action.jobCategory;
      const queueName = action.queueName;
      return {
        ...state,
        routings: {
          ...state.routings,
          [jobCategory]: {
            jobCategory,
            queueName
          }
        },
        savingCount: {
          ...state.savingCount,
          [jobCategory]: (state.savingCount[jobCategory] || 0) - 1
        }
      };
    }
    case ActionNames.DELETE_STARTED: {
      const jobCategory = action.jobCategory;
      return {
        ...state,
        savingCount: {
          ...state.savingCount,
          [jobCategory]: (state.savingCount[jobCategory] || 0) + 1
        }
      };
    }
    case ActionNames.DELETE_FINISHED: {
      const jobCategory = action.jobCategory;
      const { [jobCategory]: _, ...routings } = state.routings;
      return {
        ...state,
        routings,
        savingCount: {
          ...state.savingCount,
          [jobCategory]: (state.savingCount[jobCategory] || 0) - 1
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
