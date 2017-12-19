import { Job as JobView } from './Job'
import { connect, MapDispatchToPropsParam, MapStateToPropsParam } from 'react-redux'
import { Dispatch } from 'redux'
import { ReduxAction, ReduxState } from '../store'
import { JobValue, Job, jobRetrieved, fetchStarted, fetchFinished } from './module'
import { ActionDispatcher as JobListActionDispatcher } from '../job-list/Container'
import { RouteComponentProps } from 'react-router'
import { snakeToCamel } from '../util'
import { decode, pathQueueJobs } from '../path'
import { history } from '../Index'

export class ActionDispatcher {
  constructor(private dispatch: (action: ReduxAction) => void) {}

  public async asyncGetJob(queueName: string, id: number): Promise<void> {
    this.dispatch(fetchStarted(queueName, 'job'));
    try {
      const path = [ '/api/queue', encodeURIComponent(queueName), 'job', id ].join('/');
      const response: Response = await fetch(path, {
        method: 'GET'
      });
      if (response.ok) {
        const json = await response.json();
        const job = snakeToCamel(json);
        job.payload = json.payload;
        this.dispatch(jobRetrieved(queueName, job as Job));
      } else {
        throw new Error(`Request to ${path} failed with status code ${response.status}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      this.dispatch(fetchFinished(queueName, 'job'));
    }
  }

  public async asyncDeleteJob(queueName: string, id: number): Promise<void> {
    await new JobListActionDispatcher(this.dispatch).asyncDeleteJob(queueName, id).then(() => history.push(pathQueueJobs(queueName)));
  }
}

interface Props extends RouteComponentProps<{queueName?: string, id?: number}> {
  queueName?: string
  id?: number
}

const mapStateToProps: MapStateToPropsParam<{value: JobValue}, any> =
  (state: ReduxState, props: Props) => {
    const queueName = props.queueName || decode(props.match.params.queueName);
    if (queueName === undefined)
      return { value: { loadingCount: 0 } };
    const id = props.id || props.match.params.id;
    if (id === undefined)
      return { value: { loadingCount: 0 } };
    return { queueName, id, value: {
      job: (state.job.byId[queueName] || {})[id+''],
      loadingCount: state.job.loadingCount[queueName] || 0
    } };
  };

const mapDispatchToProps: MapDispatchToPropsParam<{actions: ActionDispatcher}, {}> =
  (dispatch: Dispatch<ReduxAction>) => ({actions: new ActionDispatcher(dispatch)});

export default connect(mapStateToProps, mapDispatchToProps)(JobView);
