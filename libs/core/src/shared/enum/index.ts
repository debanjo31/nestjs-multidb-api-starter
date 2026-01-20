export enum QueueTasks {
  UPLOAD_PHOTO = 'task.upload.photo',
  SEND_EMAIL = 'task.send.email',
  SEND_SMS = 'task.send.sms',
  SEND_NOTIFICATION = 'task.send.notification',
  PING = 'task.send.ping',
}

export enum WorkerQueue {
  PROCESS_WORK = 'wevied.jobs.process.work',
}

export enum AppStatus {
  WORKER_ERROR = 1000,
}

export enum ProfileType {
  User = 'User',
  Merchant = 'Merchant',
  Admin = 'Admin',
}
