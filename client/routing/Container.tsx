import { Routing as RoutingView } from './Routing'
import { connect, MapDispatchToPropsParam, MapStateToPropsParam } from 'react-redux'
import { Dispatch } from 'redux'
import { Routing, RoutingValue, routingRetrieved, fetchStarted, fetchFinished, saveStarted, saveFinished, deleteStarted, deleteFinished } from './module'
import { ActionDispatcher as QueueListActionDispatcher } from '../queue-list/Container'
import { ReduxAction, ReduxState } from '../store'
import { RouteComponentProps } from 'react-router'
import { snakeToCamel } from '../util'
import { decode } from '../path'
import { history } from '../Index'

export class ActionDispatcher {
  constructor(private dispatch: (action: ReduxAction) => void) {}

  public async asyncGetRouting(jobCategory: string): Promise<void> {
    this.dispatch(fetchStarted(jobCategory));
    try {
      const path = '/api/routing/' + encodeURIComponent(jobCategory);
      const response: Response = await fetch(path, {
        method: 'GET'
      });
      if (response.ok) {
        const routing = snakeToCamel(await response.json());

        this.dispatch(routingRetrieved(routing as Routing));
      } else {
        throw new Error(`Request to ${path} failed with status code ${response.status}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      this.dispatch(fetchFinished(jobCategory));
    }
  }

  public async asyncPutRouting(jobCategory: string, queueName: string): Promise<void> {
    this.dispatch(saveStarted(jobCategory));
    try {
      const path = '/api/routing/' + encodeURIComponent(jobCategory);
      const response: Response = await fetch(path, {
        method: 'PUT',
        body: JSON.stringify({ queue_name: queueName })
      });
      if (!response.ok) {
        throw new Error(`Request to ${path} failed with status code ${response.status}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      this.dispatch(saveFinished(jobCategory, queueName));
      history.push('/routing/' + encodeURIComponent(jobCategory));
      this.asyncGetRouting(jobCategory);
    }
  }

  public async asyncDeleteRouting(jobCategory: string): Promise<void> {
    this.dispatch(deleteStarted(jobCategory));
    try {
      const path = '/api/routing/' + encodeURIComponent(jobCategory);
      const response: Response = await fetch(path, {
        method: 'DELETE'
      });
      if (!response.ok) {
        throw new Error(`Request to ${path} failed with status code ${response.status}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      this.dispatch(deleteFinished(jobCategory));
      history.push('/routings');
    }
  }

  public async asyncGetQueueNames(): Promise<void> {
    await new QueueListActionDispatcher(this.dispatch).asyncGetQueueList();
  }
}

interface Props extends RouteComponentProps<{jobCategory?: string}> {
  jobCategory?: string
}

const mapStateToProps: MapStateToPropsParam<{value: RoutingValue}, any> =
  (state: ReduxState, props: Props) => {
    const jobCategory = props.jobCategory || decode(props.match.params.jobCategory);
    const queueNames = Object.keys(state.queue.queues || {});
    const queueNamesLoaded = state.queue.queueListLoaded;
    if (jobCategory === undefined)
      return { value: {
        queueNames,
        queueNamesLoaded,
        loadingCount: 0,
        savingCount: 0
      } };
    return { jobCategory, value: {
      routing: state.routing.routings[jobCategory],
      queueNames,
      queueNamesLoaded,
      loadingCount: state.routing.loadingCount[jobCategory] || 0,
      savingCount:  state.routing.savingCount[jobCategory] || 0
    } };
  };

const mapDispatchToProps: MapDispatchToPropsParam<{actions: ActionDispatcher}, {}> =
  (dispatch: Dispatch<ReduxAction>) => ({actions: new ActionDispatcher(dispatch)});

export default connect(mapStateToProps, mapDispatchToProps)(RoutingView);
