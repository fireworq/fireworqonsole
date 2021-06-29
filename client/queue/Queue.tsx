import * as React from 'react'
import { Link } from 'react-router-dom'
import { pathQueueEdit } from '../path'
import { QueueValue } from './module'
import { ActionDispatcher } from './Container'
import Stats from '../stats/Container'
import Node from '../node/Container'
import AutoReload from '../auto-reload/Container'

interface Props {
  queueName?: string
  editing: boolean
  value: QueueValue
  actions: ActionDispatcher
}

export class Queue extends React.Component<Props, {}> {
  componentDidMount() {
    const queueName = this.props.queueName;
    if (queueName === undefined) return;
    if (this.props.value.queue !== undefined) return;

    this.props.actions.asyncGetQueue(queueName);
  }

  render() {
    const queueName = this.props.queueName;
    if (queueName === undefined)
      return null;

    let queue = this.props.value.queue;
    const noQueue = queue === undefined && !this.props.editing;
    if (queue === undefined) {
      queue = {
        name: queueName,
        pollingInterval: 0,
        maxWorkers: 0
      };
    }

    const pollingIntervalValue =
      queue.pollingInterval ? queue.pollingInterval + '' : '';
    const maxWorkersValue =
      queue.maxWorkers ? queue.maxWorkers + '' : '';
    const maxDispatchesPerSecond =
      queue.maxDispatchesPerSecond ? queue.maxDispatchesPerSecond + '' : '';
    const maxBurstSize =
      queue.maxBurstSize ? queue.maxBurstSize + '' : '';

    const deleteQueue = (e: React.SyntheticEvent<any>) => {
      if (confirm("Are you sure you want to delete queue '" + queueName + "'?\n\nNote that all routings related to the queue are also deleted."))
        this.props.actions.asyncDeleteQueue(queueName);
      e.stopPropagation();
      e.preventDefault();
    };

    const pollingIntervalUnit = typeof queue.pollingInterval === 'number' ? <span className="unit">ms</span> : null;

    let queueInfo = noQueue ? <div className="queue none">(no queue)</div> : (
      <div key={'queue-' + queueName}>
        <dl className="queue">
          <dt>Node</dt>
          <dd><Node queueName={queueName} /></dd>

          <dt>Polling interval</dt>
          <dd className="config-value">
            {this.props.editing ?
               <><input name="polling-interval" defaultValue={pollingIntervalValue} placeholder="200" /> {pollingIntervalUnit}</>
            :
               <Link to={pathQueueEdit(queueName)}>{queue.pollingInterval} {pollingIntervalUnit}</Link>
            }
          </dd>

          <dt>Max workers</dt>
          <dd className="config-value">
            {this.props.editing ?
               <input name="max-workers" defaultValue={maxWorkersValue} placeholder="20" />
            :
               <Link to={pathQueueEdit(queueName)}>{queue.maxWorkers}</Link>
            }
          </dd>

          {this.props.editing ?
            <>
              <dt>Max Dispatches Per Second</dt>
              <dd className="config-value">
                <input name="max-dispatches-per-second" defaultValue={maxDispatchesPerSecond} placeholder="1.0" />
              </dd>
            </>
          : queue.maxDispatchesPerSecond ?
            <>
              <dt>Max Dispatches Per Second</dt>
              <dd className="config-value">
                <Link to={pathQueueEdit(queueName)}>{queue.maxDispatchesPerSecond}</Link>
              </dd>
            </>
          : null}

          {this.props.editing ?
            <>
              <dt>Max Burst Size</dt>
              <dd className="config-value">
                <input name="max-burst-size" defaultValue={maxBurstSize} placeholder="5" />
              </dd>
            </>
          : queue.maxBurstSize ?
            <>
              <dt>Max Burst Size</dt>
              <dd className="config-value">
                <Link to={pathQueueEdit(queueName)}>{queue.maxBurstSize}</Link>
              </dd>
            </>
          : null}

          <dt>Stats</dt>
          <dd className="stats chart"><Stats queueName={queueName} autoReload={true} /></dd>
        </dl>
        {this.props.editing ? null : (
           <div className="actions">
             <Link className="edit" to={pathQueueEdit(queueName)} />
             <Link className="delete" to="." onClick={deleteQueue} />
           </div>
        )}
      </div>
    );

    if (this.props.value.loadingCount !== 0) {
      queueInfo = <div className="loader ball-clip-rotate"><div /></div>;
    }

    let submitButton = <button type="submit">Save</button>;
    if (this.props.value.savingCount !== 0) {
      submitButton = <div className="loader ball-clip-rotate"><div /></div>;
    }

    return (
      <div>
        <AutoReload />
        <h2>Queue: {queueName}</h2>
        {this.props.editing ? (
           <form className="queue-edit" action="#" onSubmit={(e) => {
               e.stopPropagation();
               e.preventDefault();
               if (this.props.value.savingCount !== 0) return;

               const formData = new FormData(e.target as HTMLFormElement);
               const mdps = formData.get('max-dispatches-per-second');
               const maxBurstSize = formData.get('max-burst-size')

               this.props.actions.asyncPutQueue(queueName, {
                 polling_interval: parseInt(formData.get('polling-interval') as string || '', 10),
                 max_workers: parseInt(formData.get('max-workers') as string || '', 10),
                 max_dispatches_per_second: mdps ? parseFloat(mdps as string) : undefined,
                 max_burst_size: maxBurstSize ? parseInt(maxBurstSize as string, 10) : undefined,
               });
           }}>
             {queueInfo}
             {submitButton}
           </form>
        ) : queueInfo}

      </div>
    );
  }
}
