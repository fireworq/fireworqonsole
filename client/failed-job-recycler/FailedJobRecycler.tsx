import * as React from 'react'
import { Link } from 'react-router-dom'
import { FailedJobValue } from '../failed-job/module'
import NewJob from '../new-job/Container'
import { ActionDispatcher } from './Container'
import { pathQueueFailedJob } from '../path'

interface Props {
  queueName?: string
  id?: number
  value: FailedJobValue
  actions: ActionDispatcher
}

export class FailedJobRecycler extends React.Component<Props, {}> {
  componentDidMount() {
    const queueName = this.props.queueName;
    if (queueName === undefined) return

    const id = this.props.id;
    if (id === undefined) return

    const job = this.props.value.job;
    if (job !== undefined) return;

    this.props.actions.asyncGetFailedJob(queueName, id);
  }

  render() {
    const queueName = this.props.queueName === undefined ? '' : this.props.queueName;
    const id = this.props.id === undefined ? 0 : this.props.id;
    const failedJob = this.props.value.job;
    const job = failedJob !== undefined ? failedJob : {
      category: '',
      url: '',
      payload: ''
    };

    let checked = true;

    return (
      <div className="recycler">
        {this.props.value.loadingCount !== 0 ? (
           <div className="loader ball-clip-rotate"><div /></div>
        ) : (
           <NewJob job={job} callback={() => {
               if (checked) this.props.actions.asyncDeleteFailedJob(queueName, id);
           }}>
             <div className="options">
               <input type="checkbox" id="remove-log-item" name="remove-log-item" defaultChecked={checked} onChange={(e)=> {
                   checked = e.target.checked;
               }} />
               <label htmlFor="remove-log-item">
                 Remove log item <Link to={pathQueueFailedJob(queueName, id)}>#{(job as any).jobId}</Link>
               </label>
             </div>
           </NewJob>
        )}
      </div>
    );
  }
}
