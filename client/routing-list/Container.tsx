import { RoutingList as RoutingListView } from './RoutingList'
import { connect, MapDispatchToPropsParam, MapStateToPropsParam } from 'react-redux'
import { Dispatch } from 'redux'
import { RoutingState, RoutingList, routingListRetrieved, listFetchStarted, listFetchFinished } from '../routing/module'
import { ActionDispatcher as RoutingActionDispatcher } from '../routing/Container'
import { ReduxAction, ReduxState } from '../store'
import { RouteComponentProps } from 'react-router'
import JSON from 'json-bigint'
import { snakeToCamel } from '../util'
import { history } from '../Index'

export class ActionDispatcher {
  constructor(private dispatch: (action: ReduxAction) => void) {}

  public async asyncGetRoutingList(): Promise<void> {
    this.dispatch(listFetchStarted());
    try {
      const path = '/api/routings';
      const response: Response = await fetch(path, {
        method: 'GET'
      });
      if (response.ok) {
        const routings = snakeToCamel(JSON.parse(await response.text()));

        this.dispatch(routingListRetrieved(routings.reduce((r: any, routing: any) => {
          r[routing.jobCategory] = routing;
          return r;
        }, {}) as RoutingList));
      } else {
        throw new Error(`Request to ${path} failed with status code ${response.status}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      this.dispatch(listFetchFinished());
    }
  }

  public newRouting(jobCategory: string) {
    history.push('/routing/' + encodeURIComponent(jobCategory) + '/edit');
  }

  public async asyncDeleteRouting(jobCategory: string): Promise<void> {
    await new RoutingActionDispatcher(this.dispatch).asyncDeleteRouting(jobCategory);
  }
}

const mapStateToProps: MapStateToPropsParam<{value: RoutingState}, any> =
  (state: ReduxState, props: RouteComponentProps<{params?: string}>) => {
    return { value: state.routing };
  };

const mapDispatchToProps: MapDispatchToPropsParam<{actions: ActionDispatcher}, {}> =
  (dispatch: Dispatch<ReduxAction>) => ({actions: new ActionDispatcher(dispatch)});

export default connect(mapStateToProps, mapDispatchToProps)(RoutingListView);
