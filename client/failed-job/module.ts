import { Action } from 'redux'

enum ActionNames {
  FAILED_JOB_LIST_RETRIEVED = 'failed_job/list_retrieved',
  FAILED_JOB_RETRIEVED = 'failed_job/retrieved',
  FAILED_JOB_DELETED = 'failed_job/deleted',
  FETCH_STARTED = 'failed_job/fetch_started',
  FETCH_FINISHED = 'failed_job/fetch_finished'
}

interface FailedJobListRetrievedAction extends Action {
  type: ActionNames.FAILED_JOB_LIST_RETRIEVED
  queueName: string
  cursor?: string
  jobs: FailedJobList
}
export const failedJobListRetrieved =
  (queueName: string, cursor: string|undefined, jobs: FailedJobList): FailedJobListRetrievedAction => ({
    type: ActionNames.FAILED_JOB_LIST_RETRIEVED,
    queueName,
    cursor,
    jobs
  });

interface FailedJobRetrievedAction extends Action {
  type: ActionNames.FAILED_JOB_RETRIEVED
  queueName: string
  job: FailedJob
}
export const failedJobRetrieved =
  (queueName: string, job: FailedJob): FailedJobRetrievedAction => ({
    type: ActionNames.FAILED_JOB_RETRIEVED,
    queueName,
    job
  });

interface FailedJobDeletedAction extends Action {
  type: ActionNames.FAILED_JOB_DELETED
  queueName: string
  id: number
}
export const failedJobDeleted =
  (queueName: string, id: number): FailedJobDeletedAction => ({
    type: ActionNames.FAILED_JOB_DELETED,
    queueName,
    id
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

export type FailedJobActions = FailedJobListRetrievedAction
                             | FailedJobRetrievedAction
                             | FailedJobDeletedAction
                             | FetchStartedAction
                             | FetchFinishedAction;

export interface Result {
  code: number
  message: string
}

export interface FailedJob {
  id: number
  jobId: number
  category: string
  url: string
  payload: any
  status: string
  createdAt: Date
  failedAt: Date
  failCount: number
  result: Result
}

export interface FailedJobList {
  jobs: FailedJob[]
  nextCursor?: string
}

export interface FailedJobById {
  [key:string]: FailedJob
}

export interface QueueFailedJobList {
  [key:string]: FailedJobList
}

export interface QueueFailedJobById {
  [key:string]: FailedJobById
}

export interface FailedJobState {
  jobs: QueueFailedJobList
  byId: QueueFailedJobById
  loadingCount: { [key:string]: number }
}

const initialState: FailedJobState = {
  jobs: {},
  byId: {},
  loadingCount: {}
};

export interface FailedJobListValue {
  jobs?: FailedJobList
  loadingCount: number
}

export interface FailedJobValue {
  job?: FailedJob
  loadingCount: number
}

export default function reducer(
  state: FailedJobState = initialState,
  action: FailedJobActions
): FailedJobState {
  switch (action.type) {
    case ActionNames.FAILED_JOB_LIST_RETRIEVED: {
      const queueName = action.queueName;
      const list: { [key:string]: any } = state.jobs[queueName] || {};
      const newJobs = list.nextCursor === action.cursor ? {
        jobs: (list.jobs || []).concat(action.jobs.jobs),
        nextCursor: action.jobs.nextCursor
      } : action.jobs;
      return {
        ...state,
        jobs: {
          ...state.jobs,
          [queueName]: {
            ...list,
            ...newJobs
          }
        }
      };
    }
    case ActionNames.FAILED_JOB_RETRIEVED: {
      const queueName = action.queueName;
      const job = action.job;
      const list: { [key:string]: FailedJob } = state.byId[queueName] || {};
      return {
        ...state,
        byId: {
          ...state.byId,
          [queueName]: { ...list, [job.id]: job }
        }
      };
    }
    case ActionNames.FAILED_JOB_DELETED: {
      const queueName = action.queueName;
      const id = action.id;
      const { [id]: _, ...list}: { [key:string]: FailedJob } = state.byId[queueName] || {};
      const jobs: FailedJobList = state.jobs[queueName] || { jobs: [] };
      return {
        ...state,
        jobs: {
          ...(state.jobs || {}),
          [queueName]: {
            ...jobs,
            jobs: jobs.jobs.filter((job: FailedJob) => job.id != id)
          }
        },
        byId: {
          ...state.byId,
          [queueName]: list
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
