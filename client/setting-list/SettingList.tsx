import * as React from 'react'
import { SettingListValue } from '../setting/module'
import { ActionDispatcher } from './Container'

interface Props {
  value: SettingListValue
  actions: ActionDispatcher
}

export class SettingList extends React.Component<Props, {}> {
  componentDidMount() {
    if (!this.props.value.nodesLoaded) {
      this.props.actions.asyncGetNodes();
    }
    if (Object.keys(this.props.value.nodeSettings).length === 0) {
      this.props.actions.asyncGetNodeSettings();
    }
  }

  render() {
    const nodeIp = this.props.value.nodes.reduce(((r, v) => {
      r[v.node] = v.ips[0] || '';
      return r;
    }), {} as { [key:string]: string });
    const nodes = this.props.value.nodes.map((v) => v.node).sort();
    const settings = Object.keys(this.props.value.nodeSettings).sort().map((k) => {
      const nodeValues = this.props.value.nodeSettings[k];
      const value = Object.values(nodeValues)[0];

      if (Object.values(nodeValues).every((v) => v === value) &&
          nodes.every((node) => nodeValues[node] !== undefined)) {
        return [
          <dt key={'setting-key-' + k} className="setting-key">{k}</dt>,
          value ? (
            <dd key={'setting-value-' + k} className="setting-value">{value}</dd>
          ) : (
            <dd key={'setting-value-' + k} className="setting-value none">(no value)</dd>
          )
        ];
      } else {
        const values = nodes.reduce((list, node) => {
          const nodeValue = nodeValues[node] ? (
            <dd key={'setting-value-' + k + '-' + node} className="setting-value">{nodeValues[node]}</dd>
          ) : (
            <dd key={'setting-value-' + k + '-' + node} className="setting-value none">(no value)</dd>
          );
          return list.concat([
            <dt key={'setting-key-' + k + '-' + node} className="node" title={nodeIp[node] || ''}>{node}</dt>,
            nodeValue
          ]);
        }, [] as JSX.Element[]);
        return [
          <dt key={'setting-key-' + k} className="setting-key multi-values">{k}</dt>,
          <dd key={'setting-value-' + k} className="setting-value">
            <dl className="setting-diff">
              {values}
            </dl>
          </dd>
        ];
      }
    });
    const noSetting = !settings.length && this.props.value.loadingCount === 0;

    return (
      <div>
        {(this.props.value.loadingCount === 0) ? null :
         <div className="loader ball-clip-rotate"><div /></div>}
        {noSetting ? <div className="settings none">(no setting)</div> : (
          <dl className="settings">
            {settings}
          </dl>
        )}
      </div>
    );
  }
}
