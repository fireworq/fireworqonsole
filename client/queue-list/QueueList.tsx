import * as React from 'react'
import { Link } from 'react-router-dom'
import { pathQueue, pathQueueEdit, pathQueueJobs, pathQueueFailures } from '../path'
import { QueueListValue } from '../queue/module'
import { ActionDispatcher } from './Container'
import Node from '../node/Container'
import AutoReload from '../auto-reload/Container'
import { Stats } from '../stats/Stats'

interface Props {
  value: QueueListValue
  actions: ActionDispatcher
  autoReload: boolean
}

export class QueueList extends React.Component<Props, {}> {
  reloadingTimer: number|undefined

  startAutoReload(props: Props) {
    if (this.reloadingTimer !== undefined) return;
    this.reloadingTimer = window.setInterval(() => {
      props.actions.asyncGetQueueStats();
    }, 500);
  }

  stopAutoReload() {
    if (this.reloadingTimer === undefined) return;
    clearInterval(this.reloadingTimer);
    this.reloadingTimer = undefined;
  }

  componentDidMount() {
    this.props.actions.asyncGetQueueStats();

    if (!this.props.value.nodesLoaded) {
      this.props.actions.asyncGetNodes();
    }

    if (this.props.value.queueListLoaded) return;
    this.props.actions.asyncGetQueueList();
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
    const queues = Object.values(this.props.value.queues).sort((a, b) => {
      return a.name.localeCompare(b.name);
    }).map((queue) => {
      const stats = this.props.value.stats[queue.name];
      const totalWorkers = stats ? stats.totalWorkers : 0;
      const idleWorkers = stats ? stats.idleWorkers : 0;
      const runningWorkers = stats ? totalWorkers - idleWorkers : 0;

      const chart = stats === undefined ? (
        <div className="stats chart"></div>
      ) : (
        <div className="stats chart">
          <Stats value={{stats: stats}} queueName={queue.name} />
        </div>
      );

      const deleteQueue = (e: React.SyntheticEvent<any>) => {
        if (confirm("Are you sure you want to delete queue '" + queue.name + "'?\n\nNote that all routings related to the queue are also deleted."))
          this.props.actions.asyncDeleteQueue(queue.name);
        e.stopPropagation();
        e.preventDefault();
      };

      return (
        <div className="queue" key={'queue-item-' + queue.name}>
          <Link to={pathQueue(queue.name)}><div className="queue-item">
            <div className="queue-name">{queue.name}</div>
            <Node queueName={queue.name} />
          </div></Link>

          <div className="actions">
            <Link className="edit" to={pathQueueEdit(queue.name)} />
            <Link className="delete" to="." onClick={deleteQueue} />
          </div>

          <div className="links">
            <Link className="jobs" to={pathQueueJobs(queue.name)}>Jobs</Link>
            <Link className="failures" to={pathQueueFailures(queue.name)}>Failures</Link>
          </div>

          <Link to={pathQueueEdit(queue.name)}><dl className="config">
            {!queue.maxDispatchesPerSecond ? (
              <>
                <dt>polling interval</dt>
                <dd>{queue.pollingInterval} {typeof queue.pollingInterval === 'number' ? 'ms' : null}</dd>
              </>
            ) : null}

            <dt>workers</dt>
            <dd><span title="running">{runningWorkers}</span> / <span title="total">{totalWorkers}</span></dd>

            {queue.maxDispatchesPerSecond ? (
              <>
                <dt>max dispatches per second</dt>
                <dd>{queue.maxDispatchesPerSecond}</dd>

                <dt>max burst size</dt>
                <dd>{queue.maxBurstSize}</dd>
              </>
            ) : null}

          </dl></Link>

          {chart}
        </div>
      );
    });
    const noQueue = !queues.length && this.props.value.listLoadingCount === 0;
    return (
      <div className="queue-list">
        <AutoReload />
        <h2>Queues</h2>

        {(this.props.value.listLoadingCount === 0) ? null :
         <div className="loader ball-clip-rotate"><div /></div>}
        {noQueue ? (
           <div className="queue none">(no queue)</div>
        ): queues}

        <form className="new-queue" action="#" onSubmit={(e) => {
            const formData = new FormData(e.target as HTMLFormElement);
            const queueName = formData.get('queue-name') as string || '';
            this.props.actions.newQueue(queueName);
            e.stopPropagation()
            e.preventDefault()
        }}>
          <label><span className="label-text">New</span>
            <input className="new-queue-name" name="queue-name" defaultValue="" placeholder=" queue name" />
            <button type="submit">Add</button>
          </label>
        </form>
      </div>
    );
  }
}
