import { JobList as JobListView } from './JobList'
import { connect, MapDispatchToPropsParam, MapStateToPropsParam } from 'react-redux'
import { Dispatch } from 'redux'
import { ReduxAction, ReduxState } from '../store'
import { JobListValue, JobList, jobListRetrieved, jobDeleted, fetchStarted, fetchFinished } from '../job/module'
import { RouteComponentProps } from 'react-router'
import JSON from 'json-bigint'
import { snakeToCamel } from '../util'
import { decode } from '../path'

const JobListChunkSize: number = 30

export class ActionDispatcher {
  constructor(private dispatch: (action: ReduxAction) => void) {}

  public async asyncGetJobs(queueName: string, partition: string, cursor?: string): Promise<void> {
    this.dispatch(fetchStarted(queueName, partition));
    try {
      const path = [ '/api/queue', encodeURIComponent(queueName), partition ].join('/');
      let query = '?limit=' + JobListChunkSize;
      if (typeof cursor !== 'undefined') {
        query += '&cursor=' + encodeURIComponent(cursor);
      }
      const response: Response = await fetch(path + query, {
        method: 'GET'
      });
      if (response.ok) {
        const json = JSON.parse(await response.text());
        const jobs = snakeToCamel(json);
        jobs.jobs = json.jobs.map((json: any) => {
          const job = snakeToCamel(json);
          job.payload = json.payload;
          return job;
        });
        this.dispatch(jobListRetrieved(queueName, partition, cursor, jobs as JobList));
      } else {
        throw new Error(`Request to ${path} failed with status code ${response.status}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      this.dispatch(fetchFinished(queueName, partition));
    }
  }

  public async asyncDeleteJob(queueName: string, id: number): Promise<void> {
    try {
      const path = '/api/queue/' + encodeURIComponent(queueName) + '/job/' + id;
      const response: Response = await fetch(path, {
        method: 'DELETE'
      });
      if (response.ok) {
        this.dispatch(jobDeleted(queueName, id));
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

const mapStateToProps: MapStateToPropsParam<{value: JobListValue}, any> =
  (state: ReduxState, props: Props) => {
    const queueName = props.queueName || decode(props.match.params.queueName);
    if (queueName === undefined)
      return { value: { loadingCount: 0, partitionLoadingCount: {} } };
    return { queueName, value: {
      jobs: state.job.jobs[queueName],
      loadingCount: state.job.loadingCount[queueName] || 0,
      partitionLoadingCount: state.job.partitionLoadingCount[queueName] || {}
    } };
  };

const mapDispatchToProps: MapDispatchToPropsParam<{actions: ActionDispatcher}, {}> =
  (dispatch: Dispatch<ReduxAction>) => ({actions: new ActionDispatcher(dispatch)});

export default connect(mapStateToProps, mapDispatchToProps)(JobListView);
