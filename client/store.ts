import version, { VersionActions, VersionState } from './version/module'
import credits, { CreditsActions, CreditsState } from './credits/module'
import setting, { SettingActions, SettingState } from './setting/module'
import queue, { QueueActions, QueueState } from './queue/module'
import routing, { RoutingActions, RoutingState } from './routing/module'
import node, { NodeActions, NodeState } from './node/module'
import stats, { StatsActions, StatsState } from './stats/module'
import job, { JobActions, JobState } from './job/module'
import failedJob, { FailedJobActions, FailedJobState } from './failed-job/module'
import autoReload, { AutoReloadActions, AutoReloadState } from './auto-reload/module'
import { createStore, combineReducers, Action } from 'redux'

const store = createStore(
  combineReducers({
    version,
    credits,
    setting,
    queue,
    routing,
    node,
    stats,
    job,
    failedJob,
    autoReload
  })
);

store.subscribe(() => {
  const state: any = store.getState();
  localStorage.setItem('autoReload', JSON.stringify(state.autoReload));
});

export default store;

export interface ReduxState {
  setting: SettingState
  version: VersionState
  credits: CreditsState
  queue: QueueState
  routing: RoutingState
  node: NodeState
  stats: StatsState
  job: JobState
  failedJob: FailedJobState
  autoReload: AutoReloadState
}

export type ReduxAction = VersionActions
                        | CreditsActions
                        | SettingActions
                        | QueueActions
                        | RoutingActions
                        | NodeActions
                        | StatsActions
                        | JobActions
                        | FailedJobActions
                        | AutoReloadActions
                        | Action
