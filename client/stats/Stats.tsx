import * as moment from 'moment';
import * as React from 'react'
import { Link } from 'react-router-dom'
import { pathQueueJobs, pathQueueFailures } from '../path'
import { StatsValue } from './module'
import { ActionDispatcher } from './Container'

const maxChartWidth: number = 480;

interface Props {
  queueName?: string
  value: StatsValue
  actions?: ActionDispatcher
  autoReload?: boolean
}

const DelayTooLong = 1000 * 60 * 30; // 30 minutes

export class Stats extends React.Component<Props, {}> {
  reloadingTimer: number|undefined

  startAutoReload(props: Props) {
    const queueName = props.queueName;
    if (queueName === undefined) return;

    const actions = props.actions;
    if (actions === undefined) return;

    if (this.reloadingTimer !== undefined) return;
    this.reloadingTimer = window.setInterval(() => {
      actions.asyncGetStats(queueName);
    }, 500);
  }

  stopAutoReload() {
    if (this.reloadingTimer === undefined) return;
    clearInterval(this.reloadingTimer);
    this.reloadingTimer = undefined;
  }

  componentDidMount() {
    const queueName = this.props.queueName;
    if (queueName === undefined) return;

    const actions = this.props.actions;
    if (actions === undefined) return;

    actions.asyncGetStats(queueName);
  }

  componentWillUnmount() {
    this.stopAutoReload();
  }

  componentWillReceiveProps(props: Props) {
    if (props.autoReload !== true) {
      this.stopAutoReload();
      return;
    }
    this.startAutoReload(props);
  }

  render() {
    const queueName = this.props.queueName;
    if (queueName === undefined)
      return null;

    const loadedOnce = this.props.value.stats !== undefined;
    const loadingCount = this.props.value.loadingCount || 0;
    if (loadingCount !== 0 && !loadedOnce)
      return <div className="loader ball-clip-rotate"><div /></div>;

    const stats = this.props.value.stats;
    if (stats === undefined || Object.keys(stats).length <= 0)
      return <div className="none">(no stats)</div>;

    const pushed = stats.totalPushes || 0;
    const grabbed = stats.totalPops || 0;
    const completed = stats.totalCompletes || 0;
    const failed = stats.totalFailures || 0;
    const ok = stats.totalSuccesses || 0;
    const pushedPerSecond = stats.pushesPerSecond || 0;
    const grabbedPerSecond = stats.popsPerSecond || 0;
    const elapsed = Math.round(completed > 0 ? stats.totalElapsed / completed : 0);

    const delay = (stats.delay || 0) * 1000;

    const chartWidth = Math.min(pushed, maxChartWidth);
    const grabbedPercentage = (pushed > 0 ? grabbed / pushed : 0) * 100;
    const completedPercentage = (grabbed > 0 ? completed / grabbed : 0) * 100;
    const okPercentage = ((ok + failed) > 0 ? ok / (ok + failed) : 0) * 100;
    const failedPercentage = ((ok + failed) > 0 ? failed / (ok + failed) : 0) * 100;
    return (
      <div>
        <dl className="delay">
          <dt>Delay</dt>
          <dd className={delay > DelayTooLong ? ' long' : ''}>{moment.duration(delay).humanize()}</dd>
        </dl>

        <div className="velocity">
          <div className="per-second" title="pushed jobs">{pushedPerSecond} /s</div>
          <div className="per-second" title="grabbed jobs">{grabbedPerSecond} /s</div>
          <div className="elapsed" title="elapsed time per completed job">{elapsed} ms avg.</div>
        </div>

        <div className="pushed" style={{ width: chartWidth + 'px' }} key={'stats-' + queueName}>
          <Link to={pathQueueJobs(queueName)}>
            <div className="label">
              <div className="total">{pushed} jobs</div>
            </div>
          </Link>
          <div className="grabbed" style={{ width: grabbedPercentage + '%' }}>
            <Link to={pathQueueJobs(queueName)}>
              <div className="label">
                <div className="total">{grabbed} grabbed</div>
              </div>
            </Link>
            <Link to={pathQueueFailures(queueName)}>
              <div className="completed" style={{ width: completedPercentage + '%' }}>
                <div className="label">
                  <div className="ok" style={{ width: okPercentage + '%' }}>{ok} ok</div>
                  <div className="failed" style={{ width: failedPercentage + '%' }}>{failed} failed</div>
                </div>
                <div className="ok" style={{ flexGrow: ok }}></div>
                <div className="failed" style={{ flexGrow: failed }}></div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    );
  }
}
