import * as React from 'react'
import { Link } from 'react-router-dom'
import { pathRouting, pathRoutingEdit } from '../path'
import { RoutingState } from '../routing/module'
import { ActionDispatcher } from './Container'

interface Props {
  value: RoutingState
  actions: ActionDispatcher
}

export class RoutingList extends React.Component<Props, {}> {
  componentDidMount() {
    if (this.props.value.routingListLoaded) return;
    this.props.actions.asyncGetRoutingList();
  }

  render() {
    const routings = Object.values(this.props.value.routings).sort((a, b) => {
      return a.jobCategory.localeCompare(b.jobCategory);
    }).map((routing) => {
      const jobCategory = routing.jobCategory;
      const deleteRouting = (e: React.SyntheticEvent<any>) => {
        if (confirm("Are you sure you want to delete the routing for '" + jobCategory + "'?"))
          this.props.actions.asyncDeleteRouting(jobCategory)
        e.stopPropagation();
        e.preventDefault();
      };

      return (
        <tr className="routing" key={'routing-item-' + jobCategory}>
          <td><Link to={pathRouting(jobCategory)}><div className="routing-item">
            <div className="job-category">{jobCategory}</div>
          </div></Link></td>

          <td><Link to={pathRoutingEdit(jobCategory)}>
            <div className="queue-name">{routing.queueName}</div>
          </Link></td>

          <td className="actions">
            <Link className="edit" to={pathRoutingEdit(jobCategory)} />
            <Link className="delete" to="." onClick={deleteRouting} />
          </td>
        </tr>
      );
    });
    const noRouting =
      !routings.length && this.props.value.listLoadingCount === 0;
    return (
      <div className="routing-list">
        <h2>Routings</h2>

        {(this.props.value.listLoadingCount === 0) ? null :
         <div className="loader ball-clip-rotate"><div /></div>}

        {noRouting ? (
           <div className="routing none">(no routing)</div>
        ) : (
           <table key="routing-item-list">
             <thead><tr className="routing head"><th>JobCategory</th><th>Queue Name</th><th /></tr></thead>
             <tbody>
               {routings}
             </tbody>
           </table>
        )}

        <form className="new-routing" action="#" onSubmit={(e) => {
            const formData = new FormData(e.target as HTMLFormElement);
            const jobCategory = formData.get('job-category') as string || '';
            this.props.actions.newRouting(jobCategory);
            e.stopPropagation()
            e.preventDefault()
        }}>
          <label><span className="label-text" role="button">New</span>
            <input className="new-job-category" name="job-category" defaultValue="" placeholder=" job category" />
            <button type="submit">Add</button>
          </label>
        </form>
      </div>
    );
  }
}
