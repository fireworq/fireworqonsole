import { Stats as StatsView } from './Stats'
import { connect, MapDispatchToPropsParam, MapStateToPropsParam } from 'react-redux'
import { Dispatch } from 'redux'
import { Stats, StatsValue, statsRetrieved, fetchStarted, fetchFinished } from './module'
import { ReduxAction, ReduxState } from '../store'
import { RouteComponentProps } from 'react-router'
import { snakeToCamel } from '../util'

export class ActionDispatcher {
  constructor(protected dispatch: (action: ReduxAction) => void) {}

  public async asyncGetStats(queueName: string): Promise<void> {
    this.dispatch(fetchStarted(queueName));
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
    } finally {
      this.dispatch(fetchFinished(queueName));
    }
  }
}

interface Props extends RouteComponentProps<{params?: string}> {
  queueName?: string
}

const mapStateToProps: MapStateToPropsParam<{value: StatsValue, autoReload?: boolean}, any> =
  (state: ReduxState, props: Props) => {
    if (props.queueName === undefined)
      return { value: { loadingCount: 0 } };
    return {
      value: {
        stats: state.stats.stats[props.queueName],
        loadingCount: state.stats.loadingCount[props.queueName] || 0
      },
      autoReload: state.autoReload.active
    };
  };

const mapDispatchToProps: MapDispatchToPropsParam<{actions: ActionDispatcher}, {}> =
  (dispatch: Dispatch<ReduxAction>) => ({actions: new ActionDispatcher(dispatch)});

export default connect(mapStateToProps, mapDispatchToProps)(StatsView);
