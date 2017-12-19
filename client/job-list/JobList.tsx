import * as React from 'react'
import { Link } from 'react-router-dom'
import * as moment from 'moment';
import Time from 'react-time'
import { pathQueueJob } from '../path'
import { JobListValue, Job, JobList as JobListModel } from '../job/module'
import { ActionDispatcher } from './Container'

interface Props {
  queueName?: string
  value: JobListValue
  actions: ActionDispatcher
}

const ElapsedTooLong = 1000 * 60 * 10; // 10 minutes

const hints: { [key:string]: JSX.Element } = {
  deferred: (
    <div className="description">
      <h4>Deferred jobs</h4>
      <p>These jobs are scheduled to run in the future.</p>
      <p>If the time reaches to an instant at which a job is scheduled, the job is moved to the waiting list.</p>
      <p>Deferred jobs and waiting jobs are those which are considered to be in the queue.</p>
    </div>
  ),
  waiting: (
    <div className="description">
      <h4>Waiting jobs</h4>
      <p>These jobs are those which should run now but have not run yet for some reason.  They are waiting because there is no free worker to run them or there is no space to grab them and prepare to run them.</p>
      <p>When a worker or a slot of grabbing buffer becomes free, a waiting job is popped to the grabbed list.</p>
      <p>Waiting jobs and deferred jobs are those which are considered to be in the queue.</p>
    </div>
  ),
  grabbed: (
    <div className="description">
      <h4>Grabbed jobs</h4>
      <p>These jobs are grabbed for preparing to run.  Some of them are running now and others are not.  The maximum number of running jobs is <code>max_workers</code> property of the queue.  There may be more grabbed jobs, which are not running and waiting for a free worker.</p>
      <p>When a grabbed job fails and it does not reach <code>max_retries</code>, it will be moved back to the queue.  If it has no <code>retry_delay</code>, then it is moved to the waiting list, or otherwise to the deferred list.</p>
      <p>Grabbed jobs are not considered to be in the queue but are shown at the end of the queue in this view.</p>
    </div>
  )
};

export class JobList extends React.Component<Props, {}> {
  componentDidMount() {
    const queueName = this.props.queueName;
    if (queueName === undefined) return;

    const jobs: { [key:string]: any } = this.props.value.jobs || {};
    [ 'deferred', 'waiting', 'grabbed' ].forEach((partition) => {
      if (jobs[partition] !== undefined) return;

      this.props.actions.asyncGetJobs(
        queueName,
        partition
      );
    });
  }

  renderJob(queueName: string, job: Job) {
    const deleteJob = (e: React.SyntheticEvent<any>) => {
      if (job === undefined) return;
      if (confirm("Are you sure you want to delete job #" + job.id + "?"))
        this.props.actions.asyncDeleteJob(queueName, job.id);
      e.stopPropagation();
      e.preventDefault();
    };
    const elapsed = moment(new Date()).diff(job.nextTry);
    return [
      <tr className="job" key={['job', queueName, job.id].join('-')}>
        <td className="identity"><Link to={pathQueueJob(queueName, job.id)}>
          <div className="id">#{job.id}</div>
          <div className="category">{job.category}</div>
          <div className="actions">
            <span className="delete" onClick={deleteJob} />
          </div>
          <div className="url">{job.url}</div>
        </Link></td>
        <td className={'status ' + job.status}><Link to={pathQueueJob(queueName, job.id)}>{job.status}</Link></td>
        <td className="timestamp"><Link to={pathQueueJob(queueName, job.id)}>
          <dl>
            <dt>Claimed</dt>
            <dd className="claimed">
              <Time value={job.createdAt} format="YYYY-MM-DD HH:mm:ss" />
            </dd>
            <dt>Scheduled</dt>
            <dd className="scheduled">
              <Time value={job.nextTry} format="YYYY-MM-DD HH:mm:ss" />
            </dd>
            <dt>Elapsed</dt>
            <dd className={'elapsed' + (elapsed > ElapsedTooLong ? ' long' : '')}>{elapsed > 0 ? moment.duration(elapsed).humanize() : 0}</dd>
          </dl>
        </Link></td>
        <td className="tries"><Link to={pathQueueJob(queueName, job.id)}>
          <dl>
            <dt className="count">Tries</dt>
            <dd className="count">
              <span className={'tried' + (job.failCount > 0 ? ' failed' : '')}>{job.failCount}</span>
              /
              <span className="max">{job.maxRetries + 1}</span>
            </dd>
            {job.retryDelay === 0 ? null : <dt className="delay">Delay</dt>}
            {job.retryDelay === 0 ? null : (
               <dd className="delay">
                 <span className="second">{job.retryDelay}</span>
               </dd>
            )}
            {job.timeout === 0 ? null : <dt>Timeout</dt>}
            {job.timeout === 0 ? null : (
               <dd className="timeout">
                 <div className="timeout">
                   <span className="second">{job.timeout}</span>
                 </div>
               </dd>
            )}
          </dl>
        </Link></td>
      </tr>,
      <tr className="job content" key={'job-content-' + job.id}>
        <td className="payload" colSpan={4}><Link to={pathQueueJob(queueName, job.id)}><pre>{JSON.stringify(job.payload)}</pre></Link></td>
      </tr>
    ];
  }

  renderJobs(partition: string, list: JobListModel) {
    const queueName = this.props.queueName;
    if (queueName === undefined)
      return null;

    const jobs = (list || {}).jobs || [];
    const nextCursor = (list || {}).nextCursor || '';
    const hasNext = nextCursor.length > 0;

    const heading = (
      <h3 className="partition">
        <div className="hint">
          {partition.replace(/\b\w/g, l => l.toUpperCase())}

          {hints[partition]}
        </div>
      </h3>
    );

    if (jobs.length <= 0)
      return (
        <div className={partition + ' none'}>
          {heading}
          <div>(no {partition} job)</div>
        </div>
      );

    const loadingCount = this.props.value.partitionLoadingCount[partition] || 0;

    return (
      <div className={partition + (hasNext ? ' has-next' : '')}>
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
           <div className="next" onClick={() => this.props.actions.asyncGetJobs(queueName, partition, nextCursor) }/>
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
        {this.renderJobs('deferred', jobs.deferred)}

        {this.renderJobs('waiting', jobs.waiting)}

        {this.renderJobs('grabbed', jobs.grabbed)}
      </div>
    );

    const loadedOnce = [ 'deferred', 'waiting', 'grabbed' ].every((partition) => {
      const list = ((jobs || {}) as { [key:string]: JobListModel|undefined })[partition];
      return list !== undefined;
    });

    if (this.props.value.loadingCount !== 0 && !loadedOnce) {
      jobList = <div className="loader ball-clip-rotate"><div /></div>;
    }

    return (
      <div>
        <h2>Jobs in queue '{queueName}'</h2>
        {jobList}
      </div>
    );
  }
}
