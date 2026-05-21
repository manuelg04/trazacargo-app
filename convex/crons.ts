import { cronJobs } from 'convex/server';
import { internal } from './_generated/api';

const crons = cronJobs();

crons.interval('document deadline notifications', { hours: 1 }, internal.tripDocumentRequirements.queueDocumentDeadlineNotifications);

export default crons;
