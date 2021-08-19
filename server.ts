import * as Consumer from './consumer';

import config from './config';

function listen({ queueUrl, region }: ConsumerOptions): void {
    Consumer.createConsumer({
      queueUrl,
      region,
      messageHandler: async (message) => {
        try {
          await Consumer.eventHandlers[message.action](message.body);
        } catch (error) {
          console.log('Products queue messageHandler failed');
          throw error;
        }
      },
    });
  }
  
interface ConsumerOptions {
    queueUrl: string;
    region: string;
}

listen({ queueUrl: config.sqs, region: config.region });
