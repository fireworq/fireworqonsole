import { FailedJobList as FailedJobListView } from './FailedJobList'
import { connect, MapDispatchToPropsParam, MapStateToPropsParam } from 'react-redux'
import { Dispatch } from 'redux'
import { ReduxAction, ReduxState } from '../store'
import { FailedJobListValue, FailedJobList, failedJobListRetrieved, failedJobDeleted, fetchStarted, fetchFinished } from '../failed-job/module'
import { RouteComponentProps } from 'react-router'
import { snakeToCamel } from '../util'
import { decode } from '../path'

const JobListChunkSize: number = 30

export class ActionDispatcher {
  constructor(private dispatch: (action: ReduxAction) => void) {}

  public async asyncGetFailedJobs(queueName: string, cursor?: string): Promise<void> {
    this.dispatch(fetchStarted(queueName));
    try {
      const path = [ '/api/queue', encodeURIComponent(queueName), 'failed' ].join('/');
      let query = '?limit=' + JobListChunkSize;
      if (typeof cursor !== 'undefined') {
        query += '&cursor=' + encodeURIComponent(cursor);
      }
      const response: Response = await fetch(path + query, {
        method: 'GET'
      });
      if (response.ok) {
        const json = await response.json();
        const jobs = snakeToCamel(json);
        jobs.jobs = json['failed_jobs'].map((json: any) => {
          const job = snakeToCamel(json);
          job.status = job.result.status.replace(/-failure$/, '');
          job.payload = json.payload;
          return job;
        });
        this.dispatch(failedJobListRetrieved(queueName, cursor, jobs as FailedJobList));
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
    try {
      const path = '/api/queue/' + encodeURIComponent(queueName) + '/failed/' + id;
      const response: Response = await fetch(path, {
        method: 'DELETE'
      });
      if (response.ok) {
        this.dispatch(failedJobDeleted(queueName, id));
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

const mapStateToProps: MapStateToPropsParam<{value: FailedJobListValue}, any> =
  (state: ReduxState, props: Props) => {
    const queueName = props.queueName || decode(props.match.params.queueName);
    if (queueName === undefined)
      return { value: { loadingCount: 0 } };
    return { queueName, value: {
      jobs: state.failedJob.jobs[queueName],
      loadingCount: state.failedJob.loadingCount[queueName] || 0
    } };
  };

const mapDispatchToProps: MapDispatchToPropsParam<{actions: ActionDispatcher}, {}> =
  (dispatch: Dispatch<ReduxAction>) => ({actions: new ActionDispatcher(dispatch)});

export default connect(mapStateToProps, mapDispatchToProps)(FailedJobListView);
