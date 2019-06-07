import { FailedJob as FailedJobView } from './FailedJob'
import { connect, MapDispatchToPropsParam, MapStateToPropsParam } from 'react-redux'
import { Dispatch } from 'redux'
import { ReduxAction, ReduxState } from '../store'
import { FailedJobValue, FailedJob, failedJobRetrieved, fetchStarted, fetchFinished } from './module'
import { ActionDispatcher as FailedJobListActionDispatcher } from '../failed-job-list/Container'
import { RouteComponentProps } from 'react-router'
import JSON from 'json-bigint'
import { snakeToCamel } from '../util'
import { decode, pathQueueFailures } from '../path'
import { history } from '../Index'

export class ActionDispatcher {
  constructor(private dispatch: (action: ReduxAction) => void) {}

  public async asyncGetFailedJob(queueName: string, id: number): Promise<void> {
    this.dispatch(fetchStarted(queueName));
    try {
      const path = [ '/api/queue', encodeURIComponent(queueName), 'failed', id ].join('/');
      const response: Response = await fetch(path, {
        method: 'GET'
      });
      if (response.ok) {
        const json = JSON.parse(await response.text());
        const job = snakeToCamel(json);
        job.status = job.result.status.replace(/-failure$/, '');
        job.payload = json.payload;
        this.dispatch(failedJobRetrieved(queueName, job as FailedJob));
      } else {
        throw new Error(`Request to ${path} failed with status code ${response.status}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      this.dispatch(fetchFinished(queueName));
    }
  }

  public async asyncDeleteFailedJob(queueName: string, id: number): Promise<void> {
    await new FailedJobListActionDispatcher(this.dispatch).asyncDeleteFailedJob(queueName, id).then(() => history.push(pathQueueFailures(queueName)));
  }
}

interface Props extends RouteComponentProps<{queueName?: string, id?: string}> {
  queueName?: string
  id?: string
}

const mapStateToProps: MapStateToPropsParam<{value: FailedJobValue}, any, ReduxState> =
  (state: ReduxState, props: Props) => {
    const queueName = props.queueName || decode(props.match.params.queueName);
    if (queueName === undefined)
      return { value: { loadingCount: 0 } };
    const id = props.id || props.match.params.id;
    if (id === undefined)
      return { value: { loadingCount: 0 } };
    return { queueName, id, value: {
      job: (state.failedJob.byId[queueName] || {})[id+''],
      loadingCount: state.failedJob.loadingCount[queueName] || 0
    } };
  };

const mapDispatchToProps: MapDispatchToPropsParam<{actions: ActionDispatcher}, {}> =
  (dispatch: Dispatch<ReduxAction>) => ({actions: new ActionDispatcher(dispatch)});

export default connect(mapStateToProps, mapDispatchToProps)(FailedJobView);
