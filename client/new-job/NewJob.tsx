import * as React from 'react'
import { NewJob } from '../job/module'
import { ActionDispatcher } from './Container'
import JSON from 'json-bigint'

interface Props {
  job?: NewJob
  callback?: () => void
  children: React.Component[]
  savingCount: number
  actions: ActionDispatcher
}

export function NewJob(props: Props) {
  const job = props.job || {
    category: '',
    url: '',
    payload: '',
  };
  const payload =
    typeof job.payload === 'string' ? job.payload : JSON.stringify(job.payload);
  const runAfterValue = job.runAfter === undefined ? '' : job.runAfter+'';
  const timeoutValue = job.timeout === undefined ? '' : job.timeout+'';
  const retryDelayValue = job.retryDelay === undefined ? '' : job.retryDelay+'';
  const maxRetriesValue = job.maxRetries === undefined ? '' : job.maxRetries+'';

  let submitButton = <button type="submit">Push</button>;
  if (props.savingCount !== 0) {
    submitButton = <div className="loader ball-clip-rotate"><div /></div>;
  }

  return (
    <form className="new-job" action="#" onSubmit={(e) => {
        e.stopPropagation();
        e.preventDefault();
        if (props.savingCount !== 0) return;

        const formData = new FormData(e.target as HTMLFormElement);
        const url = formData.get('url') as string;
        let payload = formData.get('payload') as string;
        try {
          const json = JSON.parse(payload)
          payload = json;
        } catch { /* ignore */ }

        props.actions.asyncPutNewJob({
          category: formData.get('category') as string,
          url: url,
          payload: payload,
          run_after: parseInt(formData.get('run-after') as string || '', 10),
          timeout: parseInt(formData.get('timeout') as string || '', 10),
          retry_delay: parseInt(formData.get('retry-delay') as string || '', 10),
          max_retries: parseInt(formData.get('max-retries') as string || '', 10)
        }, props.callback);
    }}>
      <h2>New Job</h2>
      <dl>
        <dt>Category</dt>
        <dd><input name="category" defaultValue={job.category} /></dd>
        <dt>URL</dt>
        <dd><input name="url" defaultValue={job.url} placeholder="http://example.com/work" /></dd>
        <dt>Payload</dt>
        <dd><textarea name="payload" defaultValue={payload} placeholder="JSON or string" /></dd>
        <dt>Run after</dt>
        <dd><input name="run-after" defaultValue={runAfterValue} placeholder="0" /><span className="unit">sec.</span></dd>
        <dt>Timeout</dt>
        <dd><input name="timeout" defaultValue={timeoutValue} placeholder="0" /><span className="unit">sec.</span></dd>
        <dt>Retry delay</dt>
        <dd><input name="retry-delay" defaultValue={retryDelayValue} placeholder="0" /><span className="unit">sec.</span></dd>
        <dt>Max retries</dt>
        <dd><input name="max-retries" defaultValue={maxRetriesValue} placeholder="0" /></dd>
      </dl>
      {props.children}
      {submitButton}
    </form>
  );
}
