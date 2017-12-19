import * as React from 'react'
import { NodeValue } from './module'
import { ActionDispatcher } from './Container'

interface Props {
  queueName?: string
  value: NodeValue
  actions: ActionDispatcher
}

export class Node extends React.Component<Props, {}> {
  componentDidMount() {
    const queueName = this.props.queueName;
    if (queueName === undefined) return;
    if (this.props.value.node !== undefined) return;

    this.props.actions.asyncGetQueueNode(queueName);

    if (this.props.value.nodesLoaded) return;
    this.props.actions.asyncGetNodes();
  }

  render() {
    const queueName = this.props.queueName;
    if (queueName === undefined)
      return null;

    if (this.props.value.loadingCount !== 0)
      return <div className="loader ball-clip-rotate"><div /></div>;

    const node = this.props.value.node;
    if (node === undefined)
      return <div className="node none" key={'node-' + queueName}>(no node)</div>;

    const host = this.props.value.ipToNode[node.host] || node.host;

    return (
      <div className="node" key={'node-' + queueName}>
        <span className="host" title={node.host}>{host}</span>
        <span className="id">#{node.id}</span>
      </div>
    );
  }
}
