import { SettingList } from './SettingList'
import { connect, MapDispatchToPropsParam, MapStateToPropsParam } from 'react-redux'
import { Dispatch } from 'redux'
import { SettingListValue, NodeSettings, nodeSettingsRetrieved, fetchStarted, fetchFinished } from '../setting/module'
import { ActionDispatcher as NodesActionDispatcher } from '../version-list/Container'
import { ReduxAction, ReduxState } from '../store'
import { RouteComponentProps } from 'react-router'
import JSON from 'json-bigint'

export class ActionDispatcher {
  constructor(private dispatch: (action: ReduxAction) => void) {}

  public async asyncGetNodeSettings(): Promise<void> {
    this.dispatch(fetchStarted());
    try {
      const path = '/api/settings';
      const response: Response = await fetch(path, {
        method: 'GET'
      });
      if (response.ok) {
        const settings = JSON.parse(await response.text());
        this.dispatch(nodeSettingsRetrieved(settings as NodeSettings));
      } else {
        throw new Error(`Request to ${path} failed with status code ${response.status}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      this.dispatch(fetchFinished());
    }
  }

  public async asyncGetNodes(): Promise<void> {
    await new NodesActionDispatcher(this.dispatch).asyncGetNodeVersions();
  }
}

const mapStateToProps: MapStateToPropsParam<{value: SettingListValue}, any, ReduxState> =
  (state: ReduxState, ownProps: RouteComponentProps<{params: string | undefined}>) => {
    return { value: {
      ...state.setting,
      nodes: state.version.nodeVersions,
      nodesLoaded: state.version.nodesLoaded || state.version.loadingCount > 0
    } };
  };

const mapDispatchToProps: MapDispatchToPropsParam<{actions: ActionDispatcher}, {}> =
  (dispatch: Dispatch<ReduxAction>) => ({actions: new ActionDispatcher(dispatch)});

export default connect(mapStateToProps, mapDispatchToProps)(SettingList);
