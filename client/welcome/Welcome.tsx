import * as React from 'react'
import { Link } from 'react-router-dom'
import VersionList from '../version-list/Container'
import { NodeVersion } from '../version/module'

export interface WelcomeValue {
  nodes: NodeVersion[]
}

interface Props {
  value: WelcomeValue
}

export class Welcome extends React.Component<Props, {}> {
  render() {
    const nodeDefined = this.props.value.nodes.length > 0;
    const nodeInstruction = nodeDefined ? (
      <p>The following nodes are managed on this console now.</p>
    ) : (
      <p>No node is defined now.  Add a node to start!</p>
    )
    return (
      <div className="welcome">
        <h2>Welcome to Fireworq!</h2>

        <h3>Setup</h3>
        <p>You can manage multiple Fireworq nodes in a cluster on this console.  You should add the all nodes in the same cluster.</p>
        {nodeInstruction}

        <VersionList />

        <h3>Usage</h3>

        <p>The following list is what you can do on this console.</p>
        <dl>
          <dt><Link to="/nodes">Nodes</Link></dt>
          <dd>Manages the node list and their settings.  It is useful to check if the all nodes have the same settings.</dd>
          <dt><Link to="/queues" >Queues</Link></dt>
          <dd>Manages the queue list.  It is useful to check if Fireworq is working and jobs in a queue are processed successfully.  It also provides job list and failed job list to investigate what is going on.</dd>
          <dt><Link to="/routings" >Routings</Link></dt>
          <dd>Manages the job routing rules.</dd>
          <dt><Link to="/job">New Job</Link></dt>
          <dd>Creates a new job and pushes it to the job queue.</dd>
        </dl>
      </div>
    );
  }
}
