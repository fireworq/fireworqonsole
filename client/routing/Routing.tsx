import * as React from 'react'
import { Link } from 'react-router-dom'
import { pathRoutingEdit } from '../path'
import { RoutingValue } from './module'
import { ActionDispatcher } from './Container'

interface Props {
  jobCategory?: string
  editing: boolean
  value: RoutingValue
  actions: ActionDispatcher
}

export class Routing extends React.Component<Props, {}> {
  componentDidMount() {
    const jobCategory = this.props.jobCategory;
    if (jobCategory === undefined) return;

    if (this.props.value.routing === undefined)
      this.props.actions.asyncGetRouting(jobCategory);

    if (!this.props.value.queueNamesLoaded)
      this.props.actions.asyncGetQueueNames();
  }

  render() {
    const jobCategory = this.props.jobCategory;
    if (jobCategory === undefined)
      return null;

    let routing = this.props.value.routing;
    const noRouting = routing === undefined && !this.props.editing;
    if (routing === undefined) {
      routing = {
        jobCategory: jobCategory,
        queueName: ''
      };
    }

    const deleteRouting = (e: React.SyntheticEvent<any>) => {
      if (confirm("Are you sure you want to delete the routing for '" + jobCategory + "'?"))
        this.props.actions.asyncDeleteRouting(jobCategory)
      e.stopPropagation();
      e.preventDefault();
    };

    let routingInfo = noRouting ? <div className="routing none">(no routing)</div> : (
      <div key={'routing-' + jobCategory}>
        <dl className="routing">
          <dt>Job Category</dt>
          <dd className="job-category" onClick={deleteRouting}>{jobCategory}</dd>

          <dt>Queue Name</dt>
          <dd className="queue-name config-value"><Link to={pathRoutingEdit(jobCategory)}>
            {this.props.editing ? (
               <select name="queue-name" defaultValue={routing.queueName}>
                 {this.props.value.queueNames.map((queueName) => {
                    return (
                      <option value={queueName} key={'routing-' + jobCategory + '-' + queueName}>{queueName}</option>
                    );
                 })}
               </select>
            ) : routing.queueName}
          </Link></dd>
        </dl>
        {this.props.editing ? null : (
           <div className="actions">
             <Link className="edit" to={pathRoutingEdit(jobCategory)} />
             <Link className="delete" to="." onClick={deleteRouting} />
           </div>
        )}
      </div>
    );

    if (this.props.value.loadingCount !== 0) {
      routingInfo = <div className="loader ball-clip-rotate"><div /></div>;
    }

    let submitButton = <button type="submit">Save</button>;
    if (this.props.value.savingCount !== 0) {
      submitButton = <div className="loader ball-clip-rotate"><div /></div>;
    }

    return (
      <div>
        <h2>Routing</h2>
        {this.props.editing ? (
           <form className="routing-edit" action="#" onSubmit={(e) => {
               e.stopPropagation();
               e.preventDefault();
               if (this.props.value.savingCount !== 0) return;

               const formData = new FormData(e.target as HTMLFormElement);
               this.props.actions.asyncPutRouting(jobCategory, formData.get('queue-name') as string || '');
           }}>
             {routingInfo}
             {submitButton}
           </form>
        ) : routingInfo}
      </div>
    );
  }
}
