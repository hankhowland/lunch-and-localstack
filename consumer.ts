import { Consumer } from 'sqs-consumer';
import AWS from 'aws-sdk';

export const eventHandlers: Record<
  string,
  (body: Record<string, unknown>) => Promise<void>
> = {
  'chad.joke.tell': async (body: unknown): Promise<void> => {
    console.log('\n\nSTORE TEAM SERVICE:\nchad.joke.tell message recieved...');
    console.log('body:', body);
    publishEvent("brent.chuckle.emit", JSON.stringify(body));
    return;
  },
  'brent.chuckle.emit': async (body: unknown): Promise<void> => {
    console.log('\n\nSTORE TEAM SERVICE:\nbrent.chuckle.emit message recieved...');
    console.log('body:', body);
    return;
  },
};

/* creates a consumer that listens to queueUrl */
export function createConsumer({
  queueUrl,
  region,
  messageHandler,
}: CreateConsumerOptions): void {
  AWS.config.update({ region });

  const app = Consumer.create({
    queueUrl,
    heartbeatInterval: 20, // must be lower than visibilityTimeout
    visibilityTimeout: 30,
    handleMessage: async (message) => {
      if (!message.Body) {
        console.log('No Body from message');
        throw new Error('No Body');
      }

      if (!message.ReceiptHandle) {
        console.log('No ReceiptHandle from message');
        throw new Error('No ReceiptHandle');
      }

      try {
        // parse the body of the message
        const messageBody = getMessageBody(message);

        // pass valid message to provided message handler
        await messageHandler({
          action: messageBody['detail-type'],
          body: messageBody.detail,
          identifier: message.ReceiptHandle,
        });
      } catch (error) {
        console.log('Unable to create consumer');
        throw error;
      }
    },
  });

  app.on('error', (error) => {
    console.log('consumer error');
    throw error;
  });

  app.on('processing_error', (error) => {
    console.log('processing error');
  });

  console.log(`consumer is listening to the queue at: ${queueUrl}...`)

  return app.start();
}

interface CreateConsumerOptions {
  queueUrl: string;
  region: string;
  messageHandler: (message: IndexQueueMessage) => Promise<void> | void;
}

interface IndexQueueMessage {
  action: string;
  body: Record<string, unknown>;
  identifier: string;
}

interface IndexQueueMessageBody {
  'detail-type': IndexQueueMessageType;
  detail: Record<string, unknown>;
}

type IndexQueueMessageType = 'products.product.create' | '';

function getMessageBody(message: AWS.SQS.Message): IndexQueueMessageBody {
  try {
    return JSON.parse(message.Body || '');
  } catch (error) {
    console.log('Received non-JSON message body on the queue');
    throw new Error(
      `Received non-JSON message body on the queue: ${message.Body}`,
    );
  }
}

let eventBridge: AWS.EventBridge;

export async function publishEvent(key: string, body: string): Promise<void> {
    if (!eventBridge) {
      if (process.env['AWS_EVENT_BUS_URL']) {
        console.log(`publishing "${key}" to ${process.env['AWS_EVENT_BUS_URL']}...`)
        // using local event bus
        const localUrl = { endpoint: process.env['AWS_EVENT_BUS_URL'] };
        eventBridge = new AWS.EventBridge(localUrl);
      } else {
        // using prod event bus
        eventBridge = new AWS.EventBridge();
      }
    }
  
    await eventBridge
      .putEvents({
        Entries: [
          {
            Detail: body,
            DetailType: key,
            EventBusName: 'sibi-bus',
            Resources: [],
            Source: 'products-service',
          },
        ],
      })
      .promise();
  }
