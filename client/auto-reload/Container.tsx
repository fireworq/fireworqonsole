import { AutoReload } from './AutoReload'
import { connect, MapDispatchToPropsParam, MapStateToPropsParam } from 'react-redux'
import { Dispatch } from 'redux'
import { autoReloadToggled } from './module'
import { ReduxAction, ReduxState } from '../store'
import { RouteComponentProps } from 'react-router'

export class ActionDispatcher {
  constructor(private dispatch: (action: ReduxAction) => void) {}

  public toggle(active: boolean) {
    this.dispatch(autoReloadToggled(active));
  }
}

const mapStateToProps: MapStateToPropsParam<{active: boolean}, any, ReduxState> =
  (state: ReduxState, props: RouteComponentProps<{params?: string}>) => {
    return {active: state.autoReload.active};
  };

const mapDispatchToProps: MapDispatchToPropsParam<{actions: ActionDispatcher}, {}> =
  (dispatch: Dispatch<ReduxAction>) => ({actions: new ActionDispatcher(dispatch)});

export default connect(mapStateToProps, mapDispatchToProps)(AutoReload);
