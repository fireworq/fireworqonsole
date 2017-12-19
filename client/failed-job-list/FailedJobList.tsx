import * as React from 'react'
import { Link } from 'react-router-dom'
import Time from 'react-time'
import { pathQueueFailedJob } from '../path'
import { FailedJobListValue, FailedJob, FailedJobList as FailedJobListModel } from '../failed-job/module'
import { ActionDispatcher } from './Container'
import { pathQueueFailedJobRecycler } from '../path'
import { history } from '../Index'

interface Props {
  queueName?: string
  value: FailedJobListValue
  actions: ActionDispatcher
}

export class FailedJobList extends React.Component<Props, {}> {
  componentDidMount() {
    const queueName = this.props.queueName;
    if (queueName === undefined) return

    const jobs = this.props.value.jobs;
    if (jobs !== undefined) return;

    this.props.actions.asyncGetFailedJobs(queueName);
  }

  renderJob(queueName: string, job: FailedJob) {
    const recycleFailedJob = (e: React.SyntheticEvent<any>) => {
      if (job === undefined) return;
      history.push(pathQueueFailedJobRecycler(queueName, job.id));
      e.stopPropagation();
      e.preventDefault();
    };
    const deleteFailedJob = (e: React.SyntheticEvent<any>) => {
      if (job === undefined) return;
      if (confirm("Are you sure you want to delete failed job log item #" + job.jobId + "?"))
        this.props.actions.asyncDeleteFailedJob(queueName, job.id);
      e.stopPropagation();
      e.preventDefault();
    };
    return [
      <tr className="job" key={['failed-job', queueName, job.id].join('-')}>
        <td className="identity"><Link to={pathQueueFailedJob(queueName, job.id)}>
          <div className="id">#{job.jobId}</div>
          <div className="category">{job.category}</div>
          <div className="actions">
            <span className="recycle" onClick={recycleFailedJob} />
            <span className="delete" onClick={deleteFailedJob} />
          </div>
          <div className="url">{job.url}</div>
        </Link></td>
        <td className={'status ' + job.status}><Link to={pathQueueFailedJob(queueName, job.id)}>{job.status}</Link></td>
        <td className="timestamp"><Link to={pathQueueFailedJob(queueName, job.id)}>
          <dl>
            <dt>Claimed</dt>
            <dd className="claimed">
              <Time value={job.createdAt} format="YYYY-MM-DD HH:mm:ss" />
            </dd>
            <dt>Failed</dt>
            <dd className="failed">
              <Time value={job.failedAt} format="YYYY-MM-DD HH:mm:ss" />
            </dd>
            <dt>Tried</dt>
            <dd className="tried">{job.failCount}</dd>
          </dl>
        </Link></td>
      </tr>,
      <tr className="job content" key={['failed-job-content', job.id, job.failedAt.valueOf()].join('-')}>
        <td className="result" colSpan={2}><Link to={pathQueueFailedJob(queueName, job.id)}>
          <dl>
            <dt>HTTP</dt>
            <dd className="http-status">{job.result.code}</dd>
            <dt>Message</dt>
            <dd className="message"><pre>{job.result.message}</pre></dd>
          </dl>
        </Link></td>
        <td className="payload"><Link to={pathQueueFailedJob(queueName, job.id)}><pre>{JSON.stringify(job.payload)}</pre></Link></td>
      </tr>
    ];
  }

  renderJobs(list: FailedJobListModel) {
    const queueName = this.props.queueName;
    if (queueName === undefined)
      return null;

    const jobs = (list || {}).jobs || [];
    const nextCursor = (list || {}).nextCursor || '';
    const hasNext = nextCursor.length > 0;

    const heading = (
      <h3 className="partition">Failed</h3>
    );

    if (jobs.length <= 0)
      return (
        <div className="failed none">
          {heading}
          <div>(no failed job)</div>
        </div>
      );

    const loadingCount = this.props.value.loadingCount || 0;

    return (
      <div className={'failed' + (hasNext ? ' has-next' : '')}>
        {heading}
        <table className="list">
          <tbody>
            {jobs.map((j) => this.renderJob(queueName, j))}
          </tbody>
        </table>
        {loadingCount === 0 ? null : (
           <div className="loader ball-clip-rotate"><div /></div>
        )}
        {hasNext ? (
           <div className="next" onClick={() => this.props.actions.asyncGetFailedJobs(queueName, nextCursor) }/>
        ) : null}
      </div>
    );
  }

  render() {
    const queueName = this.props.queueName
    if (queueName === undefined)
      return null;

    const jobs = this.props.value.jobs;
    let jobList = jobs === undefined ? <div className="jobs none">(no jobs)</div> : (
      <div className="jobs">
        {this.renderJobs(jobs)}
      </div>
    );

    const loadedOnce = jobs !== undefined;

    if (this.props.value.loadingCount !== 0 && !loadedOnce) {
      jobList = <div className="loader ball-clip-rotate"><div /></div>;
    }

    return (
      <div>
        <h2>Failed jobs in queue '{queueName}'</h2>
        {jobList}
      </div>
    );
  }
}
