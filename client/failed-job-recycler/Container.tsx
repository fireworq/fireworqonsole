import { FailedJobRecycler as FailedJobRecyclerView } from './FailedJobRecycler'
import { connect, MapDispatchToPropsParam, MapStateToPropsParam } from 'react-redux'
import { Dispatch } from 'redux'
import { ReduxAction, ReduxState } from '../store'
import { FailedJobValue } from '../failed-job/module'
import { ActionDispatcher as FailedJobActionDispatcher } from '../failed-job/Container'
import { ActionDispatcher as FailedJobListActionDispatcher } from '../failed-job-list/Container'
import { RouteComponentProps } from 'react-router'
import { decode } from '../path'

export class ActionDispatcher {
  constructor(private dispatch: (action: ReduxAction) => void) {}

  public async asyncGetFailedJob(queueName: string, id: number): Promise<void> {
    await new FailedJobActionDispatcher(this.dispatch).asyncGetFailedJob(queueName, id);
  }

  public async asyncDeleteFailedJob(queueName: string, id: number): Promise<void> {
    await new FailedJobListActionDispatcher(this.dispatch).asyncDeleteFailedJob(queueName, id);
  }
}

interface Props extends RouteComponentProps<{queueName?: string, id?: number}> {
  queueName?: string
  id?: number
}

const mapStateToProps: MapStateToPropsParam<{value: FailedJobValue}, any> =
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

export default connect(mapStateToProps, mapDispatchToProps)(FailedJobRecyclerView);
