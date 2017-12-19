import { Action } from 'redux'

enum ActionNames {
  JOB_LIST_RETRIEVED = 'job/list_retrieved',
  JOB_RETRIEVED = 'job/retrieved',
  JOB_DELETED = 'job/deleted',
  SAVE_STARTED = 'job/save_started',
  SAVE_FINISHED = 'job/save_finished',
  FETCH_STARTED = 'job/fetch_started',
  FETCH_FINISHED = 'job/fetch_finished'
}

interface JobListRetrievedAction extends Action {
  type: ActionNames.JOB_LIST_RETRIEVED
  queueName: string
  partition: string
  cursor?: string
  jobs: JobList
}
export const jobListRetrieved =
  (queueName: string, partition: string, cursor: string|undefined, jobs: JobList): JobListRetrievedAction => ({
    type: ActionNames.JOB_LIST_RETRIEVED,
    queueName,
    partition,
    cursor,
    jobs
  });

interface JobRetrievedAction extends Action {
  type: ActionNames.JOB_RETRIEVED
  queueName: string
  job: Job
}
export const jobRetrieved =
  (queueName: string, job: Job): JobRetrievedAction => ({
    type: ActionNames.JOB_RETRIEVED,
    queueName,
    job
  });

interface JobDeletedAction extends Action {
  type: ActionNames.JOB_DELETED
  queueName: string
  id: number
}
export const jobDeleted =
  (queueName: string, id: number): JobDeletedAction => ({
    type: ActionNames.JOB_DELETED,
    queueName,
    id
  });

interface SaveStartedAction extends Action {
  type: ActionNames.SAVE_STARTED
}
export const saveStarted =
  (): SaveStartedAction => ({
    type: ActionNames.SAVE_STARTED
  });

interface SaveFinishedAction extends Action {
  type: ActionNames.SAVE_FINISHED
  queueName: string | undefined
}
export const saveFinished =
  (queueName: string | undefined): SaveFinishedAction => ({
    type: ActionNames.SAVE_FINISHED,
    queueName
  });

interface FetchStartedAction extends Action {
  type: ActionNames.FETCH_STARTED
  queueName: string
  partition: string
}
export const fetchStarted =
  (queueName: string, partition: string): FetchStartedAction => ({
    type: ActionNames.FETCH_STARTED,
    queueName,
    partition
  });

interface FetchFinishedAction extends Action {
  type: ActionNames.FETCH_FINISHED
  queueName: string
  partition: string
}
export const fetchFinished =
  (queueName: string, partition: string): FetchFinishedAction => ({
    type: ActionNames.FETCH_FINISHED,
    queueName,
    partition
  });

export type JobActions = JobListRetrievedAction
                       | JobRetrievedAction
                       | JobDeletedAction
                       | SaveStartedAction
                       | SaveFinishedAction
                       | FetchStartedAction
                       | FetchFinishedAction;

export interface NewJob {
  category: string
  url: string
  payload: any
  runAfter?: number
  timeout?: number
  retryDelay?: number
  maxRetries?: number
}

export interface Job {
  id: number
  category: string
  url: string
  payload: any
  status: string
  createdAt: Date
  nextTry: Date
  timeout: number
  failCount: number
  maxRetries: number
  retryDelay: number
}

export interface JobList {
  jobs: Job[]
  nextCursor?: string
}

export interface JobById {
  [key:string]: Job
}

export interface PartitionedJobList {
  deferred: JobList
  waiting: JobList
  grabbed: JobList
}

export interface QueueJobList {
  [key:string]: PartitionedJobList
}

export interface QueueJobById {
  [key:string]: JobById
}

export interface JobState {
  jobs: QueueJobList
  byId: QueueJobById
  savingCount: number
  loadingCount: { [key:string]: number }
  partitionLoadingCount: { [key:string]: { [key:string]: number } }
}

const initialState: JobState = {
  jobs: {},
  byId: {},
  savingCount: 0,
  loadingCount: {},
  partitionLoadingCount: {}
};

export interface JobListValue {
  jobs?: PartitionedJobList
  loadingCount: number
  partitionLoadingCount: { [key: string]: number }
}

export interface JobValue {
  job?: Job
  loadingCount: number
}

export default function reducer(
  state: JobState = initialState,
  action: JobActions
): JobState {
  switch (action.type) {
    case ActionNames.JOB_LIST_RETRIEVED: {
      const queueName = action.queueName;
      const jobs: PartitionedJobList | any = state.jobs[queueName] || {};
      const list = jobs[action.partition] || {};
      return {
        ...state,
        jobs: {
          ...(state.jobs || {}),
          [queueName]: {
            ...jobs,
            [action.partition]: list.nextCursor === action.cursor ? {
              jobs: (list.jobs || []).concat(action.jobs.jobs),
              nextCursor: action.jobs.nextCursor
            } : action.jobs
          }
        }
      };
    }
    case ActionNames.JOB_RETRIEVED: {
      const queueName = action.queueName;
      const job = action.job;
      const list: { [key:string]: Job } = state.byId[queueName] || {};
      return {
        ...state,
        byId: {
          ...state.byId,
          [queueName]: { ...list, [job.id]: job }
        }
      };
    }
    case ActionNames.JOB_DELETED: {
      const queueName = action.queueName;
      const id = action.id;
      const { [id]: _, ...list}: { [key:string]: Job } = state.byId[queueName] || {};
      const jobs: PartitionedJobList | any = state.jobs[queueName] || {};
      const deferred = ((jobs.deferred || {}).jobs || []).filter((job: Job) => job.id != id);
      const waiting = ((jobs.waiting || {}).jobs || []).filter((job: Job) => job.id != id);
      const grabbed = ((jobs.grabbed || {}).jobs || []).filter((job: Job) => job.id != id);
      return {
        ...state,
        jobs: {
          ...(state.jobs || {}),
          [queueName]: {
            deferred: {
              ...jobs.deferred,
              jobs: deferred
            },
            waiting: {
              ...jobs.waiting,
              jobs: waiting
            },
            grabbed: {
              ...jobs.grabbed,
              jobs: grabbed
            }
          }
        },
        byId: {
          ...state.byId,
          [queueName]: list
        }
      };
    }
    case ActionNames.SAVE_STARTED: {
      return {
        ...state,
        savingCount: state.savingCount + 1
      };
    }
    case ActionNames.SAVE_FINISHED: {
      const queueName = action.queueName;
      if (queueName === undefined)
        return {
          ...state,
          savingCount: state.savingCount - 1
        };

      const { [queueName]: _, ...jobs } = state.jobs;
      return {
        ...state,
        jobs: jobs,
        savingCount: state.savingCount - 1
      };
    }
    case ActionNames.FETCH_STARTED: {
      const queueName = action.queueName;
      const partition = action.partition;
      const partitionLoadingCount =
        state.partitionLoadingCount[queueName] || {};
      return {
        ...state,
        loadingCount: {
          ...state.loadingCount,
          [queueName]: (state.loadingCount[queueName] || 0) + 1
        },
        partitionLoadingCount: {
          ...state.partitionLoadingCount,
          [queueName]: {
            ...partitionLoadingCount,
            [partition]: (partitionLoadingCount[partition] || 0) + 1
          }
        }
      };
    }
    case ActionNames.FETCH_FINISHED: {
      const queueName = action.queueName;
      const partition = action.partition;
      const partitionLoadingCount =
        state.partitionLoadingCount[queueName] || {};
      return {
        ...state,
        loadingCount: {
          ...state.loadingCount,
          [queueName]: (state.loadingCount[queueName] || 0) - 1
        },
        partitionLoadingCount: {
          ...state.partitionLoadingCount,
          [queueName]: {
            ...partitionLoadingCount,
            [partition]: (partitionLoadingCount[partition] || 0) - 1
          }
        }
      };
    }
    default:
      return state;
  }
}
