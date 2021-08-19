import dotenv from 'dotenv';

dotenv.config();

export default {
  sqs: process.env.AWS_SQS_URL || 'http://localhost:4568/000000000000/store-team_queue',
  region: process.env.AWS_REGION || 'us-west-1',
};