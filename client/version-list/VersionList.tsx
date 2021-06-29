import * as React from 'react'
import { Link } from 'react-router-dom'
import { VersionState, NodeVersion } from '../version/module'
import { ActionDispatcher } from './Container'

interface Props {
  showConsoleVersion?: boolean
  hideNodeVersions?: boolean
  value: VersionState
  actions: ActionDispatcher
}

export class VersionList extends React.Component<Props, {}> {
  componentDidMount() {
    if (this.props.showConsoleVersion === true &&
        this.props.value.consoleVersion === "") {
      this.props.actions.asyncGetConsoleVersion();
    }
    if (this.props.value.nodeVersions.length === 0) {
      this.props.actions.asyncGetNodeVersions();
    }
  }

  renderConsoleVersion(v: string) {
    if (this.props.showConsoleVersion !== true) return [];
    if (v === "") return [];
    return [
      <dt key={'Console'}><Link to="/about">Console</Link></dt>,
      <dd key={'Console-version'} className="version valid">{this.props.value.consoleVersion}</dd>
    ];
  }

  renderNodeVersion(v: NodeVersion) {
    if (this.props.hideNodeVersions === true) return [];

    let className='version';
    if (v.valid) {
      className += ' valid';
    } else {
      className += ' invalid';
    }

    return [
      <dt key={v.node} title={v.ips[0] || ''} className="version node" onClick={() => {
          if (confirm('Are you sure you want to delete node \'' + v.node + '\' from this console?'))
            this.props.actions.asyncDeleteNode(v.url);
      }}>{v.node}</dt>,
      <dd key={v.node + '-version'} className={className}>{v.version}</dd>
    ];
  }

  render() {
    const nodeVersions = this.props.value.nodeVersions;
    const noNode = !nodeVersions.length && this.props.value.loadingCount === 0;

    return (
      <div>
        {(this.props.value.loadingCount === 0) ? null :
         <div className="loader ball-clip-rotate"><div /></div>}
        <dl className="versions">
          {this.renderConsoleVersion(this.props.value.consoleVersion)}
          {nodeVersions.sort((a, b) => {
             return a.node.localeCompare(b.node);
          }).reduce((r, v) => {
             return r.concat(this.renderNodeVersion(v));
          }, [] as JSX.Element[])}
        </dl>
        {noNode ? (
           <div className="versions none">(no node)</div>
        ) : null}
        {this.props.hideNodeVersions === true ? null : (
           <form className="new-node" action="#" onSubmit={(e) => {
               const formData = new FormData(e.target as HTMLFormElement);
               const url = formData.get('node-url') as string || '';
               this.props.actions.asyncPutNode(url);
               e.stopPropagation()
               e.preventDefault()
           }}>
             <label><span className="label-text" role="button">New</span>
               <input className="new-node-url" name="node-url" defaultValue="" placeholder=" http://localhost:8080" />
               <button type="submit">Add</button>
             </label>
           </form>
        )}
      </div>
    );
  }
}
