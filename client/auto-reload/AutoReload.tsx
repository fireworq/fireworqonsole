import * as React from 'react'
import { ActionDispatcher } from './Container'

interface Props {
  active: boolean
  actions: ActionDispatcher
}

export class AutoReload extends React.Component<Props, {}> {
  render() {
    return (
      <div className="auto-reload">
        <label title="Auto reload">
          <span>AUTO</span>
          <div className={'switch' + (this.props.active ? ' active' : '')}>
            <input type="checkbox"
                   value={this.props.active ? 'checked' : ''}
                   onChange={(e) => {
                       this.props.actions.toggle(e.target.checked);
                   }} />
          </div>
        </label>
      </div>
    );
  }
}
