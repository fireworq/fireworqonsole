import { QueueList as QueueListView } from './QueueList'
import { connect, MapDispatchToPropsParam, MapStateToPropsParam } from 'react-redux'
import { Dispatch } from 'redux'
import { QueueListValue, QueueList, queueListRetrieved, listFetchStarted, listFetchFinished, deleteStarted, deleteFinished } from '../queue/module'
import { StatsList, statsListRetrieved } from '../stats/module'
import { ActionDispatcher as RoutingListActionDispatcher } from '../routing-list/Container'
import { ActionDispatcher as NodesActionDispatcher } from '../version-list/Container'
import { ReduxAction, ReduxState } from '../store'
import { RouteComponentProps } from 'react-router'
import JSON from 'json-bigint'
import { snakeToCamel } from '../util'
import { history } from '../Index'

export class ActionDispatcher {
  constructor(private dispatch: (action: ReduxAction) => void) {}

  public async asyncGetQueueList(): Promise<void> {
    this.dispatch(listFetchStarted());
    try {
      const path = '/api/queues';
      const response: Response = await fetch(path, {
        method: 'GET'
      });
      if (response.ok) {
        const queues = snakeToCamel(JSON.parse(await response.text()));

        this.dispatch(queueListRetrieved(queues.reduce((r: any, q: any) => {
          r[q.name] = q;
          return r;
        }, {}) as QueueList));
      } else {
        throw new Error(`Request to ${path} failed with status code ${response.status}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      this.dispatch(listFetchFinished());
    }
  }

  public async asyncGetQueueStats(): Promise<void> {
    try {
      const path = '/api/queues/stats';
      const response: Response = await fetch(path, {
        method: 'GET'
      });
      if (response.ok) {
        const stats = snakeToCamel(JSON.parse(await response.text()));
        this.dispatch(statsListRetrieved(stats as StatsList));
      } else {
        throw new Error(`Request to ${path} failed with status code ${response.status}`);
      }
    } catch (err) {
      console.error(err);
    }
  }

  public async asyncGetNodes(): Promise<void> {
    await new NodesActionDispatcher(this.dispatch).asyncGetNodeVersions();
  }

  public async asyncDeleteQueue(queueName: string): Promise<void> {
    this.dispatch(deleteStarted(queueName));
    try {
      const path = '/api/queue/' + encodeURIComponent(queueName);
      const response: Response = await fetch(path, {
        method: 'DELETE'
      });
      if (!response.ok) {
        throw new Error(`Request to ${path} failed with status code ${response.status}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      this.dispatch(deleteFinished(queueName));
      history.push('/queues');
      this.asyncGetQueueList();
      new RoutingListActionDispatcher(this.dispatch).asyncGetRoutingList();
    }
  }

  public newQueue(queueName: string) {
    history.push('/queue/' + encodeURIComponent(queueName) + '/edit');
  }
}

const mapStateToProps: MapStateToPropsParam<{value: QueueListValue, autoReload: boolean}, any> =
  (state: ReduxState, props: RouteComponentProps<{params?: string}>) => {
    return {
      value: {
        ...state.queue,
        stats: state.stats.stats,
        statsListLoaded: state.stats.statsListLoaded,
        nodesLoaded: state.version.nodesLoaded || state.version.loadingCount > 0
      },
      autoReload: state.autoReload.active
    };
  };

const mapDispatchToProps: MapDispatchToPropsParam<{actions: ActionDispatcher}, {}> =
  (dispatch: Dispatch<ReduxAction>) => ({actions: new ActionDispatcher(dispatch)});

export default connect(mapStateToProps, mapDispatchToProps)(QueueListView);
