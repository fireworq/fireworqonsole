import { Credits } from './Credits'
import { connect, MapDispatchToPropsParam, MapStateToPropsParam } from 'react-redux'
import { Dispatch } from 'redux'
import { CreditsState, PackageInfo, creditsRetrieved, fetchStarted, fetchFinished } from './/module'
import { ReduxAction, ReduxState } from '../store'
import { RouteComponentProps } from 'react-router'
import JSON from 'json-bigint'

export class ActionDispatcher {
  constructor(private dispatch: (action: ReduxAction) => void) {}

  public async asyncGetCredits(): Promise<void> {
    this.dispatch(fetchStarted());
    try {
      const path = '/credits';
      const response: Response = await fetch(path, {
        method: 'GET'
      });
      if (response.ok) {
        const packages = JSON.parse(await response.text());
        this.dispatch(creditsRetrieved(packages as PackageInfo[]));
      } else {
        throw new Error(`Request to ${path} failed with status code ${response.status}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      this.dispatch(fetchFinished());
    }
  }
}

const mapStateToProps: MapStateToPropsParam<{value: CreditsState}, any, ReduxState> =
  (state: ReduxState, ownProps: RouteComponentProps<{params: string | undefined}>) => {
    return { value: state.credits };
  };

const mapDispatchToProps: MapDispatchToPropsParam<{actions: ActionDispatcher}, {}> =
  (dispatch: Dispatch<ReduxAction>) => ({actions: new ActionDispatcher(dispatch)});

export default connect(mapStateToProps, mapDispatchToProps)(Credits);
