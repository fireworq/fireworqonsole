import { NewJob as NewJobView } from './NewJob'
import { connect, MapDispatchToPropsParam, MapStateToPropsParam } from 'react-redux'
import { Dispatch } from 'redux'
import { ReduxAction, ReduxState } from '../store'
import { saveStarted, saveFinished } from '../job/module'
import { RouteComponentProps } from 'react-router'
import { snakeToCamel } from '../util'
import { pathQueueJobs } from '../path'
import { history } from '../Index'

export class ActionDispatcher {
  constructor(private dispatch: (action: ReduxAction) => void) {}

  public async asyncPutNewJob(job: any, callback?: () => void): Promise<void> {
    this.dispatch(saveStarted());
    let queueName: string | undefined;
    try {
      const path = '/api/job/' + encodeURIComponent(job.category);
      const response: Response = await fetch(path, {
        method: 'POST',
        body: JSON.stringify(job)
      });
      if (response.ok) {
        const job = snakeToCamel(await response.json());
        queueName = job.queueName as string;
        this.dispatch(saveFinished(queueName));
        if (callback !== undefined) callback();
        history.push(pathQueueJobs(queueName));
      } else {
        this.dispatch(saveFinished(undefined));
        throw new Error(`Request to ${path} failed with status code ${response.status}`);
      }
    } catch (err) {
      console.error(err);
    }
  }
}

const mapStateToProps: MapStateToPropsParam<{savingCount: number}, any> =
  (state: ReduxState, ownProps: RouteComponentProps<{params: string | undefined}>) => {
    return { savingCount: state.job.savingCount };
  };

const mapDispatchToProps: MapDispatchToPropsParam<{actions: ActionDispatcher}, {}> =
  (dispatch: Dispatch<ReduxAction>) => ({actions: new ActionDispatcher(dispatch)});

export default connect(mapStateToProps, mapDispatchToProps)(NewJobView);
