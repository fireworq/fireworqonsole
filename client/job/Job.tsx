import * as React from 'react'
import { Link } from 'react-router-dom'
import * as moment from 'moment';
import Moment from 'react-moment'
import { JobValue } from './module'
import { ActionDispatcher } from './Container'
import JSON from 'json-bigint'

interface Props {
  queueName?: string
  id?: number
  value: JobValue
  actions: ActionDispatcher
}

const ElapsedTooLong = 1000 * 60 * 10; // 10 minutes

export class Job extends React.Component<Props, {}> {
  componentDidMount() {
    const queueName = this.props.queueName;
    if (queueName === undefined) return

    const id = this.props.id;
    if (id === undefined) return

    const job = this.props.value.job;
    if (job !== undefined) return;

    this.props.actions.asyncGetJob(queueName, id);
  }

  render() {
    const queueName = this.props.queueName
    if (queueName === undefined)
      return null;

    const job = this.props.value.job;
    const elapsed = job ? moment(new Date()).diff(job.nextTry) : 0;

    const deleteJob = (e: React.SyntheticEvent<any>) => {
      if (job === undefined) return;
      if (confirm("Are you sure you want to delete job #" + job.id + "?"))
        this.props.actions.asyncDeleteJob(queueName, job.id);
      e.stopPropagation();
      e.preventDefault();
    };

    let jobInfo = job === undefined ? (
      <div className="job single none">(no job)</div>
    ) : (
      <div className="job single">
        <h3>#{job.id}</h3>
        <dl>
          <dt>Category</dt>
          <dd>{job.category}</dd>

          <dt>URL</dt>
          <dd><span className="url">{job.url}</span></dd>

          <dt>Status</dt>
          <dd>{job.status}</dd>

          <dt>Claimed at</dt>
          <dd><Moment date={job.createdAt} format="YYYY-MM-DD HH:mm:ss" /></dd>

          <dt>Scheduled at</dt>
          <dd><Moment date={job.nextTry} format="YYYY-MM-DD HH:mm:ss" /></dd>

          <dt>Elapsed</dt>
          <dd className={'elapsed' + (elapsed > ElapsedTooLong ? ' long' : '')}>{elapsed > 0 ? moment.duration(elapsed).humanize() : 0}</dd>

          <dt>Tries</dt>
          <dd>
            <span className={'tried' + (job.failCount > 0 ? ' failed' : '')}>{job.failCount}</span>
            /
            <span className="max">{job.maxRetries + 1}</span>
          </dd>

          <dt>Delay</dt>
          <dd>
            <span className="second">{job.retryDelay}</span>
          </dd>

          <dt>Timeout</dt>
          <dd>
            <span className="second">{job.timeout}</span>
          </dd>

          <dt>Payload</dt>
          <dd><pre>{JSON.stringify(job.payload)}</pre></dd>
        </dl>
        <div className="actions">
          <Link className="delete" to="." onClick={deleteJob} />
        </div>
      </div>
    );

    if (this.props.value.loadingCount !== 0) {
      jobInfo = <div className="loader ball-clip-rotate"><div /></div>;
    }

    return (
      <div className="job">
        <h2>Job in queue '{queueName}'</h2>
        {jobInfo}
      </div>
    );
  }
}
