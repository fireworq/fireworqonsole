import { Action } from 'redux'

enum ActionNames {
  STATS_RETRIEVED = 'stats/retrieved',
  STATS_LIST_RETRIEVED = 'stats/list_retrieved',
  FETCH_STARTED = 'stats/fetch_started',
  FETCH_FINISHED = 'stats/fetch_finished'
}

interface StatsRetrievedAction extends Action {
  type: ActionNames.STATS_RETRIEVED
  queueName: string
  stats: Stats
}
export const statsRetrieved =
  (queueName: string, stats: Stats): StatsRetrievedAction => ({
    type: ActionNames.STATS_RETRIEVED,
    queueName,
    stats
  });

interface StatsListRetrievedAction extends Action {
  type: ActionNames.STATS_LIST_RETRIEVED
  stats: StatsList
}
export const statsListRetrieved =
  (stats: StatsList): StatsListRetrievedAction => ({
    type: ActionNames.STATS_LIST_RETRIEVED,
    stats
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

export type StatsActions = StatsRetrievedAction
                         | StatsListRetrievedAction
                         | FetchStartedAction
                         | FetchFinishedAction;

export interface StatsList { [key:string]: Stats }

export interface Stats {
  totalPushes: number
  totalPops: number
  totalSuccesses: number
  totalFailures: number
  totalCompletes: number
  totalElapsed: number
  pushesPerSecond: number
  popsPerSecond: number
  totalWorkers: number
  idleWorkers: number
};

export interface StatsState {
  stats: StatsList
  statsListLoaded: boolean
  loadingCount: { [key:string]: number }
}

const initialState: StatsState = {
  stats: {},
  statsListLoaded: false,
  loadingCount: {}
};

export interface StatsValue {
  stats?: Stats
  loadingCount?: number
}

export default function reducer(
  state: StatsState = initialState,
  action: StatsActions
): StatsState {
  switch (action.type) {
    case ActionNames.STATS_RETRIEVED:
      return {
        ...state,
        stats: {
          ...state.stats,
          [action.queueName]: action.stats
        }
      };
    case ActionNames.STATS_LIST_RETRIEVED:
      return {
        ...state,
        stats: action.stats,
        statsListLoaded: true
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
    default:
      return state;
  }
}
