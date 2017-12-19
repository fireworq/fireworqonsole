import * as React from 'react'
import { Switch } from 'react-router'
import { Link, Route } from 'react-router-dom'
import { pathQueue, pathQueueEdit, pathQueueJobs, pathQueueFailures } from './path'
import Welcome from './welcome/Container'
import Credits from './credits/Container'
import VersionList from './version-list/Container'
import SettingList from './setting-list/Container'
import QueueList from './queue-list/Container'
import RoutingList from './routing-list/Container'
import NewJob from './new-job/Container'
import Queue from './queue/Container'
import JobList from './job-list/Container'
import Job from './job/Container'
import FailedJobList from './failed-job-list/Container'
import FailedJob from './failed-job/Container'
import FailedJobRecycler from './failed-job-recycler/Container'
import Routing from './routing/Container'
import NotFound from './NotFound'

export function Routes() {
  return (
    <div>
      <header>
        <h1><Link to='/'><img src="/images/logo-white.png" alt="Fireworq" title="Fireworq" /></Link></h1>
        <nav><ul>
          <li><Link to='/nodes' >Nodes</Link></li>
          <li><Link to='/queues' >Queues</Link></li>
          <li><Link to='/routings' >Routings</Link></li>
          <li><Link to='/job' >New Job</Link></li>
          <li className="external"><a href="https://github.com/fireworq/fireworq">GitHub</a></li>
        </ul></nav>
      </header>
      <div className="main">
        <Switch>
          <Route exact={true} path='/' component={Welcome} />
          <Route exact={true} path='/about' component={About} />
          <Route exact={true} path='/nodes' component={NodeList} />
          <Route exact={true} path='/queues' component={QueueList} />
          <Route exact={true} path='/queue/:queueName' component={QueueTabs} />
          <Route exact={true} path='/queue/:queueName/edit' component={QueueTabs} />
          <Route exact={true} path='/queue/:queueName/jobs' component={QueueTabs} />
          <Route exact={true} path='/queue/:queueName/job/:id' component={QueueTabs} />
          <Route exact={true} path='/queue/:queueName/failed' component={QueueTabs} />
          <Route exact={true} path='/queue/:queueName/failed/:id' component={QueueTabs} />
          <Route exact={true} path='/queue/:queueName/recycle/:id' component={QueueTabs} />
          <Route exact={true} path='/routings' component={RoutingList} />
          <Route exact={true} path='/routing/:jobCategory' component={Routing} />
          <Route exact={true} path='/routing/:jobCategory/edit' component={RoutingEdit} />
          <Route exact={true} path='/job' component={NewJob} />
          <Route component={NotFound}/>
        </Switch>
      </div>
      <footer>
        <Link to="/about">About</Link>
      </footer>
    </div>
  )
};

export function About() {
  return (
    <div className="about">
      <h2>About Fireworqonsole</h2>

      <h3>Version</h3>

      <VersionList showConsoleVersion={true} hideNodeVersions={true} />

      <h3>Repository</h3>
      <a href="https://github.com/fireworq/fireworqonsole">https://github.com/fireworq/fireworqonsole</a>

      <Credits />
    </div>
  );
}

export function NodeList() {
  return (
    <div className="nodes">
      <h2>Versions</h2>

      <VersionList showConsoleVersion={true} />

      <h2>Settings</h2>
      <SettingList />
    </div>
  );
}

interface QueueTabsProps {
  match: {
    params: { queueName: string },
    path: string,
    url: string
  }
}

export class QueueTabs extends React.Component<QueueTabsProps, {}> {
  render() {
    const queueName = decodeURIComponent(this.props.match.params.queueName);

    const path = decodeURIComponent(this.props.match.url);
    const queuePath = pathQueue(queueName);
    const queueEditPath = pathQueueEdit(queueName);
    const jobsPath = pathQueueJobs(queueName);
    const failedJobsPath = pathQueueFailures(queueName);

    const classQueue = (path == queuePath || path == queueEditPath) ? 'selected' : '';
    const classJobs = (path.startsWith(jobsPath.slice(0, -1))) ? 'selected' : '';
    const classFailedJobs = (path.startsWith(failedJobsPath)) ? 'selected' : '';

    return (
      <div className="queue-page">
        <nav className="queue-tabs"><ul>
          <Link to={queuePath}><li className={classQueue}>Queue</li></Link>
          <Link to={jobsPath}><li className={classJobs}>Jobs</li></Link>
          <Link to={failedJobsPath}><li className={classFailedJobs}>Failures</li></Link>
        </ul></nav>
        <Switch>
          <Route exact={true} path='/queue/:queueName' component={Queue} />
          <Route exact={true} path='/queue/:queueName/edit' component={QueueEdit} />
          <Route exact={true} path='/queue/:queueName/jobs' component={JobList} />
          <Route exact={true} path='/queue/:queueName/job/:id' component={Job} />
          <Route exact={true} path='/queue/:queueName/failed' component={FailedJobList} />
          <Route exact={true} path='/queue/:queueName/failed/:id' component={FailedJob} />
          <Route exact={true} path='/queue/:queueName/recycle/:id' component={FailedJobRecycler} />
          <Route component={NotFound}/>
        </Switch>
      </div>
    );
  }
}

function QueueEdit(props: any) {
  const queueName = decodeURIComponent(props.match.params.queueName);
  return (
    <Queue queueName={queueName} editing={true} />
  );
};

function RoutingEdit(props: any) {
  const jobCategory = decodeURIComponent(props.match.params.jobCategory);
  return (
    <Routing jobCategory={jobCategory} editing={true} />
  );
};
