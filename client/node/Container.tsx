import { Node as NodeView } from './Node'
import { connect, MapDispatchToPropsParam, MapStateToPropsParam } from 'react-redux'
import { Dispatch } from 'redux'
import { NodeValue, Node, nodeRetrieved, fetchStarted, fetchFinished } from './module'
import { ActionDispatcher as NodesActionDispatcher } from '../version-list/Container'
import { ReduxAction, ReduxState } from '../store'
import { RouteComponentProps } from 'react-router'
import JSON from 'json-bigint'
import { snakeToCamel } from '../util'

export class ActionDispatcher {
  constructor(protected dispatch: (action: ReduxAction) => void) {}

  public async asyncGetQueueNode(queueName: string): Promise<void> {
    this.dispatch(fetchStarted(queueName));
    try {
      const path = '/api/queue/' + encodeURIComponent(queueName) + '/node';
      const response: Response = await fetch(path, {
        method: 'GET'
      });
      if (response.ok) {
        const node = snakeToCamel(JSON.parse(await response.text()));
        this.dispatch(nodeRetrieved(queueName, node as Node));
      } else {
        throw new Error(`Request to ${path} failed with status code ${response.status}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      this.dispatch(fetchFinished(queueName));
    }
  }

  public async asyncGetNodes(): Promise<void> {
    await new NodesActionDispatcher(this.dispatch).asyncGetNodeVersions();
  }
}

interface Props extends RouteComponentProps<{params?: string}> {
  queueName?: string
}

const mapStateToProps: MapStateToPropsParam<{value: NodeValue}, any, ReduxState> =
  (state: ReduxState, props: Props) => {
    const ipToNode = state.version.ipToNode;
    const nodesLoaded = state.version.nodesLoaded || state.version.loadingCount > 0;
    if (props.queueName === undefined)
      return { value: { ipToNode, nodesLoaded, loadingCount: 0 } };
    return { value: {
      ipToNode,
      nodesLoaded,
      node: state.node.nodes[props.queueName],
      loadingCount: state.node.loadingCount[props.queueName] || 0
    } };
  };

const mapDispatchToProps: MapDispatchToPropsParam<{actions: ActionDispatcher}, {}> =
  (dispatch: Dispatch<ReduxAction>) => ({actions: new ActionDispatcher(dispatch)});

export default connect(mapStateToProps, mapDispatchToProps)(NodeView);
