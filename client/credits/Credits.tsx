import * as React from 'react'
import { CreditsState, PackageInfo } from './module'
import { ActionDispatcher } from './Container'

interface Props {
  value: CreditsState
  actions: ActionDispatcher
}

export class Credits extends React.Component<Props, {}> {
  componentDidMount() {
    if (this.props.value.packages.length === 0)
      this.props.actions.asyncGetCredits();
  }

  renderPackageInfo(pkg: PackageInfo) {
    const node = (
      <li className="package" key={pkg.package} onClick={(e) => {
          e.currentTarget.classList.toggle('open');
      }}>
        <h4><a href={pkg.url} onClick={(e) => e.stopPropagation()}>{pkg.package}</a></h4>
        <pre>{pkg.license}</pre>
      </li>
    );
    return node;
  }

  render() {
    let content = <span className="nothing">(no credits)</span>;

    if (this.props.value.loadingCount !== 0) {
      content = <div className="loader ball-clip-rotate"><div /></div>
    } else if (this.props.value.packages.length !== 0) {
      content = (
        <ul>
          {this.props.value.packages.map((pkg) => this.renderPackageInfo(pkg))}
        </ul>
      );
    }
    return (
      <div className="credits">
        <h3>Credits</h3>

        {content}
      </div>
    );
  }
}
