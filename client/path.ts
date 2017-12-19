export function pathQueue(queueName: string): string {
  return '/queue/' + encodeURIComponent(queueName);
}

export function pathQueueEdit(queueName: string): string {
  return '/queue/' + encodeURIComponent(queueName) + '/edit';
}

export function pathQueueJobs(queueName: string): string {
  return '/queue/' + encodeURIComponent(queueName) + '/jobs';
}

export function pathQueueJob(queueName: string, id: number): string {
    return '/queue/' + encodeURIComponent(queueName) + '/job/' + id;
}

export function pathQueueFailures(queueName: string): string {
  return '/queue/' + encodeURIComponent(queueName) + '/failed';
}

export function pathQueueFailedJob(queueName: string, id: number): string {
    return '/queue/' + encodeURIComponent(queueName) + '/failed/' + id;
}

export function pathQueueFailedJobRecycler(queueName: string, id: number): string {
    return '/queue/' + encodeURIComponent(queueName) + '/recycle/' + id;
}

export function pathRouting(jobCategory: string): string {
  return '/routing/' + encodeURIComponent(jobCategory);
}

export function pathRoutingEdit(jobCategory: string): string {
  return '/routing/' + encodeURIComponent(jobCategory) + '/edit';
}

export function decode(str: string|undefined): string|undefined {
  return str === undefined ? str : decodeURIComponent(str);
}
