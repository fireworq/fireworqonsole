import * as React from 'react'
import { Link } from 'react-router-dom'
import Time from 'react-time'
import { FailedJobValue } from './module'
import { ActionDispatcher } from './Container'
import { pathQueueFailedJobRecycler } from '../path'
import JSON from 'json-bigint'

interface Props {
  queueName?: string
  id?: number
  value: FailedJobValue
  actions: ActionDispatcher
}

export class FailedJob extends React.Component<Props, {}> {
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
    const queueName = this.props.queueName
    if (queueName === undefined)
      return null;

    const job = this.props.value.job;

    const deleteFailedJob = (e: React.SyntheticEvent<any>) => {
      if (job === undefined) return;
      if (confirm("Are you sure you want to delete failed job log item #" + job.jobId + "?"))
        this.props.actions.asyncDeleteFailedJob(queueName, job.id);
      e.stopPropagation();
      e.preventDefault();
    };

    let jobInfo = job === undefined ? (
      <div className="job single none">(no job)</div>
    ) : (
      <div className="job single">
        <h3>#{job.jobId}</h3>
        <dl>
          <dt>Category</dt>
          <dd>{job.category}</dd>

          <dt>URL</dt>
          <dd><span className="url">{job.url}</span></dd>

          <dt>Status</dt>
          <dd>{job.status}</dd>

          <dt>Claimed at</dt>
          <dd><Time value={job.createdAt} format="YYYY-MM-DD HH:mm:ss" /></dd>

          <dt>Failed at</dt>
          <dd><Time value={job.failedAt} format="YYYY-MM-DD HH:mm:ss" /></dd>

          <dt>Tried</dt>
          <dd>{job.failCount}</dd>

          <dt>Payload</dt>
          <dd><pre>{JSON.stringify(job.payload)}</pre></dd>

          <dt>HTTP status</dt>
          <dd><span className="http-status">{job.result.code}</span></dd>

          <dt>HTTP body</dt>
          <dd><pre>{job.result.message}</pre></dd>
        </dl>
        <div className="actions">
          <Link className="recycle" to={pathQueueFailedJobRecycler(queueName, job.id || 0)} />
          <Link className="delete" to="." onClick={deleteFailedJob} />
        </div>
      </div>
    );

    if (this.props.value.loadingCount !== 0) {
      jobInfo = <div className="loader ball-clip-rotate"><div /></div>;
    }

    return (
      <div className="job">
        <h2>Failed job in queue '{queueName}'</h2>
        {jobInfo}
      </div>
    );
  }
}
