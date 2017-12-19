import { Queue as QueueView } from './Queue'
import { connect, MapDispatchToPropsParam, MapStateToPropsParam } from 'react-redux'
import { Dispatch } from 'redux'
import { QueueValue, queueRetrieved, fetchStarted, fetchFinished, saveStarted, saveFinished } from './module'
import { Queue } from './module'
import { Stats, statsRetrieved } from '../stats/module'
import { ActionDispatcher as QueueListActionDispatcher } from '../queue-list/Container'
import { ReduxAction, ReduxState } from '../store'
import { RouteComponentProps } from 'react-router'
import { snakeToCamel } from '../util'
import { decode } from '../path'
import { history } from '../Index'

export class ActionDispatcher {
  constructor(private dispatch: (action: ReduxAction) => void) {}

  public async asyncGetQueue(queueName: string): Promise<void> {
    this.dispatch(fetchStarted(queueName));
    try {
      const path = '/api/queue/' + encodeURIComponent(queueName);
      const response: Response = await fetch(path, {
        method: 'GET'
      });
      if (response.ok) {
        const queue = snakeToCamel(await response.json());

        this.dispatch(queueRetrieved(queue as Queue));
      } else {
        throw new Error(`Request to ${path} failed with status code ${response.status}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      this.dispatch(fetchFinished(queueName));
    }
  }

  public async asyncPutQueue(queueName: string, args: any): Promise<void> {
    this.dispatch(saveStarted(queueName));
    try {
      const path = '/api/queue/' + encodeURIComponent(queueName);
      const response: Response = await fetch(path, {
        method: 'PUT',
        body: JSON.stringify(args)
      });
      if (!response.ok) {
        throw new Error(`Request to ${path} failed with status code ${response.status}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      this.dispatch(saveFinished(queueName));
      history.push('/queue/' + encodeURIComponent(queueName));
      this.asyncGetQueue(queueName);
    }
  }

  public async asyncDeleteQueue(queueName: string): Promise<void> {
    await new QueueListActionDispatcher(this.dispatch).asyncDeleteQueue(queueName);
  }

  public async asyncGetQueueStats(queueName: string): Promise<void> {
    try {
      const path = '/api/queue/' + encodeURIComponent(queueName) + '/stats';
      const response: Response = await fetch(path, {
        method: 'GET'
      });
      if (response.ok) {
        const stats = snakeToCamel(await response.json());
        this.dispatch(statsRetrieved(queueName, stats as Stats));
      } else {
        throw new Error(`Request to ${path} failed with status code ${response.status}`);
      }
    } catch (err) {
      console.error(err);
    }
  }
}

interface Props extends RouteComponentProps<{queueName?: string}> {
  queueName?: string
}

const mapStateToProps: MapStateToPropsParam<{value: QueueValue}, any> =
  (state: ReduxState, props: Props) => {
    const queueName = props.queueName || decode(props.match.params.queueName);
    if (queueName === undefined)
      return { value: { loadingCount: 0, savingCount: 0 } };
    return { queueName, value: {
      queue: state.queue.queues[queueName],
      stats: state.stats.stats[queueName],
      loadingCount: state.queue.loadingCount[queueName] || 0,
      savingCount:  state.queue.savingCount[queueName] || 0
    } };
  };

const mapDispatchToProps: MapDispatchToPropsParam<{actions: ActionDispatcher}, {}> =
  (dispatch: Dispatch<ReduxAction>) => ({actions: new ActionDispatcher(dispatch)});

export default connect(mapStateToProps, mapDispatchToProps)(QueueView);
