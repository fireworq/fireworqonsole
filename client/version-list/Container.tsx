import { VersionList } from './VersionList'
import { connect, MapDispatchToPropsParam, MapStateToPropsParam } from 'react-redux'
import { Dispatch } from 'redux'
import { VersionState, NodeVersion, consoleVersionRetrieved, nodeVersionsRetrieved, fetchStarted, fetchFinished } from '../version/module'
import { ReduxAction, ReduxState } from '../store'
import { RouteComponentProps } from 'react-router'
import JSON from 'json-bigint'

export class ActionDispatcher {
  constructor(private dispatch: (action: ReduxAction) => void) {}

  public async asyncGetConsoleVersion(): Promise<void> {
    this.dispatch(fetchStarted());
    try {
      const path = '/version';
      const response: Response = await fetch(path, {
        method: 'GET'
      });
      if (response.ok) {
        const version = await response.text();
        this.dispatch(consoleVersionRetrieved(version));
      } else {
        throw new Error(`Request to ${path} failed with status code ${response.status}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      this.dispatch(fetchFinished());
    }
  }

  public async asyncGetNodeVersions(): Promise<void> {
    this.dispatch(fetchStarted());
    try {
      const path = '/version';
      const response: Response = await fetch(path, {
        method: 'GET'
      });
      if (response.ok) {
        const versions = JSON.parse(await response.text());
        this.dispatch(nodeVersionsRetrieved(versions as NodeVersion[]));
      } else {
        throw new Error(`Request to ${path} failed with status code ${response.status}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      this.dispatch(fetchFinished());
    }
  }

  public async asyncPutNode(url: string): Promise<void> {
    try {
      const path = '/api/node/' + encodeURIComponent(url);
      const response: Response = await fetch(path, {
        method: 'PUT'
      });
      if (!response.ok) {
        throw new Error(`Request to ${path} failed with status code ${response.status}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      this.asyncGetNodeVersions();
    }
  }

  public async asyncDeleteNode(url: string): Promise<void> {
    try {
      const path = '/api/node/' + encodeURIComponent(url);
      const response: Response = await fetch(path, {
        method: 'DELETE'
      });
      if (!response.ok) {
        throw new Error(`Request to ${path} failed with status code ${response.status}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      this.asyncGetNodeVersions();
    }
  }
}

const mapStateToProps: MapStateToPropsParam<{value: VersionState}, any, ReduxState> =
  (state: ReduxState, ownProps: RouteComponentProps<{params: string | undefined}>) => {
    return { value: state.version };
  };

const mapDispatchToProps: MapDispatchToPropsParam<{actions: ActionDispatcher}, {}> =
  (dispatch: Dispatch<ReduxAction>) => ({actions: new ActionDispatcher(dispatch)});

export default connect(mapStateToProps, mapDispatchToProps)(VersionList);
