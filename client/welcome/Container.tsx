import { Welcome, WelcomeValue } from './Welcome'
import { connect, MapStateToPropsParam } from 'react-redux'
import { ReduxState } from '../store'
import { RouteComponentProps } from 'react-router'

const mapStateToProps: MapStateToPropsParam<{value: WelcomeValue}, any> =
  (state: ReduxState, ownProps: RouteComponentProps<{params: string | undefined}>) => {
    return { value: {
      nodes: state.version.nodeVersions
    } };
  };

export default connect(mapStateToProps)(Welcome);
